<script lang="ts">
import { ArrowDown, ArrowLeft } from '@lucide/svelte';
import { getContext } from 'svelte';
import TransitionOrnament from '#lib/components/TransitionOrnament.svelte';
import { Button } from '#lib/components/ui/button/index.js';
import { PORTFOLIO, type PortfolioContext } from '#lib/state/portfolio.svelte.js';
import type { PageProps } from './$types';

let { data }: PageProps = $props();
const portfolio = getContext<PortfolioContext>(PORTFOLIO);
const profile = $derived(portfolio.content.profile);
const entries = $derived.by(() => {
	switch (data.section.slug) {
		case 'activities':
			return profile?.activities ?? [];
		case 'soft-skills':
			return profile?.softSkills ?? [];
		case 'hard-skills':
			return profile?.skills ?? [];
		case 'education':
			return profile?.education ?? [];
		case 'languages':
			return profile?.languages ?? [];
		default:
			return [];
	}
});
const hardSkills = $derived(data.section.slug === 'hard-skills');
function skillMark(skill: string) {
	const known: Record<string, string> = {
		javascript: 'JS',
		typescript: 'TS',
		sveltekit: 'S',
		svelte: 'S',
		convex: 'C',
		'ui/ux design': 'UX'
	};
	return known[skill.toLowerCase()] ?? skill.slice(0, 2).toUpperCase();
}
</script>

<svelte:head>
	<title>{data.section.title} — {profile?.name}</title>
	<meta
		name="description"
		content={`${data.section.title} — ${profile?.name ?? 'Yousof Davamkar'}`}
	>
</svelte:head>
<section class="about-detail">
	<header class="detail-heading" data-reveal>
		<h1 class="speech">
			{data.section.title} <span aria-hidden="true">{data.section.emoji}</span>
		</h1>
		<Button href="/about" variant="outline" class="about-back"
			><ArrowLeft aria-hidden="true" />
			Back</Button
		>
	</header>
	<div class="topic-content" data-reveal>
		{#if data.section.slug === 'journey'}
			<p class="journey-copy">{profile?.journey || 'More about my journey is coming soon.'}</p>
		{:else if entries.length}
			<ul
				class:hard-skills={hardSkills}
				class:education={data.section.slug === 'education'}
				class:languages={data.section.slug === 'languages'}
			>
				{#each entries as entry, i (`${data.section.slug}-${i}`)}
					{@const lines = entry.split(/\r?\n/)}
					<li>
						<span class="pointer" aria-hidden="true">👉🏻</span>
						<div>
							{#if hardSkills}
								<span class="skill-mark" aria-hidden="true">{skillMark(entry)}</span>
							{/if}
							<p class="entry-title">{lines[0]}</p>
							{#if lines[1]}
								<p class="entry-detail">{lines[1]}</p>
							{/if}
							{#each lines.slice(2) as line}
								<p class="entry-date">{line}</p>
							{/each}
						</div>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="empty-copy">More details coming soon.</p>
		{/if}
	</div>
	<div class="detail-arches" aria-hidden="true">
		<TransitionOrnament class="large-arch" inverted shared={false} />
		<TransitionOrnament class="small-arch" inverted shared={false} />
	</div>
	<Button
		href={data.next ? `/about/${data.next.slug}` : '/work'}
		variant="outline"
		size="icon"
		class="section-next"
		aria-label={data.next ? `Next: ${data.next.label}` : 'Explore portfolio'}
		><ArrowDown /></Button
	>
</section>

<style>
:global(.site-shell:has(.about-detail)) {
	background: linear-gradient(180deg, #101010, #303030);
}
.about-detail {
	position: relative;
	min-height: max(calc(100svh - 120px), calc(56.25cqw - 120px));
	padding: 2.222222cqw 5.555556cqw 8cqw;
}
.detail-heading {
	display: flex;
	justify-content: space-between;
	align-items: center;
	position: relative;
	z-index: 2;
}
.detail-heading h1 {
	font-size: 1.111111cqw;
	font-weight: 500;
	line-height: 24px;
	padding: 16px 24px;
	border-radius: 50px;
	margin: 0;
}
.detail-heading h1 span {
	margin-left: 5px;
}
.about-detail :global(.about-back) {
	border: 1px solid var(--primary);
	background: transparent;
	color: var(--primary);
	height: 56px;
	border-radius: 100px;
	padding: 0 24px;
	gap: 8px;
	font-size: 16px;
}
.about-detail :global(.about-back svg) {
	width: 24px;
	height: 24px;
	stroke-width: 1.5;
}
.topic-content {
	position: relative;
	z-index: 2;
	margin-top: 4.166667cqw;
	width: 45cqw;
	font-size: 1.111111cqw;
	line-height: 2;
}
.journey-copy {
	white-space: pre-line;
	text-align: justify;
}
.empty-copy {
	color: #bcbcbc;
}
.topic-content ul {
	list-style: none;
	padding: 0;
	margin: 0;
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	column-gap: 3cqw;
	row-gap: 2.222222cqw;
}
.topic-content li {
	display: flex;
	align-items: flex-start;
	gap: 0.555556cqw;
	min-width: 0;
}
.pointer {
	font-size: 2.222222cqw;
	line-height: 1;
	flex: none;
}
.entry-title,
.entry-detail,
.entry-date {
	margin: 0;
	overflow-wrap: anywhere;
}
.entry-title {
	font-weight: 500;
	line-height: 1.75;
}
.entry-detail {
	line-height: 1.75;
}
.entry-date {
	font-size: 0.833333cqw;
	line-height: 2;
}
.topic-content .education {
	row-gap: 2.5cqw;
}
.topic-content .languages {
	grid-template-columns: 1fr;
	gap: 2.222222cqw;
}
.topic-content .hard-skills {
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 4.166667cqw 3cqw;
}
.hard-skills .pointer {
	margin-top: 12px;
}
.skill-mark {
	display: flex;
	align-items: flex-end;
	justify-content: flex-end;
	width: 48px;
	height: 48px;
	padding: 0 3px;
	font-family: Arial, sans-serif;
	font-size: 30px;
	font-weight: 700;
	line-height: 1.15;
	color: #000;
	background: #ffdf00;
	margin-bottom: 8px;
}
.detail-arches {
	position: absolute;
	inset: 0;
	overflow: hidden;
	pointer-events: none;
}
.detail-arches :global(svg) {
	transform: rotate(180deg);
	stroke: #666;
	stroke-width: 0.7;
	opacity: 0.7;
}
.detail-arches :global(.large-arch) {
	width: 26.388889cqw;
	height: 32.986111cqw;
	left: 56.805556cqw;
	bottom: 0;
}
.detail-arches :global(.small-arch) {
	width: 13.194444cqw;
	height: 16.493056cqw;
	right: 2.222222cqw;
	bottom: 0;
}
.about-detail :global(.section-next) {
	z-index: 2;
	bottom: 2.777778cqw;
	width: 56px;
	height: 56px;
}
@media (min-width: 768px) and (max-width: 1100px) {
	.about-detail {
		min-height: calc(100svh - 108px);
	}
	.detail-heading h1,
	.topic-content {
		font-size: 14px;
	}
	.topic-content {
		width: 60cqw;
	}
	.entry-date {
		font-size: 12px;
	}
}
@media (max-width: 767px) {
	.about-detail {
		min-height: max(calc(100svh - 94px), 832px);
		padding: 34px 5.373832cqw 240px;
	}
	.detail-heading h1 {
		font-size: 14px;
		line-height: 22px;
		padding: 8px 16px;
	}
	.about-detail :global(.about-back) {
		position: absolute;
		right: 0;
		top: -52px;
		height: 48px;
		font-size: 14px;
		padding: 0 22px;
	}
	.topic-content {
		margin-top: 32px;
		width: 100%;
		font-size: 14px;
		line-height: 2;
	}
	.topic-content ul,
	.topic-content .education,
	.topic-content .languages {
		grid-template-columns: 1fr;
		gap: 28px;
	}
	.topic-content li {
		gap: 6px;
		min-height: 54px;
	}
	.pointer {
		font-size: 24px;
	}
	.entry-date {
		font-size: 12px;
	}
	.topic-content .hard-skills {
		grid-template-columns: repeat(2, minmax(0, 1fr));
		column-gap: 30px;
		row-gap: 28px;
	}
	.hard-skills .pointer {
		margin-top: 14px;
	}
	.skill-mark {
		width: 48px;
		height: 48px;
	}
	.hard-skills .entry-title {
		font-size: 16px;
	}
	.detail-arches :global(.large-arch) {
		display: none;
	}
	.detail-arches :global(.small-arch) {
		width: 39.252336cqw;
		height: 49.065421cqw;
		right: 0;
		bottom: 0;
	}
	.about-detail :global(.section-next) {
		display: none;
	}
}
</style>
