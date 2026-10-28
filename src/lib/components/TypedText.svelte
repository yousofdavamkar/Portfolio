<script lang="ts">
let { text, visible = Number.POSITIVE_INFINITY }: { text: string; visible?: number } = $props();
const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
const characters = $derived(Array.from(segmenter.segment(text), ({ segment }) => segment));
</script>

<span class="typed-text"
	><span class="sr-only">{text}</span
	><span aria-hidden="true"
		>{#each characters as character, index}
			<span class="typed-character" class:untyped={index >= visible}>{character}</span>
		{/each}</span
	></span
>

<style>
/* Invisible characters reserve the final line wraps while the message is typed. */
.untyped {
	visibility: hidden;
}
@media (prefers-reduced-motion: reduce), (scripting: none) {
	.untyped {
		visibility: visible;
	}
}
</style>
