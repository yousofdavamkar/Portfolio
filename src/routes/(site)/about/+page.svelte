<script lang="ts">
import { ArrowDown } from '@lucide/svelte';
import { getContext } from 'svelte';
import { aboutSections } from '#lib/about.js';
import Portrait from '#lib/components/Portrait.svelte';
import TransitionOrnament from '#lib/components/TransitionOrnament.svelte';
import { Button } from '#lib/components/ui/button/index.js';
import { PORTFOLIO, type PortfolioContext } from '#lib/state/portfolio.svelte.js';

const portfolio = getContext<PortfolioContext>(PORTFOLIO);
const profile = $derived(portfolio.content.profile);
</script>

<svelte:head>
	<title>About me — {profile?.name}</title>
	<meta name="description" content={profile?.bio}>
</svelte:head>
<section class="about-page">
	<h1 data-reveal class="speech about-label speech-tail">
		About me <span aria-hidden="true">😎</span>
	</h1>
	<div class="about-portrait"><Portrait home about /></div>
	<div class="about-choices">
		<h2 data-reveal class="speech about-question">What do you want to know about me?</h2>
		<nav aria-label="About me topics">
			{#each aboutSections as section (section.slug)}
				<Button href={`/about/${section.slug}`} variant="outline" class="about-topic" data-reveal>
					<span class="desktop-label">{section.label}</span>
					<span class="mobile-label">{section.mobile}</span>
					<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor">
						<path d="M1 12h22M16 5l7 7-7 7" />
					</svg>
				</Button>
			{/each}
		</nav>
	</div>
	<TransitionOrnament class="about-arch" inverted />
	<Button
		href="/work"
		variant="outline"
		size="icon"
		class="section-next"
		aria-label="Explore portfolio"
		><ArrowDown /></Button
	>
</section>

<style>
:global(.site-shell:has(.about-page)),
:global(.site-shell:has(.about-detail)) {
	background: linear-gradient(180deg, #101010, #303030);
}
.about-page {
	position: relative;
	min-height: max(calc(100svh - 120px), calc(56.25cqw - 120px));
}
.about-label {
	position: absolute;
	left: 6.458333cqw;
	top: 2.222222cqw;
	margin: 0;
	padding: 1.111111cqw 2.222222cqw;
	font-size: 1.666667cqw;
	line-height: 1.5;
	border-radius: 3.472222cqw;
	z-index: 2;
}
.about-label span {
	margin-left: 0.347222cqw;
	font-size: 2.222222cqw;
	line-height: 1;
	vertical-align: middle;
}
.about-portrait {
	position: absolute;
	bottom: 0;
	left: 0;
	width: 61.25cqw;
	height: 56.25cqw;
}
.about-choices {
	position: relative;
	z-index: 2;
	margin-left: 53.055556cqw;
	padding-top: 2.222222cqw;
	padding-bottom: 6.111111cqw;
}
.about-question {
	margin: 0 0 3.333333cqw;
	padding: 1.111111cqw 2.222222cqw;
	font-size: 1.666667cqw;
	line-height: 1.416667;
	border-radius: 3.472222cqw;
	white-space: nowrap;
}
.about-choices nav {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: 1.666667cqw;
}
.about-page :global(.about-topic) {
	background: transparent;
	border: 1px solid var(--primary);
	color: var(--primary);
	border-radius: 100px;
	padding: 0 1.666667cqw;
	height: 3.888889cqw;
	min-height: 44px;
	font-size: 1.111111cqw;
	font-weight: 500;
	gap: 0.555556cqw;
}
.about-page :global(.about-topic svg) {
	width: 1.666667cqw;
	height: 1.666667cqw;
	stroke-width: 1.5;
}
.mobile-label {
	display: none;
}
.about-page :global(.about-arch) {
	width: 26.388889cqw;
	height: 32.986111cqw;
	right: -13.333333cqw;
	bottom: 0;
	transform: rotate(180deg);
	stroke: #666;
	stroke-width: 0.7;
	opacity: 0.7;
}
.about-page :global(.section-next) {
	left: 5.555556cqw;
	bottom: 2.777778cqw;
	width: 3.888889cqw;
	height: 3.888889cqw;
	min-width: 44px;
	min-height: 44px;
	z-index: 3;
}
@media (hover: hover) and (pointer: fine) {
	.about-page :global(.about-topic:hover) {
		background: #ffca0510;
	}
}
@media (min-width: 768px) and (max-width: 1100px) {
	.about-page {
		min-height: max(calc(100svh - 108px), calc(56.25cqw - 108px));
	}
	.about-page :global(.about-topic) {
		font-size: max(12px, 1.111111cqw);
	}
}
@media (max-width: 767px) {
	.about-page {
		min-height: max(calc(100svh - 94px), calc(216.35514cqw - 94px));
		padding: 10px 5.373832cqw 100px;
	}
	.about-label {
		position: relative;
		left: 1.869159cqw;
		top: auto;
		font-size: 16px;
		line-height: 24px;
		padding: 8px 16px;
		border-radius: 50px;
		margin: 0 0 26px;
	}
	.about-label span {
		margin-left: 4px;
		font-size: 16px;
	}
	.about-portrait {
		display: none;
	}
	.about-choices {
		margin: 0;
		padding: 0;
	}
	.about-question {
		font-size: clamp(12px, 3.271028cqw, 18px);
		line-height: 22px;
		padding: 8px 16px;
		border-radius: 50px;
		margin: 0 0 40px;
	}
	.about-choices nav {
		gap: 24px;
	}
	.about-page :global(.about-topic) {
		font-size: 14px;
		height: 48px;
		font-weight: 500;
		padding: 0 24px;
		gap: 8px;
	}
	.about-page :global(.about-topic svg) {
		width: 24px;
		height: 24px;
	}
	.desktop-label {
		display: none;
	}
	.mobile-label {
		display: inline;
	}
	.about-page :global(.about-arch) {
		width: 88.785047cqw;
		height: 110.981308cqw;
		right: -49.53271cqw;
		bottom: -5.607477cqw;
	}
	.about-page :global(.section-next) {
		display: none;
	}
}
</style>
