<script lang="ts">
import { ArrowDown, ArrowUp } from '@lucide/svelte';
import MediaImage from '#lib/components/MediaImage.svelte';
import { Button } from '#lib/components/ui/button/index.js';
import { motionAllowed } from '#lib/motion/scene.js';
import type { Project } from '#lib/state/portfolio.svelte.js';
import { beforeNavigate } from '$app/navigation';

let { project }: { project: Project } = $props();
type Slide = { kind: 'image'; image: string; caption: string } | { kind: 'text'; text: string };
const slides = $derived<Slide[]>([
	{ kind: 'image', image: project.image, caption: `${project.title} preview` },
	...(project.gallery ?? []).map((slide) => ({ kind: 'image' as const, ...slide })),
	...project.body
		.split('\n\n')
		.filter((text) => text.trim())
		.map((text) => ({ kind: 'text' as const, text }))
]);
let viewport = $state<HTMLElement>();
let active = $state(0);
function go(index: number) {
	const target = viewport?.children.item(Math.max(0, Math.min(index, slides.length - 1)));
	if (!(target instanceof HTMLElement) || !viewport) return;
	viewport.scrollTo({ top: target.offsetTop, behavior: motionAllowed() ? 'smooth' : 'instant' });
}
function reset() {
	viewport?.scrollTo({ top: 0, behavior: 'instant' });
	active = 0;
}
function sync() {
	if (!viewport) return;
	const top = viewport.scrollTop;
	let nearest = 0;
	let distance = Infinity;
	for (const [index, child] of Array.from(viewport.children).entries()) {
		if (!(child instanceof HTMLElement)) continue;
		const delta = Math.abs(child.offsetTop - top);
		if (delta < distance) {
			distance = delta;
			nearest = index;
		}
	}
	active = nearest;
}
beforeNavigate(({ to }) => {
	if (to?.url.pathname === '/work') reset();
});
function keyboardSlider(node: HTMLElement) {
	// Native scroll regions need a focus stop for arrow-key and Home/End navigation.
	node.tabIndex = 0;
	const keydown = (event: KeyboardEvent) => {
		if (event.target !== node || !['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key))
			return;
		event.preventDefault();
		go(
			event.key === 'Home'
				? 0
				: event.key === 'End'
					? slides.length - 1
					: active + (event.key === 'ArrowDown' ? 1 : -1)
		);
	};
	node.addEventListener('keydown', keydown);
	return {
		destroy() {
			node.removeEventListener('keydown', keydown);
		}
	};
}
</script>

<section
	class="project-slides"
	aria-label={`${project.title} screenshots and story`}
	aria-roledescription="carousel"
>
	<section
		class="slide-viewport"
		bind:this={viewport}
		use:keyboardSlider
		onscroll={sync}
		aria-label="Project slides. Scroll vertically to explore."
	>
		{#each slides as slide, index}
			<section
				class="detail-slide"
				aria-roledescription="slide"
				aria-label={`${index + 1} of ${slides.length}`}
			>
				{#if slide.kind === 'image'}
					<figure>
						<MediaImage
							src={slide.image}
							alt={slide.caption || `${project.title} screenshot ${index}`}
							width={612}
							height={537}
							loading={index === 0 ? 'eager' : 'lazy'}
							{...index === 0 ? { sharedArt: 'project' } : {}}
						/>
						{#if index > 0 && slide.caption}
							<figcaption>{slide.caption}</figcaption>
						{/if}
					</figure>
				{:else}
					<div class="story-slide">
						<span class="eyebrow">Behind the project</span>
						<p>{slide.text}</p>
					</div>
				{/if}
			</section>
		{/each}
	</section>
	{#if slides.length > 1}
		<nav class="vertical-controls" aria-label="Project slide controls">
			<Button
				variant="outline"
				size="icon"
				class="round-outline"
				aria-label="Previous detail slide"
				disabled={active === 0}
				onclick={() => go(active - 1)}
				><ArrowUp size={20} /></Button
			>
			<div class="slide-dots">
				{#each slides as _, index}
					<button
						type="button"
						class:current={active === index}
						aria-label={`Go to detail slide ${index + 1}`}
						aria-current={active === index ? 'true' : undefined}
						onclick={() => go(index)}
					>
						<span></span>
					</button>
				{/each}
			</div>
			<span class="slide-count" aria-live="polite" aria-atomic="true"
				>{active + 1}
				/ {slides.length}</span
			>
			<Button
				variant="outline"
				size="icon"
				class="round-outline"
				aria-label="Next detail slide"
				disabled={active === slides.length - 1}
				onclick={() => go(active + 1)}
				><ArrowDown size={20} /></Button
			>
		</nav>
	{/if}
</section>

<style>
.project-slides {
	position: relative;
	min-width: 0;
	display: grid;
	grid-template-columns: minmax(0, 1fr) 44px;
	gap: 18px;
	align-items: center;
}
.slide-viewport {
	position: relative;
	height: clamp(360px, 62svh, 620px);
	overflow-y: auto;
	overflow-x: hidden;
	scroll-snap-type: y mandatory;
	scrollbar-width: none;
	border-radius: 20px;
}
.slide-viewport::-webkit-scrollbar {
	display: none;
}
.slide-viewport:focus-visible {
	outline: 2px solid var(--primary);
	outline-offset: 5px;
}
.detail-slide {
	height: 100%;
	scroll-snap-align: start;
	scroll-snap-stop: always;
	display: flex;
	align-items: center;
	overflow: auto;
}
figure {
	width: 100%;
	margin: 0;
}
figcaption {
	text-align: center;
	color: var(--muted-foreground);
	font-size: 13px;
	padding: 14px 12px 0;
}
.story-slide {
	padding: clamp(20px, 3vw, 44px);
	margin: auto;
}
.story-slide p {
	white-space: pre-line;
	color: #eee;
	font-size: clamp(16px, 1.4vw, 22px);
	line-height: 1.85;
	margin-top: 24px;
}
.vertical-controls {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 16px;
}
.vertical-controls :global(.round-outline) {
	width: 44px;
	height: 44px;
}
.slide-dots {
	display: flex;
	flex-direction: column;
	max-height: 200px;
	overflow-y: auto;
}
.slide-dots button {
	width: 32px;
	height: 26px;
	display: grid;
	place-items: center;
	cursor: pointer;
}
.slide-dots span {
	width: 5px;
	height: 5px;
	border-radius: 10px;
	background: #777;
	transition:
		transform 240ms ease,
		background-color 240ms ease;
}
.slide-dots .current span {
	background: var(--primary);
	transform: scale(1.5);
}
.slide-count {
	font-size: 12px;
	color: var(--muted-foreground);
	white-space: nowrap;
}
@media (max-width: 767px) {
	.project-slides {
		gap: 8px;
	}
	.slide-viewport {
		height: 390px;
		max-height: 65svh;
	}
	.story-slide {
		padding: 18px;
	}
}
@media (prefers-reduced-motion: reduce) {
	.slide-dots span {
		transition: none;
	}
}
</style>
