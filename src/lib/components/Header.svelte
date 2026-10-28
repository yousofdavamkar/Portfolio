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
			aria-controls="desktop-menu"
			>{#if collapsed}
				<Menu class="size-8" size={24} strokeWidth={1.5} />
			{:else}
				<X class="size-10" size={28} strokeWidth={1} />
			{/if}</Button
		>
		<nav
			id="desktop-menu"
			aria-label="Main navigation"
			class="nav-pill animated-menu"
			class:collapsed
			inert={collapsed}
			aria-hidden={collapsed}
		>
			{#each links as link, index}
				<a
					href={link.href}
					style={`--menu-index: ${index}`}
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
				<nav aria-label="Mobile navigation" class="mobile-menu-links" data-menu-open={open}>
					{#each links as link, index}
						<a
							href={link.href}
							style={`--menu-index: ${index}`}
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

<style>
/* Keep the desktop links mounted so a second click reverses the current motion. */
.animated-menu {
	transform-origin: left center;
	opacity: 1;
	transform: translateX(0) scale(1);
	visibility: visible;
	transition:
		opacity 220ms ease,
		transform 260ms var(--ease-out),
		visibility 0s;
}
.animated-menu.collapsed {
	opacity: 0;
	transform: translateX(-10px) scale(0.98);
	visibility: hidden;
	transition-delay: 0s, 0s, 240ms;
}
.animated-menu a {
	opacity: 1;
	transform: translateX(0);
	transition:
		opacity 180ms ease,
		transform 220ms var(--ease-out);
	transition-delay: calc(35ms + var(--menu-index) * 45ms);
}
.animated-menu.collapsed a {
	opacity: 0;
	transform: translateX(-14px);
	transition-duration: 130ms, 160ms;
	transition-delay: calc((3 - var(--menu-index)) * 25ms);
}
.mobile-menu-links[data-menu-open="true"] a {
	animation: menu-item-enter 220ms var(--ease-out) both;
	animation-delay: calc(55ms + var(--menu-index) * 45ms);
}
.mobile-menu-links[data-menu-open="false"] a {
	animation: menu-item-exit 110ms ease both;
	animation-delay: calc((3 - var(--menu-index)) * 25ms);
}
@keyframes menu-item-enter {
	from {
		opacity: 0;
		transform: translateX(-16px);
	}
	to {
		opacity: 1;
		transform: translateX(0);
	}
}
@keyframes menu-item-exit {
	from {
		opacity: 1;
		transform: translateX(0);
	}
	to {
		opacity: 0;
		transform: translateX(-12px);
	}
}
:global(html[data-input="keyboard"]) .animated-menu,
:global(html[data-input="keyboard"]) .animated-menu a {
	transition: none;
}
:global(html[data-input="keyboard"]) .mobile-menu-links a {
	animation: none;
}
@media (prefers-reduced-motion: reduce) {
	.animated-menu,
	.animated-menu a {
		transition: none;
	}
	.mobile-menu-links a {
		animation: none;
	}
}
</style>
