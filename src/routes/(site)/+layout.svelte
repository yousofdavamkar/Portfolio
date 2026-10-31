<script lang="ts">
import { onMount, setContext, untrack } from 'svelte';
import Header from '#lib/components/Header.svelte';
import SceneGraphics from '#lib/components/SceneGraphics.svelte';
import { PORTFOLIO, type PortfolioContext } from '#lib/state/portfolio.svelte.js';
import { createProjectNavigation } from '#lib/state/project-navigation.js';
import { PUBLIC_CONVEX_URL } from '$app/env/public';
import { page } from '$app/state';
import { api } from '../../../convex/_generated/api';
import type { LayoutProps } from './$types';

let { data, children }: LayoutProps = $props();
let content = $state(untrack(() => data.content));
let connected = $state(true);
const projectNavigation = createProjectNavigation();
setContext<PortfolioContext>(PORTFOLIO, {
	get content() {
		return content;
	}
});
setContext('project-navigation', projectNavigation);
onMount(() => {
	let disposed = false;
	let disconnect = () => {};
	// SSR content stays usable while the live-update bundle loads separately.
	void import('convex/browser')
		.then(({ ConvexClient }) => {
			if (disposed) return;
			const client = new ConvexClient(PUBLIC_CONVEX_URL);
			const unsub = client.onUpdate(
				api.portfolio.content,
				{},
				(value) => {
					content = value;
					connected = true;
				},
				() => {
					connected = false;
				}
			);
			disconnect = () => {
				unsub();
				void client.close();
			};
		})
		.catch(() => {
			if (!disposed) connected = false;
		});
	return () => {
		disposed = true;
		disconnect();
	};
});
</script>
<a class="skip-link" href="#main">Skip to content</a>
<div class="site-shell">
	{#if page.url.pathname !== '/' &&
		page.url.pathname !== '/work' &&
		page.url.pathname !== '/contact' &&
		!page.url.pathname.startsWith('/about')}
		<SceneGraphics />
	{/if}
	<Header />
	<main id="main">{@render children()}</main>
	{#if !connected}
		<p class="connection-note" role="status">Showing the last available version. Reconnecting…</p>
	{/if}
</div>
