<script lang="ts">
import type { LayoutProps } from './$types';
import './layout.css';
import { onMount } from 'svelte';
import NavigationSkeleton from '#lib/components/NavigationSkeleton.svelte';
import PageTransitions from '#lib/components/PageTransitions.svelte';

onMount(() => {
	const keyboard = () => (document.documentElement.dataset['input'] = 'keyboard');
	const pointer = () => (document.documentElement.dataset['input'] = 'pointer');
	window.addEventListener('keydown', keyboard);
	window.addEventListener('pointerdown', pointer);
	return () => {
		window.removeEventListener('keydown', keyboard);
		window.removeEventListener('pointerdown', pointer);
	};
});

import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import { Toaster } from '#lib/components/ui/sonner/index.js';

let { children }: LayoutProps = $props();
let routeLoading = $state(false);
let transitioning = $state(false);
</script>
<svelte:head
	><link rel="icon" href="/favicon.svg">
	<meta name="theme-color" content="#121212"></svelte:head
>
<div aria-busy={routeLoading || transitioning}>
	{@render children()}
</div>
<PageTransitions bind:active={transitioning} />
<NavigationSkeleton bind:active={routeLoading} suppressed={transitioning} />
<Toaster theme="dark" richColors position="bottom-right" />
