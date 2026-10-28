<script lang="ts">
import { Skeleton } from '#lib/components/ui/skeleton/index.js';
import { navigating } from '$app/state';

let { active = $bindable(false), suppressed = false }: { active?: boolean; suppressed?: boolean } =
	$props();
const pending = $derived(
	Boolean(navigating.to && navigating.from?.url.pathname !== navigating.to.url.pathname)
);
$effect(() => {
	if (!pending || suppressed) {
		active = false;
		return;
	}
	// Avoid flashing a loading screen for cached and instant navigations.
	const timer = setTimeout(() => (active = true), 150);
	return () => clearTimeout(timer);
});
</script>

{#if active && pending && !suppressed}
	<div
		class="navigation-loading"
		role="status"
		aria-live="polite"
		aria-label="Loading page"
		aria-busy="true"
	>
		<span class="sr-only">Loading page…</span>
		<div aria-hidden="true" class="loading-shell">
			<div class="loading-header">
				<Skeleton class="size-14 rounded-full" />
				<Skeleton class="h-14 w-80 max-w-[65%] rounded-full" />
			</div>
			<div class="loading-body">
				<Skeleton class="loading-art rounded-[2rem]" />
				<div class="loading-copy">
					<Skeleton class="h-5 w-32" /><Skeleton class="h-12 w-4/5" />
					<Skeleton class="h-8 w-full" /><Skeleton class="h-8 w-3/4" />
					<Skeleton class="mt-6 h-12 w-44 rounded-full" />
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
.navigation-loading {
	position: fixed;
	inset: 0;
	z-index: 40;
	background: var(--background);
	overflow: auto;
	pointer-events: none;
}
.loading-shell {
	max-width: 1440px;
	margin: auto;
	padding: 32px clamp(24px, 5.55vw, 80px);
}
.loading-header {
	display: flex;
	gap: 16px;
	align-items: center;
}
.loading-body {
	display: grid;
	grid-template-columns: 1fr 1fr;
	align-items: center;
	gap: 8%;
	padding-top: 80px;
}
.loading-body :global(.loading-art) {
	height: min(60svh, 570px);
	min-height: 260px;
}
.loading-copy {
	display: flex;
	flex-direction: column;
	gap: 20px;
}
@media (max-width: 767px) {
	.loading-shell {
		padding-top: 22px;
	}
	.loading-body {
		grid-template-columns: 1fr;
		padding-top: 50px;
		gap: 40px;
	}
	.loading-copy {
		grid-row: 1;
	}
	.loading-body :global(.loading-art) {
		height: 300px;
	}
}
</style>
