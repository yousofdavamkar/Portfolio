<script lang="ts">
import { ArrowUpRight, Menu, X } from '@lucide/svelte';
import { Button } from '#lib/components/ui/button/index.js';
import * as Sheet from '#lib/components/ui/sheet/index.js';
import { page } from '$app/state';

let open = $state(false),
	collapsed = $state(false);
const links = [
	{ href: '/', label: 'Home' },
	{ href: '/about', label: 'About me' },
	{ href: '/work', label: 'Portfolio' },
	{ href: '/contact', label: 'Contact me' }
];
</script>
<header class="site-header">
	<div class="desktop-navigation">
		<Button
			variant="secondary"
			size="icon"
			class="round-button"
			onclick={() => (collapsed = !collapsed)}
			aria-label={collapsed ? 'Show navigation' : 'Collapse navigation'}
			aria-expanded={!collapsed}
			>{#if collapsed}
				<Menu class="size-8" size={24} strokeWidth={1.5} />
			{:else}
				<X class="size-10" size={28} strokeWidth={1} />
			{/if}</Button
		>
		{#if !collapsed}
			<nav aria-label="Main navigation" class="nav-pill">
				{#each links as link}
					<a
						href={link.href}
						aria-current={(
							link.href === '/'
								? page.url.pathname === '/'
								: page.url.pathname.startsWith(link.href)
						)
							? 'page'
							: undefined}
						>{link.label}</a
					>
				{/each}
			</nav>
		{/if}
	</div>
	<div class="mobile-navigation">
		<Sheet.Root bind:open>
			<Sheet.Trigger class="round-button mobile-menu" aria-label="Open navigation"
				><Menu class="size-8" size={24} strokeWidth={1.5} /></Sheet.Trigger
			>
			<Sheet.Content side="left" class="mobile-sheet">
				<Sheet.Header
					><Sheet.Title>Yousof Davamkar<span class="accent-text">.</span></Sheet.Title
					><Sheet.Description>Fullstack web developer</Sheet.Description></Sheet.Header
				>
				<nav aria-label="Mobile navigation">
					{#each links as link}
						<a
							href={link.href}
							onclick={() => (open = false)}
							aria-current={page.url.pathname === link.href ? 'page' : undefined}
							>{link.label}<ArrowUpRight size={21} /></a
						>
					{/each}
				</nav>
				<p class="sheet-note">Thoughtful design.<br>Considered code.</p>
			</Sheet.Content>
		</Sheet.Root>
	</div>
</header>
