<script lang="ts">
 import './layout.css';
 import NavigationSkeleton from '#lib/components/NavigationSkeleton.svelte';
 import {onMount} from 'svelte';
 onMount(()=>{const keyboard=()=>document.documentElement.dataset.input='keyboard';const pointer=()=>document.documentElement.dataset.input='pointer';window.addEventListener('keydown',keyboard);window.addEventListener('pointerdown',pointer);return()=>{window.removeEventListener('keydown',keyboard);window.removeEventListener('pointerdown',pointer);};});
 import '@fontsource/poppins/400.css';
 import '@fontsource/poppins/500.css';
 import '@fontsource/poppins/600.css';
 import { Toaster } from '#lib/components/ui/sonner/index.js';
 let {children}=$props();
 let routeLoading=$state(false);
</script>
<svelte:head><link rel="icon" href="/favicon.svg"/><meta name="theme-color" content="#121212"/></svelte:head>
<div inert={routeLoading} aria-busy={routeLoading}>{@render children()}</div>
<NavigationSkeleton bind:active={routeLoading}/>
<Toaster theme="dark" richColors position="bottom-right" />
