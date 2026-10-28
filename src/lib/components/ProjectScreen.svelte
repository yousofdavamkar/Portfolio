<script lang="ts">
import MediaImage from '#lib/components/MediaImage.svelte';

let {
	src,
	alt,
	loading = 'lazy'
}: { src: string; alt: string; loading?: 'lazy' | 'eager' } = $props();
// The original Figma export includes the device. Reuse only its screen pixels;
// new project screenshots already contain screen content and need no crop.
const legacyMockup = $derived(src === '/images/featured-project.png');
</script>

<div class="screen-image" class:legacy-mockup={legacyMockup}>
	<MediaImage {src} {alt} {loading} width={420} height={265} fit="cover" />
</div>

<style>
.screen-image {
	width: 100%;
	height: 100%;
	overflow: hidden;
	position: relative;
}
.screen-image :global(.media-image) {
	width: 100%;
	height: 100%;
}
.legacy-mockup :global(.media-image) {
	position: absolute;
	width: 145.714286%;
	height: 202.641509%;
	left: -22.619048%;
	top: -7.924528%;
}
</style>
