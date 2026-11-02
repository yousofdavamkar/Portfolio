<script lang="ts">
import { animate } from 'motion/mini';
import { getContext, onMount, tick, untrack } from 'svelte';
import TransitionOrnament from '#lib/components/TransitionOrnament.svelte';
import { PORTFOLIO, type PortfolioContext } from '#lib/state/portfolio.svelte.js';
import { beforeNavigate } from '$app/navigation';
import { page } from '$app/state';

const portfolio = getContext<PortfolioContext>(PORTFOLIO);
const name = $derived(portfolio.content.profile?.name ?? 'Yousof Davamkar');
// A document-opening sequence, never a delay between the site's chapters.
let visible = $state(untrack(() => page.url.pathname === '/'));
let progress = $state(0);
let exiting = $state(false);
let interactive = $state(false);
let markRef = $state<HTMLDivElement>();
let backdropRef = $state<HTMLDivElement>();
let captionRef = $state<HTMLDivElement>();
let finish = () => {};

beforeNavigate(({ from, to }) => {
	if (from && from.url.pathname !== to?.url.pathname) finish();
});

onMount(() => {
	if (!visible || !markRef || !backdropRef || !captionRef) return;
	interactive = true;
	const mark = markRef;
	const backdrop = backdropRef;
	const caption = captionRef;
	const reduced = matchMedia('(prefers-reduced-motion: reduce)');
	const shell = document.querySelector<HTMLElement>('.site-shell');
	const previousInert = shell?.inert ?? false;
	const previousOverflow = document.documentElement.style.overflow;
	const animations: ReturnType<typeof animate>[] = [];
	const timers: ReturnType<typeof setTimeout>[] = [];
	let frame = 0;
	let done = false;
	let destination: SVGSVGElement | null = null;
	let destinationVisibility = '';
	const delay = (ms: number) =>
		new Promise<void>((resolve) => timers.push(setTimeout(resolve, ms)));
	const cleanup = () => {
		cancelAnimationFrame(frame);
		for (const timer of timers) clearTimeout(timer);
		for (const animation of animations) animation.cancel();
		if (destination) destination.style.visibility = destinationVisibility;
		if (shell) shell.inert = previousInert;
		document.documentElement.style.overflow = previousOverflow;
		window.removeEventListener('keydown', keyboard);
		window.removeEventListener('resize', finish);
		document.removeEventListener('visibilitychange', visibility);
		reduced.removeEventListener('change', preference);
	};
	finish = () => {
		if (done) return;
		done = true;
		cleanup();
		visible = false;
		void tick().then(() => document.dispatchEvent(new Event('portfolio:intro-complete')));
	};
	const keyboard = () => finish();
	const preference = () => {
		if (reduced.matches) finish();
	};
	const visibility = () => {
		if (document.hidden) finish();
	};
	window.addEventListener('keydown', keyboard);
	window.addEventListener('resize', finish);
	document.addEventListener('visibilitychange', visibility);
	reduced.addEventListener('change', preference);

	if (
		reduced.matches ||
		document.hidden ||
		document.documentElement.dataset['input'] === 'keyboard'
	) {
		finish();
	} else {
		if (shell) shell.inert = true;
		document.documentElement.style.overflow = 'hidden';
		// Independent fail-safe: unavailable fonts or images can never trap the visitor.
		timers.push(setTimeout(finish, 5500));
		const started = performance.now();
		const count = (now: number) => {
			// This is the opening sequence's progress, not a network download percentage.
			progress = Math.min(94, Math.floor(((now - started) / 1800) * 94));
			frame = requestAnimationFrame(count);
		};
		frame = requestAnimationFrame(count);
		for (const [index, path] of mark.querySelectorAll('path').entries()) {
			const length = path.getTotalLength();
			path.style.strokeDasharray = `${length}`;
			animations.push(
				animate(
					path,
					{ strokeDashoffset: [length, 0] },
					{
						duration: 1.1,
						delay: 0.1 + index * 0.055,
						ease: [0.65, 0, 0.25, 1]
					}
				)
			);
		}
		for (const [index, letter] of caption.querySelectorAll<HTMLElement>('.name-letter').entries()) {
			animations.push(
				animate(
					letter,
					{ opacity: [0, 1], transform: ['translateY(105%)', 'translateY(0)'] },
					{
						duration: 0.48,
						delay: 0.85 + index * 0.025,
						ease: [0.22, 1, 0.36, 1]
					}
				)
			);
		}
		const images = Array.from(
			document.querySelectorAll<HTMLImageElement>('#main img[loading="eager"]')
		);
		const ready = Promise.allSettled([
			document.fonts.ready,
			...images.map((image) => image.decode())
		]);
		void (async () => {
			await Promise.all([delay(1850), Promise.race([ready, delay(3500)])]);
			if (done) return;
			cancelAnimationFrame(frame);
			progress = 100;
			await delay(140);
			if (done) return;
			exiting = true;
			destination = document.querySelector<SVGSVGElement>('.home-ornament');
			const start = mark.getBoundingClientRect();
			const end = destination?.getBoundingClientRect();
			if (destination && end?.width && end.height) {
				destinationVisibility = destination.style.visibility;
				destination.style.visibility = 'hidden';
				const artwork = mark.querySelector('svg');
				if (artwork)
					animations.push(
						animate(
							artwork,
							{ strokeWidth: getComputedStyle(destination).strokeWidth },
							{ duration: 0.9 }
						)
					);
				animations.push(
					animate(
						mark,
						{
							transform: [
								'translate3d(0, 0, 0) scale(1, 1)',
								`translate3d(${end.x - start.x}px, ${end.y - start.y}px, 0) scale(${end.width / start.width}, ${end.height / start.height})`
							],
							opacity: [1, Number(getComputedStyle(destination).opacity)]
						},
						{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }
					)
				);
			} else {
				animations.push(
					animate(
						mark,
						{ opacity: [1, 0], transform: ['translateY(0)', 'translateY(-24px)'] },
						{ duration: 0.5 }
					)
				);
			}
			animations.push(
				animate(
					caption,
					{ opacity: [1, 0], transform: ['translateY(0)', 'translateY(-12px)'] },
					{ duration: 0.25 }
				)
			);
			// The rounded aperture echoes the U and the portrait's arch.
			const reveal = animate(
				backdrop,
				{
					clipPath: ['inset(0% 0% 0% 0% round 0px)', 'inset(0% 0% 100% 0% round 0px 0px 50% 50%)']
				},
				{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }
			);
			animations.push(reveal);
			await reveal;
			finish();
		})().catch(finish);
	}
	return () => {
		done = true;
		cleanup();
	};
});
</script>

{#if visible}
	<div class="site-intro" data-site-intro class:exiting>
		<div class="intro-backdrop" bind:this={backdropRef}>
			<div class="intro-grid" aria-hidden="true"></div>
			<div class="intro-halo" aria-hidden="true"></div>
		</div>
		<div class="intro-top" aria-hidden="true">
			<span>YD<span class="accent">.</span></span><span>DESIGN & DEVELOPMENT</span>
		</div>
		<div class="intro-center">
			<div class="intro-mark" bind:this={markRef} aria-hidden="true">
				<TransitionOrnament shared={false} class="intro-u" />
				<span class="intro-orb"></span>
			</div>
			<div class="intro-caption" bind:this={captionRef}>
				<p class="intro-name">
					<span class="sr-only">{name}</span>
					<span aria-hidden="true"
						>{#each Array.from(name) as letter}
							<span class="name-letter">{letter === ' ' ? '\u00a0' : letter}</span>
						{/each}</span
					>
				</p>
				<p class="intro-note">A little introduction<span class="accent">.</span></p>
			</div>
		</div>
		<div class="intro-bottom">
			<div class="intro-status" role="status">Opening portfolio<span class="accent">…</span></div>
			<div class="intro-progress" aria-hidden="true">
				<span style:transform={`scaleX(${progress / 100})`}></span>
			</div>
			<span class="intro-count" aria-hidden="true"
				>{String(progress).padStart(3, '0')}<span>/ 100</span></span
			>
		</div>
		<button type="button" class="intro-skip" disabled={!interactive} onclick={() => finish()}>
			Skip intro <span aria-hidden="true">↗</span>
		</button>
	</div>
{/if}

<style>
.site-intro {
	position: fixed;
	inset: 0;
	z-index: 100;
	overflow: hidden;
	color: var(--foreground);
	animation: emergency-dismiss 0s 6s forwards;
}
.intro-backdrop {
	position: absolute;
	inset: 0;
	background: #141414;
}
.intro-grid {
	position: absolute;
	inset: 0;
	background-image:
		linear-gradient(#ffffff05 1px, transparent 1px),
		linear-gradient(90deg, #ffffff05 1px, transparent 1px);
	background-size: 80px 80px;
	mask-image: radial-gradient(ellipse at 50% 45%, black, transparent 65%);
}
.intro-halo {
	position: absolute;
	width: min(80vw, 680px);
	aspect-ratio: 1;
	left: 50%;
	top: 45%;
	transform: translate(-50%, -50%);
	background: radial-gradient(circle, #ffca050a, transparent 66%);
}
.intro-top {
	position: absolute;
	inset: 32px 5.55vw auto;
	display: flex;
	justify-content: space-between;
	align-items: center;
}
.intro-top > :first-child {
	font-size: 22px;
	font-weight: 500;
	letter-spacing: -1px;
}
.intro-top > :last-child {
	font-size: 9px;
	letter-spacing: 2.5px;
	color: var(--muted-foreground);
}
.accent {
	color: var(--primary);
}
.intro-center {
	position: absolute;
	left: 50%;
	top: 45%;
	transform: translate(-50%, -50%);
	text-align: center;
}
.intro-mark {
	width: clamp(140px, 16vw, 210px);
	aspect-ratio: 300 / 375;
	position: relative;
	margin: 0 auto;
	transform-origin: 0 0;
}
.intro-mark :global(.intro-u) {
	inset: 0;
	width: 100%;
	height: 100%;
	stroke-width: 1.2;
	opacity: 1;
}
.intro-mark :global(.intro-u path) {
	stroke-dasharray: 1000;
	stroke-dashoffset: 1000;
}
.intro-orb {
	position: absolute;
	top: 28%;
	left: 50%;
	width: 19px;
	height: 19px;
	border-radius: 50%;
	transform: translate(-50%, -50%);
	background: linear-gradient(120deg, var(--primary), #fff6ac);
	animation: orb-arrive 700ms 700ms both cubic-bezier(0.22, 1, 0.36, 1);
}
.intro-caption {
	margin-top: 36px;
	white-space: nowrap;
}
.intro-name {
	margin: 0;
	font-size: clamp(22px, 2.3vw, 34px);
	font-weight: 400;
	line-height: 1.5;
	letter-spacing: -1px;
	overflow: hidden;
}
.name-letter {
	display: inline-block;
	opacity: 0;
	transform: translateY(105%);
}
.intro-note {
	margin: 10px 0 0;
	color: var(--muted-foreground);
	font-size: 12px;
}
.intro-bottom {
	position: absolute;
	bottom: 55px;
	left: 5.55vw;
	right: 5.55vw;
	display: grid;
	grid-template-columns: 1fr minmax(100px, 38vw) 1fr;
	align-items: center;
	gap: 32px;
}
.intro-status {
	color: var(--muted-foreground);
	font-size: 11px;
}
.intro-progress {
	height: 1px;
	background: #ffffff1a;
	overflow: hidden;
}
.intro-progress > span {
	display: block;
	height: 100%;
	background: var(--primary);
	transform-origin: left;
}
.intro-count {
	justify-self: end;
	font-size: 22px;
	font-variant-numeric: tabular-nums;
}
.intro-count > span {
	margin-left: 8px;
	color: #777;
	font-size: 10px;
}
.intro-skip {
	position: absolute;
	bottom: 104px;
	right: 5.55vw;
	padding: 10px 0 10px 15px;
	border: none;
	background: none;
	color: var(--muted-foreground);
	cursor: pointer;
	font: inherit;
	font-size: 11px;
	transition:
		color 150ms,
		transform 150ms;
}
.intro-skip:focus-visible {
	outline: 2px solid var(--primary);
	outline-offset: 4px;
	border-radius: 4px;
}
.intro-skip:active {
	transform: scale(0.97);
}
@media (hover: hover) {
	.intro-skip:hover {
		color: var(--primary);
	}
}
.intro-top,
.intro-bottom,
.intro-skip,
.intro-orb {
	transition: opacity 200ms;
}
.exiting .intro-top,
.exiting .intro-bottom,
.exiting .intro-skip,
.exiting .intro-orb {
	opacity: 0;
	pointer-events: none;
}
@keyframes orb-arrive {
	from {
		opacity: 0;
		translate: 0 12px;
		scale: 0.9;
	}
	to {
		opacity: 1;
		translate: 0 0;
		scale: 1;
	}
}
@keyframes emergency-dismiss {
	to {
		visibility: hidden;
		pointer-events: none;
	}
}
@media (max-width: 600px) {
	.intro-top {
		inset: 24px 24px auto;
	}
	.intro-top > :last-child {
		font-size: 8px;
		letter-spacing: 1.5px;
	}
	.intro-bottom {
		left: 24px;
		right: 24px;
		bottom: max(32px, env(safe-area-inset-bottom));
		grid-template-columns: 1fr auto;
		gap: 18px;
	}
	.intro-progress {
		grid-row: 2;
		grid-column: 1 / -1;
	}
	.intro-skip {
		right: 24px;
		bottom: 112px;
	}
	.intro-caption {
		margin-top: 28px;
	}
}
@media (max-height: 560px) {
	.intro-mark {
		width: 100px;
	}
	.intro-center {
		top: 44%;
	}
	.intro-caption {
		margin-top: 14px;
	}
	.intro-name {
		font-size: 20px;
	}
	.intro-note {
		margin-top: 4px;
		font-size: 10px;
	}
	.intro-top {
		top: 16px;
	}
	.intro-bottom {
		bottom: 20px;
	}
	.intro-skip {
		bottom: 68px;
	}
}
@media (prefers-reduced-motion: reduce), (scripting: none) {
	.site-intro {
		display: none;
	}
}
</style>
