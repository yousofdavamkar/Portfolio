<script lang="ts">
let {
	class: className = '',
	inverted = false,
	shared = true
}: { class?: string; inverted?: boolean; shared?: boolean } = $props();
</script>

<svg
	class={`transition-ornament ${className}`}
	data-shared-art={shared ? 'ornament' : undefined}
	data-art-angle={inverted ? 180 : 0}
	aria-hidden="true"
	viewBox="0 0 300 375"
	preserveAspectRatio="none"
	fill="none"
>
	{#each Array(10) as _, i}
		<path
			d={`M ${i * 10.5 + 1} -20 V 225 A ${149 - i * 10.5} ${149 - i * 10.5} 0 0 0 ${299 - i * 10.5} 225 V -20`}
		/>
	{/each}
</svg>

<style>
.transition-ornament {
	position: absolute;
	width: 240px;
	height: 355px;
	pointer-events: none;
	stroke: var(--primary);
	stroke-width: 0.65;
	opacity: 0.4;
}
</style>
