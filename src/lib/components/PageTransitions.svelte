<script lang="ts">
import { animate } from 'motion/mini';
import { flushSync, onMount } from 'svelte';
import { capturePageSlide, pageSlideDuration } from '#lib/motion/page-slide.js';
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

	const aboutSlide = fromChapter === 1 && toChapter === 1;
	const aboutPortfolio =
		(fromChapter === 1 && to === '/work') || (from === '/work' && toChapter === 1);
	const projectDetail =
		(from === '/work' && to.startsWith('/work/')) || (from.startsWith('/work/') && to === '/work');
	const shared =
		(from === '/' && to === '/about') || (from === '/about' && to === '/')
			? captureSharedArt(main)
			: projectDetail
				? captureSharedArt(main, { backdrop: false })
				: aboutPortfolio
					? captureSharedArt(main, { artwork: 'ornament' })
					: aboutSlide
						? captureSharedArt(main, { artwork: 'ornament', backdrop: false })
						: undefined;
	const slideDirection =
		navigation.type === 'popstate' && navigation.delta
			? navigation.delta < 0
				? 1
				: -1
			: to === '/about' || to === '/work'
				? 1
				: -1;
	const slide = aboutSlide || projectDetail ? capturePageSlide(main, slideDirection) : undefined;
	const current = generation;
	let preview: HTMLElement | null = null;
	let previewOpacity = '';
	let previewInert = false;
	let previewAnimation: ReturnType<typeof animate> | undefined;
	const restorePreview = () => {
		previewAnimation?.cancel();
		if (preview) {
			preview.style.opacity = previewOpacity;
			preview.inert = previewInert;
		}
		preview = null;
	};
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

	// The fixed header stays live, and a second click can cancel any transition.
	const outgoing = slide
		? undefined
		: animate(
				main,
				{ opacity: 0, transform: `translateY(${-direction * 18}px)` },
				{ duration: 0.14, ease: easeOut }
			);
	cancelPlayback = () => {
		outgoing?.cancel();
		shared?.cancel();
		restorePreview();
		slide?.cancel();
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
				outgoing?.cancel();
				restore();
				shared?.hideDestination();
				if (fromChapter === 1 && to === '/work') {
					const candidate = main.querySelector<HTMLElement>('[data-after-ornament]');
					if (candidate?.offsetWidth) {
						preview = candidate;
						previewOpacity = candidate.style.opacity;
						previewInert = candidate.inert;
						candidate.style.opacity = '0';
						candidate.inert = true;
					}
				}
				// Measure after SvelteKit has restored the new page's scroll position.
				main.style.opacity = '0';
				const frame = requestAnimationFrame(() => {
					if (current !== generation) return;
					restore();
					const artworkFinished = shared?.play();
					const slideFinished = slide?.play();
					// Reveal the capsule only after the shared U actually lands, not on a timer.
					const previewFinished = Promise.resolve(artworkFinished).then(async () => {
						if (current !== generation || !preview) return;
						previewAnimation = animate(
							preview,
							{ opacity: [0, 1] },
							{ duration: 0.28, ease: easeOut }
						);
						await previewAnimation;
						if (current === generation) restorePreview();
					});
					const incoming = animate(
						main,
						{
							opacity: slide ? [1, 1] : [0, 1],
							transform: slide
								? [`translate3d(${-slide.distance}px, 0, 0)`, 'translate3d(0, 0, 0)']
								: [`translateY(${shared ? 0 : direction * 24}px)`, 'translateY(0px)']
						},
						{
							duration: slide ? pageSlideDuration : shared ? 0.46 : 0.32,
							ease: shared && !slide ? 'easeInOut' : easeOut
						}
					);
					cancelPlayback = () => {
						incoming.cancel();
						shared?.cancel();
						restorePreview();
						slide?.cancel();
						restore();
					};
					void Promise.all([
						Promise.resolve(incoming),
						artworkFinished,
						slideFinished,
						previewFinished
					]).then(() => {
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
					restorePreview();
					slide?.cancel();
					restore();
				};
			});
		};
		// A paused tab or animation must never keep the router waiting indefinitely.
		const watchdog = setTimeout(release, 220);
		releaseNavigation = release;
		if (shared || slide) release();
		else void outgoing?.then(release, release);
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
