<script lang="ts">
import { Button } from '#lib/components/ui/button/index.js';
import { page } from '$app/state';
</script>
<svelte:head><title>{page.status} — Portfolio</title></svelte:head>
<main class="error-page">
	<span class="eyebrow">{page.status}</span>
	<h1>{page.status === 404 ? 'This page wandered off.' : 'Something didn’t load.'}</h1>
	<p>
		{page.status === 404
			? 'Let’s get you back to the good stuff.'
			: 'Please try again in a moment.'}
	</p>
	<Button href="/" class="pill-action">Back to home</Button>
</main>
