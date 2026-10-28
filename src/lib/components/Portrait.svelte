<script lang="ts">
let {
	compact = false,
	home = false,
	about = false
}: { compact?: boolean; home?: boolean; about?: boolean } = $props();
</script>
<div class:compact class:home class:about class="portrait-scene">
	<div class="arch arch-outer"></div>
	<div class="arch arch-middle"></div>
	<div class="arch arch-white"></div>
	<img
		class="portrait"
		data-shared-art="portrait"
		src="/images/portrait.png"
		alt="Portrait from Yousof’s original portfolio design"
		width="850"
		height="585"
		loading={compact ? 'lazy' : 'eager'}
		fetchpriority={compact ? 'auto' : 'high'}
		decoding="async"
	>
	<span class="orb orb-one"></span><span class="orb orb-two"></span
	><span class="orb orb-three"></span>
	{#if home}
		<span class="orb orb-four"></span>
	{/if}
</div>
<style>
.portrait-scene {
	position: relative;
	width: 100%;
	height: 100%;
	min-height: 500px;
	isolation: isolate;
	overflow: hidden;
}
.arch {
	position: absolute;
	left: 50%;
	transform: translateX(-50%);
	border-radius: 50% 50% 0 0;
	bottom: -15%;
}
.arch-outer {
	width: 112%;
	height: 106%;
	background: #252525;
	z-index: -3;
}
.arch-middle {
	width: 84%;
	height: 86%;
	background: #202020;
	z-index: -2;
}
.arch-white {
	width: 66%;
	height: 67%;
	background: white;
	z-index: -1;
}
.portrait {
	position: absolute;
	bottom: -7%;
	left: 50%;
	transform: translateX(-50%);
	width: auto;
	max-width: none;
	height: 100%;
}
.orb {
	position: absolute;
	border-radius: 50%;
	background: linear-gradient(120deg, var(--primary), #fff6ac);
	width: 30px;
	height: 30px;
}
.orb-one {
	left: 20%;
	top: 41%;
	width: 27px;
	height: 27px;
}
.orb-two {
	left: 11%;
	bottom: 24%;
	width: 44px;
	height: 44px;
}
.orb-three {
	right: 13%;
	bottom: 1%;
	width: 45px;
	height: 45px;
}
.compact {
	min-height: 480px;
}
.compact .portrait {
	height: 100%;
	bottom: -8%;
}
@media (max-width: 767px) {
	.portrait-scene {
		min-height: 410px;
	}
	.arch-outer {
		height: 93%;
		width: 120%;
	}
	.arch-middle {
		height: 77%;
		width: 105%;
	}
	.arch-white {
		height: 64%;
		width: 85%;
	}
	.portrait {
		height: 100%;
		bottom: -8%;
	}
	.orb-one {
		left: 18%;
		top: 30%;
	}
	.orb-two {
		left: 9%;
		bottom: 38%;
		width: 32px;
		height: 32px;
	}
	.orb-three {
		right: 8%;
		bottom: 45%;
		width: 32px;
		height: 32px;
	}
}
.about .arch-outer,
.about .arch-middle {
	display: none;
}
/* Home uses the exported Figma asset at its native 850 × 585 proportions. */
.home {
	min-height: 0;
	overflow: visible;
}
.home .portrait {
	width: 59.027778cqw;
	height: auto;
	left: 0;
	bottom: 0;
	transform: none;
}
.home .arch-outer {
	width: 64.583333cqw;
	height: 64.583333cqw;
	left: -3.333333cqw;
	top: 10cqw;
	bottom: auto;
	transform: none;
	border-radius: 50% 50% 0 0;
}
.home .arch-middle {
	width: 41.666667cqw;
	height: 41.666667cqw;
	left: 8.333333cqw;
	top: 21.458333cqw;
	bottom: auto;
	transform: none;
}
.home .arch-white {
	width: 33.472222cqw;
	height: 33.472222cqw;
	left: 12.222222cqw;
	top: 26.111111cqw;
	bottom: auto;
	transform: none;
}
.home .orb {
	background: linear-gradient(110deg, #ffca05, #fffbd1);
}
.home .orb-one {
	width: 2.430556cqw;
	height: 2.430556cqw;
	left: 16.875cqw;
	top: 28.541667cqw;
}
.home .orb-two {
	width: 3.958333cqw;
	height: 3.958333cqw;
	left: 9.791667cqw;
	bottom: 11.180556cqw;
}
.home .orb-three {
	width: 3.958333cqw;
	height: 3.958333cqw;
	left: 44.652778cqw;
	right: auto;
	bottom: -1.319444cqw;
}
.home .orb-four {
	width: 2.430556cqw;
	height: 2.430556cqw;
	left: 38.958333cqw;
	top: 23.402778cqw;
}
@media (max-width: 767px) {
	.home .portrait {
		width: 144.859813cqw;
		left: -31.775701cqw;
		bottom: 0;
	}
	.home .arch-outer {
		width: 147.196262cqw;
		height: 147.196262cqw;
		left: -32.009346cqw;
		top: auto;
		bottom: -38.084112cqw;
	}
	.home .arch-middle {
		width: 112.149533cqw;
		height: 112.149533cqw;
		left: -21.495327cqw;
		top: auto;
		bottom: -25.700935cqw;
	}
	.home .arch-white {
		width: 84.11215cqw;
		height: 84.11215cqw;
		left: -8.878505cqw;
		top: auto;
		bottom: -10.514019cqw;
	}
	.home .orb-one {
		width: 4.906542cqw;
		height: 4.906542cqw;
		left: 16.121495cqw;
		top: auto;
		bottom: 108.17757cqw;
	}
	.home .orb-two {
		width: 8.17757cqw;
		height: 8.17757cqw;
		left: 11.214953cqw;
		bottom: 68.925234cqw;
	}
	.home .orb-three {
		width: 8.17757cqw;
		height: 8.17757cqw;
		left: 79.205607cqw;
		bottom: 64.953271cqw;
	}
	.home .orb-four {
		display: none;
	}
}
</style>
