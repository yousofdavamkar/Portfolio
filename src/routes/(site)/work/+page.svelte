<script lang="ts">
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight } from '@lucide/svelte';
import { getContext } from 'svelte';
import MediaImage from '#lib/components/MediaImage.svelte';
import Ornament from '#lib/components/Ornament.svelte';
import { Badge } from '#lib/components/ui/badge/index.js';
import { Button } from '#lib/components/ui/button/index.js';
import { PORTFOLIO, type PortfolioContext } from '#lib/state/portfolio.svelte.js';
import type { createProjectNavigation } from '#lib/state/project-navigation.js';

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
function move(direction: number) {
	projectNavigation.setProjectIndex((index + direction + projects.length) % projects.length);
}
</script>
<svelte:head
	><title>Portfolio — Yousof Davamkar</title>
	<meta
		name="description"
		content="Selected projects in web development and interface design."
	></svelte:head
>
<section class="work-page content-page">
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
			<div data-reveal class="project-copy" aria-live="polite">
				<span class="eyebrow">SELECTED WORK / {String(index + 1).padStart(2, '0')}</span>
				<h2>{project.title}</h2>
				<p class="body-copy">{project.summary}</p>
				<div class="skills-list">
					{#each project.stack as tech}
						<Badge variant="outline">{tech}</Badge>
					{/each}
				</div>
				<Button href={`/work/${project.slug}`} variant="outline" class="pill-action"
					>View details <ArrowUpRight size={20} /></Button
				>
			</div>
			<a class="project-art" href={`/work/${project.slug}`} aria-label={`View ${project.title}`}
				><MediaImage
					loading="eager"
					src={project.image}
					alt={`${project.title} project preview`}
					width={612}
					height={537}
				/></a
			>
			<div data-reveal class="project-pagination">
				<div class="project-number">
					<span>{String(index + 1).padStart(2, '0')}</span
					><span>/ {String(projects.length).padStart(2, '0')}</span>
				</div>
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
				<span class="eyebrow">{project.category}</span>
			</div>
		</div>
	{:else}
		<div class="empty-state">
			<h2>More good things are on the way.</h2>
			<p>New projects will appear here when they’re ready.</p>
			<Button href="/contact" class="pill-action">Let’s talk <ArrowRight /></Button>
		</div>
	{/if}
	<Ornament class="work-ornament" />
	<Button href="/contact" variant="outline" size="icon" class="section-next" aria-label="Contact me"
		><ArrowDown /></Button
	>
</section>
