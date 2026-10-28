<script lang="ts">
import type { Snippet } from 'svelte';

let { children, sharedArt }: { children: Snippet; sharedArt?: string } = $props();
</script>

<div class="laptop" data-shared-art={sharedArt}>
	<div class="pedestal-body" aria-hidden="true"></div>
	<div class="pedestal-top" aria-hidden="true"></div>
	<div class="laptop-lid" aria-hidden="true"></div>
	<div class="laptop-screen">{@render children()}</div>
	<div class="laptop-base" aria-hidden="true"><span></span></div>
</div>

<style>
.laptop {
	position: relative;
	width: 100%;
	aspect-ratio: 612 / 537;
	container-type: inline-size;
	isolation: isolate;
}
.pedestal-body {
	position: absolute;
	inset: 59% 0 0;
	background: linear-gradient(110deg, #6c7075, #45494c 48%, #151616);
}
.pedestal-top {
	position: absolute;
	left: 0;
	top: 54.75%;
	width: 100%;
	height: 9.5%;
	border-radius: 50%;
	background: linear-gradient(100deg, #515358, #232426 68%, #111);
	border-bottom: 1px solid #8a742c;
	box-shadow: inset 0 1px 0 #080808;
}
.laptop-lid {
	position: absolute;
	left: 12.75%;
	top: 0;
	width: 74.18%;
	height: 59%;
	border-radius: 3cqw 3cqw 0.6cqw 0.6cqw;
	border: 1px solid #c8c8c8;
	background: linear-gradient(120deg, #f4f4f4, #ebebeb 65%, #f7f7f7);
	box-shadow: inset 0 0 0 0.45cqw #e4e4e4;
}
.laptop-screen {
	position: absolute;
	left: 15.52%;
	top: 3.91%;
	width: 68.63%;
	height: 49.35%;
	overflow: hidden;
	background: #fafafa;
	box-shadow: 0 0 0 0.45cqw #ddd;
	color: #262626;
}
.laptop-base {
	position: absolute;
	left: 4.4%;
	top: 58.1%;
	width: 91%;
	height: 2.5%;
	border-radius: 0 0 50% 50% / 0 0 90% 90%;
	background: linear-gradient(#fafafa, #d9d9d9 48%, #aaa 85%, #eee);
	box-shadow: 0 0.5cqw 0.4cqw #0002;
}
.laptop-base span {
	position: absolute;
	left: 40%;
	top: 0;
	width: 20%;
	height: 36%;
	border-radius: 0 0 50% 50%;
	background: linear-gradient(#c3c3c3, #eee);
}
</style>
