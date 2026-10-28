<script lang="ts">
 import {getContext,onMount} from 'svelte';
 import {ArrowDown,ArrowUpRight,Download} from '@lucide/svelte';
 import {Button} from '#lib/components/ui/button/index.js';
 import {PORTFOLIO,type PortfolioContext} from '#lib/state/portfolio.svelte.js';
 import {resumeStore} from '#lib/state/resume.js';
 import Portrait from '#lib/components/Portrait.svelte';
 import Ornament from '#lib/components/Ornament.svelte';
 const portfolio=getContext<PortfolioContext>(PORTFOLIO);
 const profile=$derived(portfolio.content.profile);
 let resume=$state<string|null>(null);
 onMount(()=>{const unsub=resumeStore.subscribe([],entry=>{if(entry.result.status==='success')resume=entry.result.data.url;});const result=resumeStore.get([]);if(result.status==='success')resume=result.data.url;return unsub;});
</script>
<svelte:head><title>{profile?.name??'Yosef Davamkar'} — Fullstack web developer</title><meta name="description" content="A portfolio of thoughtful digital experiences, fullstack development and UI/UX design by Yosef Davamkar."/></svelte:head>
<section class="home-page">
 <Ornament class="hero-ornament"/>
 <div class="hero-visual"><Portrait/><div class="experience"><strong>{profile?.experience??'3+'}</strong><span>years of<br/>experience</span></div></div>
 <div class="hero-intro">
  <div class="intro-label"><span class="typing-dots" aria-hidden="true"><i></i><i></i><i></i></span><span>A little introduction</span></div>
  <p class="speech greeting">Hey! <span aria-hidden="true">👋 ☺️</span></p>
  <h1 class="speech intro-title">I’m {profile?.name??'Yosef Davamkar'}, <br/>a <span>{profile?.role??'Fullstack web developer'}!</span></h1>
  <div class="speech speech-tail resume-bubble">{#if resume}<p>A little more about me.</p><a href={resume} target="_blank" rel="noreferrer" class="text-link">Download my CV <Download size={17}/></a>{:else}<p>Have something in mind?</p><a href="/contact" class="text-link">Let’s build it together <ArrowUpRight size={19}/></a>{/if}</div>
  <div class="hero-meta"><span class:available={profile?.available} class="status-dot"></span>{profile?.available?'Open to new opportunities':'Currently focused on my work'}</div>
 </div>
 <Button href="/about" variant="outline" size="icon" class="section-next" aria-label="Discover more about me"><ArrowDown size={22}/></Button>
 <span class="page-note">DESIGN WITH INTENT. BUILD WITH CARE.</span>
</section>
