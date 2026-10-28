<script lang="ts">
 import MediaImage from "#lib/components/MediaImage.svelte";
 import {ArrowLeft,ArrowUpRight} from '@lucide/svelte';
 import {Button} from '#lib/components/ui/button/index.js';
 import {Badge} from '#lib/components/ui/badge/index.js';
 let {data}=$props();
</script>
<svelte:head><title>{data.project.title} — Yosef Davamkar</title><meta name="description" content={data.project.summary}/></svelte:head>
<article class="project-detail content-page">
 <Button href="/work" variant="outline" class="pill-action back-link"><ArrowLeft size={18}/> All projects</Button>
 <div class="detail-grid"><div class="detail-art"><MediaImage loading="eager" src={data.project.image} alt={`${data.project.title} preview`} width={612} height={537}/></div><div class="detail-copy"><span class="eyebrow">{data.project.category}</span><h1>{data.project.title}</h1><p class="body-copy lead">{data.project.summary}</p><div class="case-study">{#each data.project.body.split('\n\n') as paragraph}<p>{paragraph}</p>{/each}</div><div class="skills-list">{#each data.project.stack as tech}<Badge variant="outline">{tech}</Badge>{/each}</div>{#if data.project.url}<Button href={data.project.url} target="_blank" rel="noreferrer" variant="outline" class="pill-action">Visit project <ArrowUpRight/></Button>{:else}<Button href="/contact" variant="outline" class="pill-action">Discuss a similar project <ArrowUpRight/></Button>{/if}</div></div>
</article>
