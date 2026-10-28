<script lang="ts">
import { animate } from 'motion/mini';
import { flushSync, onMount } from 'svelte';
import { animateScene, easeOut, motionAllowed } from '#lib/motion/scene.js';
import { captureSharedArt } from '#lib/motion/shared-art.js';
import { afterNavigate, beforeNavigate, onNavigate } from '$app/navigation';

let { active = $bindable(false) }: { active?: boolean } = $props();
let generation = 0;
let initialized = false;
let cleanupScene = () => {};
let cancelPlayback = () => {};
let releaseNavigation = () => {};

const chapterIndex = (path: string) =>
	path.startsWith('/about/')
		? 1
		: path.startsWith('/work/')
			? 2
			: ['/', '/about', '/work', '/contact'].indexOf(path);

function setupScene(entrance: boolean) {
	cleanupScene();
	const root = document.querySelector<HTMLElement>('.site-shell');
	cleanupScene = root ? animateScene(root, entrance) : () => {};
}

function stop() {
	// Invalidate completion handlers before releasing an interrupted navigation.
	generation++;
	releaseNavigation();
	releaseNavigation = () => {};
	cancelPlayback();
	cancelPlayback = () => {};
	active = false;
	cleanupScene();
	cleanupScene = () => {};
}

beforeNavigate(({ from, to }) => {
	if (from?.url.pathname !== to?.url.pathname) stop();
});

afterNavigate(() => {
	if (!active) setupScene(!initialized);
	initialized = true;
});

onNavigate((navigation) => {
	const from = navigation.from?.url.pathname;
	const to = navigation.to?.url.pathname;
	if (!from || !to || from === to) return;
	stop();
	const fromChapter = chapterIndex(from);
	const toChapter = chapterIndex(to);
	const main = document.querySelector<HTMLElement>('#main');
	if (!main || fromChapter < 0 || toChapter < 0 || !motionAllowed()) return;

	const shared =
		(from === '/' && to === '/about') || (from === '/about' && to === '/')
			? captureSharedArt(main)
			: undefined;
	const current = generation;
	const direction =
		navigation.type === 'popstate' && navigation.delta
			? Math.sign(navigation.delta)
			: toChapter >= fromChapter
				? 1
				: -1;
	const originalOpacity = main.style.opacity;
	const originalTransform = main.style.transform;
	const restore = () => {
		main.style.opacity = originalOpacity;
		main.style.transform = originalTransform;
	};
	active = true;
	// Clear a pending network skeleton before animating the actual page content.
	flushSync();

	// Animate real content rather than snapshots: the fixed header stays live
	// and a second click can cancel this transition immediately.
	const outgoing = animate(
		main,
		{ opacity: 0, transform: `translateY(${-direction * 18}px)` },
		{ duration: 0.14, ease: easeOut }
	);
	cancelPlayback = () => {
		outgoing.cancel();
		shared?.cancel();
		restore();
	};

	return new Promise<() => void>((resolve) => {
		let released = false;
		const release = () => {
			if (released) return;
			released = true;
			clearTimeout(watchdog);
			resolve(() => {
				if (current !== generation) return;
				releaseNavigation = () => {};
				outgoing.cancel();
				restore();
				shared?.hideDestination();
				// Measure after SvelteKit has restored the new page's scroll position.
				main.style.opacity = '0';
				const frame = requestAnimationFrame(() => {
					if (current !== generation) return;
					restore();
					const artworkFinished = shared?.play();
					const incoming = animate(
						main,
						{
							opacity: [0, 1],
							transform: [`translateY(${shared ? 0 : direction * 24}px)`, 'translateY(0px)']
						},
						{ duration: shared ? 0.46 : 0.32, ease: shared ? 'easeInOut' : easeOut }
					);
					cancelPlayback = () => {
						incoming.cancel();
						shared?.cancel();
						restore();
					};
					void Promise.all([Promise.resolve(incoming), artworkFinished]).then(() => {
						if (current !== generation) return;
						cancelPlayback();
						cancelPlayback = () => {};
						active = false;
						setupScene(false);
					});
				});
				cancelPlayback = () => {
					cancelAnimationFrame(frame);
					shared?.cancel();
					restore();
				};
			});
		};
		// A paused tab or animation must never keep the router waiting indefinitely.
		const watchdog = setTimeout(release, 220);
		releaseNavigation = release;
		if (shared) release();
		else void outgoing.then(release, release);
	});
});

onMount(() => {
	const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
	const preference = () => {
		stop();
		setupScene(false);
	};
	const visibility = () => {
		if (document.hidden) stop();
		else setupScene(false);
	};
	window.addEventListener('keydown', stop);
	window.addEventListener('resize', stop);
	document.addEventListener('visibilitychange', visibility);
	reducedMotion.addEventListener('change', preference);
	return () => {
		stop();
		window.removeEventListener('keydown', stop);
		window.removeEventListener('resize', stop);
		document.removeEventListener('visibilitychange', visibility);
		reducedMotion.removeEventListener('change', preference);
	};
});
</script>
