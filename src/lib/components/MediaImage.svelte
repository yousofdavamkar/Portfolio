<script lang="ts">
 import { Skeleton } from '#lib/components/ui/skeleton/index.js';
 let { src, alt, width, height, loading = 'lazy', class: className = '', fit = 'contain' }: {
  src: string; alt: string; width: number; height: number;
  loading?: 'lazy' | 'eager'; class?: string; fit?: 'contain' | 'cover';
 } = $props();
 let image = $state<HTMLImageElement>();
 let settled = $state('');
 let failed = $state('');
 const pending = $derived(settled !== src && failed !== src);
 // Cached images may finish before hydration attaches the load listener.
 $effect(() => {
  const current = src;
  if (image?.complete && image.getAttribute('src') === current) {
   if (image.naturalWidth > 0) settled = current;
   else failed = current;
  }
 });
</script>

<div class={`media-image ${className}`} style:aspect-ratio={`${width} / ${height}`} aria-busy={pending}>
 {#if pending}<Skeleton class="media-placeholder" aria-hidden="true" />{/if}
 {#key src}
  <img bind:this={image} {src} {alt} {width} {height} {loading} decoding="async"
   style:object-fit={fit} class:failed={failed === src}
   onload={() => settled = src} onerror={() => failed = src} />
 {/key}
 {#if failed === src}<span class="media-error" role="img" aria-label={alt || 'Image unavailable'}>Image unavailable</span>{/if}
</div>

<style>
 :where(.media-image){width:100%}
 .media-image{position:relative;isolation:isolate;overflow:hidden}
 .media-image :global(.media-placeholder){position:absolute;inset:0;border-radius:inherit}
 .media-image img{position:relative;z-index:1;width:100%;height:100%;object-position:top}
 .media-image img.failed{visibility:hidden}
 .media-error{position:absolute;inset:0;display:grid;place-items:center;background:var(--muted);color:var(--muted-foreground);font-size:13px;padding:16px;text-align:center}
</style>
