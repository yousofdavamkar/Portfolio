<script lang="ts">
import { ArrowLeft, ArrowUpRight } from '@lucide/svelte';
import { getContext } from 'svelte';
import ProjectSlides from '#lib/components/ProjectSlides.svelte';
import TransitionOrnament from '#lib/components/TransitionOrnament.svelte';
import { Badge } from '#lib/components/ui/badge/index.js';
import { Button } from '#lib/components/ui/button/index.js';
import { PORTFOLIO, type PortfolioContext } from '#lib/state/portfolio.svelte.js';
import type { createProjectNavigation } from '#lib/state/project-navigation.js';
import { beforeNavigate } from '$app/navigation';
import type { PageProps } from './$types';

let { data }: PageProps = $props();
const portfolio = getContext<PortfolioContext>(PORTFOLIO);
const project = $derived(
	portfolio.content.projects.find((item) => item.slug === data.project.slug) ?? data.project
);
const navigation = getContext<ReturnType<typeof createProjectNavigation>>('project-navigation');
function back() {
	const index = portfolio.content.projects.findIndex(
		(project) => project.slug === data.project.slug
	);
	if (index >= 0) navigation.setProjectIndex(index);
}
beforeNavigate(({ to }) => {
	if (to?.url.pathname === '/work') back();
});
</script>
<svelte:head
	><title>{project.title} — Yousof Davamkar</title>
	<meta name="description" content={project.summary}></svelte:head
>
<article class="project-detail content-page">
	<Button onclick={back} href="/work" variant="outline" class="pill-action back-link"
		><ArrowLeft size={18} />
		All projects</Button
	>
	<div class="detail-grid">
		{#key data.project.slug}
			<ProjectSlides {project} />
		{/key}
		<div data-reveal class="detail-copy">
			<span class="eyebrow">{project.category}</span>
			<h1>{project.title}</h1>
			<p class="body-copy lead">{project.summary}</p>

			<div class="skills-list">
				{#each project.stack as tech}
					<Badge variant="outline">{tech}</Badge>
				{/each}
			</div>
			{#if project.url}
				<Button
					href={project.url}
					target="_blank"
					rel="noreferrer"
					variant="outline"
					class="pill-action"
					>Visit project <ArrowUpRight /></Button
				>
			{:else}
				<Button href="/contact" variant="outline" class="pill-action"
					>Discuss a similar project <ArrowUpRight /></Button
				>
			{/if}
		</div>
	</div>
	<TransitionOrnament inverted class="detail-ornament" />
</article>

<style>
.detail-grid {
	display: grid;
	align-items: center;
	grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
	gap: 5%;
}
.project-detail :global(.detail-ornament) {
	right: -110px;
	bottom: -100px;
	width: clamp(180px, 25vw, 370px);
	height: clamp(300px, 36vw, 530px);
	opacity: 0.18;
	transform: rotate(180deg);
	z-index: -1;
}
@media (max-width: 767px) {
	.detail-grid {
		grid-template-columns: minmax(0, 1fr);
		gap: 32px;
	}
}
</style>
