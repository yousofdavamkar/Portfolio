<script lang="ts">
import { ArrowDown } from '@lucide/svelte';
import { getContext, onMount } from 'svelte';
import Portrait from '#lib/components/Portrait.svelte';
import { Button } from '#lib/components/ui/button/index.js';
import { Skeleton } from '#lib/components/ui/skeleton/index.js';
import { PORTFOLIO, type PortfolioContext } from '#lib/state/portfolio.svelte.js';
import { resumeStore } from '#lib/state/resume.js';

const portfolio = getContext<PortfolioContext>(PORTFOLIO);
const profile = $derived(portfolio.content.profile);
let resume = $state<string | null>(null);
let resumePending = $state(false);
onMount(() => {
	resumePending = true;
	const unsub = resumeStore.subscribe([], (entry) => {
		if (entry.result.status === 'success') {
			resume = entry.result.data.url;
			resumePending = false;
		} else if (entry.result.status === 'failure') {
			resumePending = false;
		}
	});
	const result = resumeStore.get([]);
	if (result.status === 'success') {
		resume = result.data.url;
		resumePending = false;
	} else if (result.status === 'failure') {
		resumePending = false;
	}
	return unsub;
});
</script>
<svelte:head
	><title>{profile?.name ?? 'Yousof Davamkar'} — Fullstack web developer</title>
	<meta
		name="description"
		content="A portfolio of thoughtful digital experiences, fullstack development and UI/UX design by Yousof Davamkar."
	></svelte:head
>
<section class="home-page">
	<svg
		class="home-ornament"
		aria-hidden="true"
		viewBox="0 0 300 375"
		preserveAspectRatio="none"
		fill="none"
	>
		{#each Array(10) as _, i}
			<path
				d={`M ${i * 10.5 + 1} -20 V 225 A ${149 - i * 10.5} ${149 - i * 10.5} 0 0 0 ${299 - i * 10.5} 225 V -20`}
			/>
		{/each}
	</svg>
	<div class="hero-visual">
		<Portrait home />
		<div class="experience">
			{#each [0, 1, 2] as index}
				<p aria-hidden={index > 0 ? 'true' : undefined}>
					{profile?.experience ?? '3+'}
					years<br>experience
				</p>
			{/each}
		</div>
	</div>
	<div class="hero-intro">
		<div data-reveal class="intro-label">
			<span class="typing-dots" aria-hidden="true"><i></i><i></i><i></i></span
			><span>Yousof is typing…</span>
		</div>
		<p data-reveal class="speech greeting">Hey! <span aria-hidden="true">👋 ☺️</span></p>
		<h1 data-reveal class="speech intro-title">
			I’m {profile?.name ?? 'Yousof Davamkar'}, a
			<span>{profile?.role ?? 'Fullstack web developer'}!</span>
		</h1>
		<div data-reveal class="speech speech-tail resume-bubble">
			{#if resumePending}
				<div class="resume-loading" role="status" aria-label="Loading resume">
					<Skeleton class="h-5 w-44 bg-neutral-200" aria-hidden="true" />
					<Skeleton class="mt-3 h-5 w-52 max-w-full bg-neutral-200" aria-hidden="true" />
				</div>
			{:else if resume}
				<p>Download my CV from link below</p>
				<a href={resume} target="_blank" rel="noreferrer" class="text-link">(Download CV)</a>
			{:else}
				<p>Have something in mind?</p>
				<a href="/contact" class="text-link">Let’s build it together</a>
			{/if}
		</div>
	</div>
	<Button
		href="/about"
		variant="outline"
		size="icon"
		class="section-next"
		aria-label="Discover more about me"
		><ArrowDown class="size-8" size={22} strokeWidth={1} /></Button
	>
</section>

<style>
:global(.site-shell:has(.home-page)) {
	background: linear-gradient(180deg, #101010, #303030);
}
.home-page {
	position: relative;
	height: max(calc(100svh - 120px), 47.916667cqw);
	overflow: visible;
}
.hero-visual {
	position: absolute;
	bottom: 0;
	left: 0;
	width: 61.25cqw;
	height: 56.25cqw;
}
.hero-intro {
	position: absolute;
	left: 53.125cqw;
	bottom: 9.027778cqw;
	width: 31.25cqw;
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: 1.666667cqw;
	z-index: 2;
}
.hero-intro .speech {
	margin: 0;
	padding: 1.111111cqw 2.222222cqw;
	border-radius: 2.5cqw;
	font-size: 1.666667cqw;
	line-height: 1.416667;
	font-weight: 300;
	letter-spacing: 0;
}
.hero-intro .greeting {
	width: 14.097222cqw;
	white-space: nowrap;
	padding-block: 1.180556cqw;
}
.greeting span {
	font-size: 2.222222cqw;
	line-height: 1;
	vertical-align: middle;
}
.hero-intro .intro-title,
.hero-intro .resume-bubble {
	width: 100%;
}
.intro-label {
	display: flex;
	flex-direction: column;
	gap: 0.694444cqw;
	margin-bottom: 0.416667cqw;
	font-size: 0.972222cqw;
	line-height: 1.666667cqw;
}
.typing-dots {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.555556cqw;
	width: 7.222222cqw;
	height: 3.333333cqw;
	border-radius: 100px;
	background: #fff;
}
.typing-dots i {
	width: 1.111111cqw;
	height: 1.111111cqw;
	border-radius: 50%;
	background: #b8b8b8;
}
.typing-dots i:nth-child(2) {
	background: #d1d1d1;
}
.resume-bubble .text-link {
	color: #a18aff;
}
.experience {
	position: absolute;
	left: 6.597222cqw;
	top: 11.527778cqw;
	display: grid;
	gap: 1.666667cqw;
	font-size: 1.111111cqw;
	line-height: 1.666667cqw;
	color: #fff;
}
.home-ornament {
	position: absolute;
	width: 20.833333cqw;
	height: 26.041667cqw;
	right: 5.555556cqw;
	top: -120px;
	stroke: #ffca05;
	stroke-width: 0.65;
	opacity: 0.65;
	pointer-events: none;
}
.home-page :global(.section-next) {
	bottom: 2.777778cqw;
	left: 5.555556cqw;
	width: 3.888889cqw;
	height: 3.888889cqw;
	min-width: 44px;
	min-height: 44px;
	z-index: 3;
}
@media (max-width: 1100px) and (min-width: 768px) {
	.home-page {
		height: max(calc(100svh - 108px), 47.916667cqw);
	}
	.home-ornament {
		top: -108px;
	}
	.hero-intro .speech {
		font-size: max(16px, 1.666667cqw);
	}
	.intro-label,
	.experience {
		font-size: max(12px, 0.972222cqw);
	}
}
@media (max-width: 767px) {
	.home-page {
		height: auto;
		min-height: calc(100svh - 94px);
		display: flex;
		flex-direction: column;
		overflow: visible;
	}
	.hero-intro {
		order: 0;
		position: relative;
		left: auto;
		bottom: auto;
		width: min(296px, calc(100% - 66px));
		margin: 6px 33px 0;
		gap: 16px;
	}
	.hero-intro .speech {
		font-size: 16px;
		line-height: 22px;
		padding: 9px 16px;
		border-radius: 20px;
		font-weight: 400;
	}
	.greeting span {
		font-size: 16px;
	}
	.hero-intro .greeting {
		width: auto;
		padding-block: 9px;
	}
	.hero-intro .intro-title {
		margin-top: -1px;
	}
	.intro-label {
		font-size: 12px;
		line-height: 20px;
		gap: 4px;
		margin: 0 0 -2px 3px;
	}
	.typing-dots {
		width: 43px;
		height: 20px;
		gap: 3px;
	}
	.typing-dots i {
		width: 7px;
		height: 7px;
	}
	.hero-visual {
		order: 1;
		position: relative;
		width: 100%;
		height: 126.168224cqw;
		min-height: 440px;
		margin-top: 33px;
	}
	.experience {
		left: 55.373832cqw;
		top: 7px;
		font-size: 16px;
		line-height: 24px;
		gap: 20px;
		z-index: 2;
	}
	.home-ornament {
		top: -94px;
		right: -42px;
		width: 114px;
		height: 180px;
	}
	.home-page :global(.section-next) {
		left: auto;
		right: 24px;
		bottom: 38px;
		width: 48px;
		height: 48px;
	}
}
</style>
