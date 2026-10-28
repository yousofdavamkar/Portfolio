<script lang="ts">
import { animate, animateView, stagger } from 'motion';
import { flushSync, onMount, tick } from 'svelte';
import { animateScene, easeOut, motionAllowed } from '#lib/motion/scene.js';
import { afterNavigate, onNavigate } from '$app/navigation';

let { active = $bindable(false) }: { active?: boolean } = $props();
let chapter = $state('01');
let label = $state('Introduction');
let direction = $state(1);
let generation = 0;
let cleanupScene = () => {};
let cancelFallback = () => {};
const chapters = [
	{ path: '/', label: 'Introduction' },
	{ path: '/about', label: 'Behind the work' },
	{ path: '/work', label: 'Selected work' },
	{ path: '/contact', label: 'Let’s talk' }
];
const chapterIndex = (path: string) =>
	path.startsWith('/work/') ? 2 : chapters.findIndex((item) => item.path === path);
const viewAnimations = () =>
	document
		.getAnimations()
		.filter(
			(animation) =>
				animation.effect instanceof KeyframeEffect &&
				animation.effect.pseudoElement?.startsWith('::view-transition')
		);
function setupScene(entrance: boolean) {
	cleanupScene();
	const root = document.querySelector<HTMLElement>('.site-shell');
	cleanupScene = root ? animateScene(root, entrance) : () => {};
}
function finishViews() {
	for (const animation of viewAnimations()) animation.finish();
}

afterNavigate(() => {
	if (!active) setupScene(true);
});
onNavigate((navigation) => {
	const from = navigation.from?.url.pathname;
	const to = navigation.to?.url.pathname;
	if (!from || !to || from === to) return;
	cleanupScene();
	cancelFallback();
	finishViews();
	const current = ++generation;
	const next = chapterIndex(to);
	const nextChapter = chapters[next];
	if (!nextChapter || chapterIndex(from) < 0 || !motionAllowed()) {
		active = false;
		delete document.documentElement.dataset['pageTransition'];
		return;
	}
	direction = next >= chapterIndex(from) ? 1 : -1;
	if (navigation.type === 'popstate' && navigation.delta) direction = Math.sign(navigation.delta);
	chapter = String(next + 1).padStart(2, '0');
	label = nextChapter.label;
	const finish = () => {
		if (current !== generation) return;
		active = false;
		delete document.documentElement.dataset['pageTransition'];
		setupScene(false);
	};

	if (!document.startViewTransition) {
		// Keep navigation functional on browsers without snapshot transitions.
		return () => {
			const main = document.querySelector<HTMLElement>('#main');
			if (main) {
				const animation = animate(
					main,
					{ opacity: [0, 1], transform: [`translateY(${direction * 50}px)`, 'translateY(0px)'] },
					{ duration: 0.5, ease: easeOut }
				);
				cancelFallback = () => {
					animation.cancel();
					main.style.removeProperty('opacity');
					main.style.removeProperty('transform');
				};
			}
		};
	}

	active = true;
	document.documentElement.dataset['pageTransition'] = 'active';
	// Remove any network skeleton before the outgoing page is photographed.
	flushSync();
	return new Promise<void>((resolve) => {
		let released = false;
		const release = () => {
			if (!released) {
				released = true;
				resolve();
			}
		};
		// A transition failure must never hold the router hostage.
		const watchdog = setTimeout(() => {
			release();
			finish();
		}, 1800);
		const transition = animateView(
			async () => {
				release();
				await navigation.complete;
				await tick();
			},
			{ duration: 0.86, ease: easeOut }
		)
			.old(
				{
					opacity: [1, 0],
					transform: ['translateY(0px) scale(1)', `translateY(${-direction * 34}vh) scale(.92)`]
				},
				{ duration: 0.62 }
			)
			.new({
				opacity: [0, 1],
				transform: [`translateY(${direction * 100}vh) scale(.96)`, 'translateY(0px) scale(1)']
			})
			.add('.site-header, .scroll-progress')
			.group(false)
			.class('portfolio-header')
			.layout({ duration: 0.65 })
			.add('[data-reveal]')
			.group(false)
			.crop(false)
			.old(
				{ opacity: [1, 0], transform: ['translateY(0px)', `translateY(${-direction * 90}px)`] },
				{ duration: 0.26 }
			)
			.new(
				{ opacity: [0, 1], transform: [`translateY(${direction * 110}px)`, 'translateY(0px)'] },
				{ duration: 0.62, delay: stagger(0.045, { startDelay: 0.16 }) }
			)
			.add('.portrait-scene')
			.group(false)
			.class('portfolio-art')
			.layout({ duration: 0.86 })
			.exit(
				{ opacity: 0, transform: `translateY(${-direction * 100}px) scale(.92)` },
				{ duration: 0.4 }
			)
			.enter({ opacity: 1, transform: 'translateY(0px) scale(1)' })
			.add('.project-art .media-image, .detail-art .media-image')
			.group(false)
			.class('portfolio-art')
			.layout({ duration: 0.86 })
			.exit(
				{ opacity: 0, transform: `translateY(${-direction * 100}px) scale(.9)` },
				{ duration: 0.35 }
			)
			.enter({ opacity: 1, transform: 'translateY(0px) scale(1)' })
			.add('.journey-graphics')
			.group(false)
			.class('portfolio-graphics')
			.crop(false)
			.old({ opacity: 0 }, { duration: 0 })
			.new(
				{
					opacity: [0, 0.8, 0],
					transform: [
						`translateY(${direction * 35}vh) rotate(-12deg) scale(.9)`,
						'translateY(0px) rotate(0deg) scale(1)',
						`translateY(${-direction * 30}vh) rotate(12deg) scale(1.1)`
					]
				},
				{ duration: 0.86, times: [0, 0.35, 1] }
			);
		void transition.then(
			() => {
				clearTimeout(watchdog);
				if (!motionAllowed()) finishViews();
				// Motion's builder resolves when snapshots are ready, before playback ends.
				const playback = viewAnimations().map((animation) => animation.finished.catch(() => {}));
				void Promise.all(playback).then(finish);
			},
			() => {
				clearTimeout(watchdog);
				release();
				finish();
			}
		);
	});
});

onMount(() => {
	const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
	const stop = () => {
		finishViews();
		active = false;
		delete document.documentElement.dataset['pageTransition'];
		cleanupScene();
		cancelFallback();
	};
	const keyboard = () => stop();
	const preference = () => {
		if (reducedMotion.matches) stop();
		else setupScene(false);
	};
	window.addEventListener('keydown', keyboard);
	reducedMotion.addEventListener('change', preference);
	return () => {
		generation++;
		cleanupScene();
		cancelFallback();
		finishViews();
		delete document.documentElement.dataset['pageTransition'];
		window.removeEventListener('keydown', keyboard);
		reducedMotion.removeEventListener('change', preference);
	};
});
</script>

{#if active}
	<div class="journey-graphics" aria-hidden="true" data-direction={direction}>
		<svg aria-hidden="true" class="journey-rings" viewBox="0 0 1000 1000" fill="none">
			{#each [230, 270, 310, 350, 390, 430] as radius}
				<circle cx="500" cy="500" r={radius} />
			{/each}
			<circle class="journey-dot" cx="810" cy="250" r="27" />
			<path class="journey-spark" d="M180 600v110m-55-55h110m-94-39 78 78m-78 0 78-78" />
		</svg>
		<div class="journey-chapter">
			<span>{chapter}</span><small>{label}</small
			><span class="chapter-arrow">{direction > 0 ? '↓' : '↑'}</span>
		</div>
	</div>
{/if}

<style>
.journey-graphics {
	position: fixed;
	inset: 0;
	z-index: 45;
	pointer-events: none;
	color: var(--primary);
	display: grid;
	place-items: center;
	overflow: hidden;
}
.journey-rings {
	position: absolute;
	width: min(110vw, 1200px);
	height: min(110vw, 1200px);
	stroke: currentColor;
	stroke-width: 1;
	opacity: 0.45;
}
.journey-dot {
	fill: currentColor;
	stroke: none;
}
.journey-spark {
	stroke-width: 4;
}
.journey-chapter {
	display: flex;
	align-items: center;
	gap: 24px;
	padding: 20px 30px;
	border: 1px solid color-mix(in srgb, var(--primary) 25%, transparent);
	border-radius: 100px;
	background: #141414e8;
}
.journey-chapter > span:first-child {
	font-size: clamp(34px, 6vw, 72px);
	line-height: 1;
	letter-spacing: -4px;
}
.journey-chapter small {
	font-size: 12px;
	letter-spacing: 3px;
	text-transform: uppercase;
	color: #fff;
}
.chapter-arrow {
	font-size: 38px;
}
@media (max-width: 767px) {
	.journey-rings {
		width: 170vw;
		height: 170vw;
	}
	.journey-chapter {
		gap: 16px;
		padding: 18px 24px;
	}
	.journey-chapter small {
		font-size: 9px;
		letter-spacing: 2px;
	}
}
:global(::view-transition),
:global(::view-transition-group(*)),
:global(::view-transition-image-pair(*)),
:global(::view-transition-old(*)),
:global(::view-transition-new(*)) {
	pointer-events: none;
}
:global(::view-transition-group(.portfolio-header)) {
	z-index: 4;
}
:global(::view-transition-group(.portfolio-art)) {
	z-index: 2;
}
:global(::view-transition-group(.portfolio-graphics)) {
	z-index: 3;
}
</style>
