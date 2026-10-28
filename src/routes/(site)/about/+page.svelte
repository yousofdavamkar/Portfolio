<script lang="ts">
import { ArrowDown, ArrowRight, Code2, Heart, Layers, Route } from '@lucide/svelte';
import { getContext } from 'svelte';
import Ornament from '#lib/components/Ornament.svelte';
import Portrait from '#lib/components/Portrait.svelte';
import * as Accordion from '#lib/components/ui/accordion/index.js';
import { Badge } from '#lib/components/ui/badge/index.js';
import { Button } from '#lib/components/ui/button/index.js';
import { PORTFOLIO, type PortfolioContext } from '#lib/state/portfolio.svelte.js';

const portfolio = getContext<PortfolioContext>(PORTFOLIO);
const profile = $derived(portfolio.content.profile);
</script>
<svelte:head
	><title>About me — {profile?.name}</title>
	<meta name="description" content={profile?.bio}></svelte:head
>
<section class="about-page content-page">
	<h1 data-reveal class="speech section-label speech-tail">
		About me <span aria-hidden="true">😎</span>
	</h1>
	<div class="about-grid">
		<div class="about-visual"><Portrait compact /></div>
		<div data-reveal class="about-content">
			<h2 class="speech question-bubble">What do you want to know about me?</h2>
			<p class="body-copy">{profile?.bio}</p>
			<Accordion.Root type="single" class="about-accordion">
				<Accordion.Item value="journey"
					><Accordion.Trigger
						><span><Route size={19} /> My journey</span></Accordion.Trigger
					><Accordion.Content
						><p class="body-copy whitespace-pre-line">{profile?.journey}</p></Accordion.Content
					></Accordion.Item
				>
				<Accordion.Item value="skills"
					><Accordion.Trigger
						><span><Code2 size={19} /> My hard skills</span></Accordion.Trigger
					><Accordion.Content
						><div class="skills-list">
							{#each profile?.skills ?? [] as skill}
								<Badge variant="outline">{skill}</Badge>
							{/each}
						</div></Accordion.Content
					></Accordion.Item
				>
				<Accordion.Item value="approach"
					><Accordion.Trigger
						><span><Layers size={19} /> How I work</span></Accordion.Trigger
					><Accordion.Content
						><p class="body-copy">
							From the first sketch to the last interaction, I care about how an experience looks,
							feels, and works. Design and development belong in the same conversation.
						</p></Accordion.Content
					></Accordion.Item
				>
				<Accordion.Item value="interests"
					><Accordion.Trigger
						><span><Heart size={19} /> What I care about</span></Accordion.Trigger
					><Accordion.Content
						><p class="body-copy">
							Clear interfaces, accessible experiences, and the small details that make everyday
							interactions feel effortless.
						</p></Accordion.Content
					></Accordion.Item
				>
			</Accordion.Root>
			<Button href="/work" variant="outline" class="pill-action"
				>Explore my work <ArrowRight size={18} /></Button
			>
		</div>
	</div>
	<Ornament class="about-ornament" />
	<Button
		href="/work"
		variant="outline"
		size="icon"
		class="section-next"
		aria-label="Explore portfolio"
		><ArrowDown size={22} /></Button
	>
</section>
