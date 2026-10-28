<script lang="ts">
import { ArrowDown, ArrowLeft, ArrowRight, Pause, Play } from '@lucide/svelte';
import { getContext, onMount } from 'svelte';
import MediaImage from '#lib/components/MediaImage.svelte';
import TransitionOrnament from '#lib/components/TransitionOrnament.svelte';
import { Button } from '#lib/components/ui/button/index.js';
import { carouselReveal } from '#lib/motion/carousel.js';
import { PORTFOLIO, type PortfolioContext } from '#lib/state/portfolio.svelte.js';
import type { createProjectNavigation } from '#lib/state/project-navigation.js';
import { navigating } from '$app/state';

const portfolio = getContext<PortfolioContext>(PORTFOLIO);
const projectNavigation =
	getContext<ReturnType<typeof createProjectNavigation>>('project-navigation');
let category = $state('All work');
const categories = $derived([
	'All work',
	...new Set(portfolio.content.projects.map((p) => p.category))
]);
const projects = $derived(
	portfolio.content.projects.filter((p) => category === 'All work' || p.category === category)
);
const index = $derived(
	projects.length ? Math.min($projectNavigation.projectIndex, projects.length - 1) : 0
);
const project = $derived(projects[index]);
const previewProject = $derived(projects[(index + 1) % projects.length]);
let direction = $state(1);
let paused = $state(false);
let hovered = $state(false);
let focused = $state(false);
let hidden = $state(true);
let reduced = $state(true);
const playing = $derived(
	projects.length > 1 && !paused && !hovered && !focused && !hidden && !reduced && !navigating.to
);
onMount(() => {
	const preference = matchMedia('(prefers-reduced-motion: reduce)');
	const syncPreference = () => {
		reduced = preference.matches;
	};
	const syncVisibility = () => {
		hidden = document.hidden;
	};
	syncPreference();
	syncVisibility();
	preference.addEventListener('change', syncPreference);
	document.addEventListener('visibilitychange', syncVisibility);
	return () => {
		preference.removeEventListener('change', syncPreference);
		document.removeEventListener('visibilitychange', syncVisibility);
	};
});
$effect(() => {
	// A complete reading interval starts again after every manual or automatic change.
	const current = index;
	if (!playing) return;
	const timer = setTimeout(() => {
		direction = 1;
		projectNavigation.setProjectIndex((current + 1) % projects.length);
	}, 6000);
	return () => clearTimeout(timer);
});
function move(step: number) {
	if (projects.length < 2) return;
	direction = step;
	projectNavigation.setProjectIndex((index + step + projects.length) % projects.length);
}
</script>
<svelte:head
	><title>Portfolio — Yousof Davamkar</title>
	<meta
		name="description"
		content="Selected projects in web development and interface design."
	></svelte:head
>
<section
	class="work-page content-page"
	aria-label="Portfolio projects"
	aria-roledescription="carousel"
	onpointerenter={(event) => {
		if (event.pointerType === 'mouse') hovered = true;
	}}
	onpointerleave={() => (hovered = false)}
	onfocusin={() => (focused = true)}
	onfocusout={(event) => {
		if (
			!(event.relatedTarget instanceof Node) ||
			!event.currentTarget.contains(event.relatedTarget)
		)
			focused = false;
	}}
>
	<h1 data-reveal class="speech section-label speech-tail">
		Portfolio <span aria-hidden="true">👨🏻‍💻</span>
	</h1>
	{#if categories.length > 2}
		<fieldset class="work-filters" aria-label="Filter projects">
			{#each categories as option}
				<Button
					variant={category === option ? 'default' : 'outline'}
					onclick={() => {
						category = option;
						projectNavigation.setProjectIndex(0);
					}}
					aria-pressed={category === option}
					>{option}</Button
				>
			{/each}
		</fieldset>
	{/if}
	{#if project}
		<div class="project-showcase">
			<div data-reveal class="project-copy" aria-live={playing ? 'off' : 'polite'}>
				<div use:carouselReveal={{ key: project.slug, direction }}>
					<h2>{project.title}</h2>
					<p class="body-copy">{project.summary}</p>
					<Button href={`/work/${project.slug}`} variant="outline" class="pill-action"
						>View Details <ArrowRight size={24} /></Button
					>
				</div>
			</div>
			<a
				use:carouselReveal={{ key: project.slug, direction }}
				class="project-art"
				href={`/work/${project.slug}`}
				aria-label={`View ${project.title}`}
				><MediaImage
					loading="eager"
					src={project.image}
					sharedArt="project"
					alt={`${project.title} project preview`}
					width={612}
					height={537}
				/></a
			>
			<div data-reveal class="project-pagination">
				<div class="arrow-buttons">
					<Button
						variant="outline"
						size="icon"
						class="round-outline"
						onclick={() => move(-1)}
						disabled={projects.length < 2}
						aria-label="Previous project"
						><ArrowLeft /></Button
					><Button
						variant="outline"
						size="icon"
						class="round-outline"
						onclick={() => move(1)}
						disabled={projects.length < 2}
						aria-label="Next project"
						><ArrowRight /></Button
					>
				</div>
				<div
					class="project-number"
					role="img"
					aria-label={`Project ${index + 1} of ${projects.length}`}
				>
					<span>{index + 1}</span><span>/</span><span>{projects.length}</span>
				</div>
				{#if projects.length > 1 && !reduced}
					<Button
						variant="ghost"
						size="sm"
						class="autoplay-control"
						onclick={() => (paused = !paused)}
						aria-label={paused ? 'Play project slideshow' : 'Pause project slideshow'}
					>
						{#if paused}
							<Play size={14} />
						{:else}
							<Pause size={14} />
						{/if}
						{paused ? 'Play' : 'Pause'}
					</Button>
				{/if}
			</div>
		</div>
		{#if previewProject}
			<a
				class="project-preview"
				onclick={() => projectNavigation.setProjectIndex((index + 1) % projects.length)}
				href={`/work/${previewProject.slug}`}
				aria-label={`Preview ${previewProject.title}`}
			>
				<MediaImage
					loading="eager"
					src={previewProject.image}
					alt=""
					width={210}
					height={314}
					fit="cover"
				/>
			</a>
		{/if}
	{:else}
		<div class="empty-state">
			<h2>More good things are on the way.</h2>
			<p>New projects will appear here when they’re ready.</p>
			<Button href="/contact" class="pill-action">Let’s talk <ArrowRight /></Button>
		</div>
	{/if}
	<TransitionOrnament class="work-ornament" />
	<Button href="/contact" variant="outline" size="icon" class="section-next" aria-label="Contact me"
		><ArrowDown /></Button
	>
</section>

<style>
.project-pagination :global(.autoplay-control) {
	font-size: 12px;
	color: var(--muted-foreground);
	min-height: 32px;
}
.project-preview {
	display: none;
}
.arrow-buttons :global(button:disabled) {
	opacity: 1;
}
.work-page :global(.work-ornament) {
	width: 120px;
	height: 235px;
	right: -25px;
	top: -94px;
	opacity: 0.18;
}
.project-number span {
	font-size: inherit;
	letter-spacing: 0;
	color: inherit;
}
.project-number {
	gap: 0;
	font-size: 34px;
	color: #fff;
}

@media (min-width: 768px) and (max-width: 1023px) {
	.project-showcase {
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		min-height: 0;
		gap: 32px;
	}
	.project-art {
		margin: 0;
		align-self: center;
	}
	.project-pagination {
		grid-column: 1 / -1;
		flex-direction: row;
		justify-content: center;
		padding: 0;
		gap: 32px;
	}
}
@media (min-width: 1024px) {
	.work-page {
		min-height: max(calc(100svh - 120px), calc(56.25cqw - 120px));
		padding: 0;
	}
	.section-label {
		position: absolute;
		left: 6.458333cqw;
		top: calc(10cqw - 120px);
		margin: 0;
		padding: 1.111111cqw 2.222222cqw;
		font-size: 1.666667cqw;
		line-height: 1.5;
		border-radius: 3.472222cqw;
	}
	.section-label span {
		font-size: 2.222222cqw;
		line-height: 1;
		vertical-align: middle;
		margin-left: 0.347222cqw;
	}
	.section-label:before {
		left: -0.902778cqw;
		bottom: -0.416667cqw;
	}
	.project-showcase {
		position: static;
		display: block;
		min-height: 0;
	}
	.project-copy {
		position: absolute;
		left: 5.555556cqw;
		top: calc(19.861111cqw - 120px);
		width: 21.111111cqw;
		padding: 0;
		z-index: 2;
	}
	.project-copy h2 {
		font-size: 1.25cqw;
		line-height: 1.5;
		font-weight: 500;
		letter-spacing: 0;
		margin: 0 0 1.736111cqw;
	}
	.project-copy .body-copy {
		font-size: 1.111111cqw;
		line-height: 2;
		color: #eee;
		max-width: none;
		min-height: 15.555556cqw;
		margin: 0;
	}
	.project-copy :global(.pill-action) {
		margin-top: 1.944444cqw;
		min-height: 3.888889cqw;
		padding: 0.833333cqw 1.597222cqw;
		font-size: 1.111111cqw;
		font-weight: 500;
		gap: 0.555556cqw;
	}
	.project-art {
		position: absolute;
		left: 28.819444cqw;
		top: calc(18.958333cqw - 120px);
		width: 42.5cqw;
		margin: 0;
		z-index: 1;
	}
	.project-preview {
		display: block;
		position: absolute;
		left: 74.305556cqw;
		top: calc(3.75cqw - 120px);
		width: 14.583333cqw;
		height: 21.805556cqw;
		border-radius: 50% / 33.43949%;
		overflow: hidden;
		z-index: 1;
	}
	.project-pagination {
		position: absolute;
		left: 76.527778cqw;
		top: calc(34.027778cqw - 120px);
		width: 10cqw;
		padding: 0;
		gap: 2.777778cqw;
		z-index: 2;
	}
	.arrow-buttons {
		gap: 2.222222cqw;
	}
	.arrow-buttons :global(.round-outline) {
		width: 3.888889cqw;
		height: 3.888889cqw;
	}
	.arrow-buttons :global(svg),
	.project-copy :global(.pill-action svg),
	.work-page :global(.section-next svg) {
		width: 1.666667cqw;
		height: 1.666667cqw;
	}
	.project-number {
		gap: 0;
		color: #fff;
		font-size: 2.777778cqw;
		line-height: 1.5;
	}
	.project-number span {
		font-size: inherit;
		letter-spacing: 0;
		color: inherit;
	}
	.work-page :global(.work-ornament) {
		left: 68.75cqw;
		top: calc(-5.555556cqw - 120px);
		right: auto;
		width: 25.694444cqw;
		height: 36.805556cqw;
		opacity: 0.6;
	}
	.work-page :global(.section-next) {
		top: calc(49.583333cqw - 120px);
		bottom: auto;
		left: 5.555556cqw;
		width: 3.888889cqw;
		height: 3.888889cqw;
	}
	.work-filters {
		position: relative;
		padding: 7cqw 5.555556cqw 0;
		z-index: 3;
	}
}
</style>
