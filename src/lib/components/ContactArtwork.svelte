<script lang="ts">
let {
	name = 'Yousof Davamkar',
	role = 'Fullstack web developer'
}: { name?: string; role?: string } = $props();
</script>

<div class="contact-artwork" data-shared-art="contact" aria-hidden="true">
	<div class="gold-orb"></div>
	<div class="satellite satellite-one"></div>
	<div class="satellite satellite-two"></div>
	<div class="satellite satellite-three"></div>
	{#each ['front', 'back'] as side (side)}
		<div class={`card-position card-${side}`}>
			<div class="business-card" data-contact-card={side}>
				<span class="card-role">{role}</span>
				<span class="card-mark"><span></span></span>
				<span class="card-name">{name}</span>
			</div>
		</div>
	{/each}
</div>

<style>
.contact-artwork {
	position: relative;
	width: 100%;
	aspect-ratio: 1277 / 1231;
	container-type: inline-size;
	isolation: isolate;
	overflow: clip;
	pointer-events: none;
}
.gold-orb,
.satellite {
	position: absolute;
	border-radius: 50%;
	background: radial-gradient(
		circle at 76% 80%,
		#fff5be 0%,
		#ffe883 32%,
		#ffdc49 63%,
		#ffc900 100%
	);
	box-shadow:
		inset 1px 1px 3px #fff9df,
		inset -1px -1px 2px #ffef9a;
}
.gold-orb {
	left: 36%;
	top: 8%;
	width: 82%;
	aspect-ratio: 1;
}
.satellite {
	background: linear-gradient(135deg, #ffd62d, #fff4b4);
}
.satellite-one {
	left: 32%;
	top: 3%;
	width: 6.5%;
	aspect-ratio: 1;
}
.satellite-two {
	right: 0;
	top: 0;
	width: 10.5%;
	aspect-ratio: 1;
}
.satellite-three {
	left: 57%;
	bottom: 1%;
	width: 6.5%;
	aspect-ratio: 1;
}
.card-position {
	position: absolute;
	transform-origin: center;
}
.card-front {
	left: 6%;
	top: 20%;
	width: 61%;
	height: 42%;
	transform: rotate(16deg);
	z-index: 1;
}
.card-back {
	left: 18%;
	top: 55%;
	width: 51%;
	height: 34%;
	transform: rotate(-31deg);
	z-index: 2;
}
.business-card {
	position: relative;
	width: 100%;
	height: 100%;
	border-radius: 3.1cqw;
	border: 1px solid #ffe16e70;
	border-top: 2px solid #ffda34;
	border-left: 2px solid #ffda34;
	background:
		linear-gradient(105deg, transparent 30%, #ffdc2860 67%, #e6b500b3 100%),
		linear-gradient(145deg, #969696, #616161 43%, #2d2d2d 100%);
	box-shadow:
		0 1.4cqw 2cqw #0004,
		inset 0 1px 1px #fff4;
	color: #111;
	font-family: "Poppins", sans-serif;
	backface-visibility: hidden;
}
.business-card::after {
	content: "";
	position: absolute;
	inset: 0;
	border-radius: inherit;
	background: repeating-linear-gradient(118deg, #fff0 0 2px, #ffffff06 2px 3px);
	pointer-events: none;
}
.card-role {
	position: absolute;
	top: 12%;
	left: 8%;
	right: 20%;
	font-size: 2.2cqw;
	line-height: 1.7;
	font-weight: 500;
	letter-spacing: 0.12cqw;
}
.card-name {
	position: absolute;
	left: 8%;
	right: 6%;
	bottom: 14%;
	font-size: 3.5cqw;
	line-height: 1.35;
	font-weight: 600;
	letter-spacing: 0.06cqw;
}
.card-front .card-name {
	bottom: 24%;
}
.card-back .card-role {
	font-size: 1.65cqw;
}
.card-back .card-name {
	font-size: 2.8cqw;
}
.card-mark {
	position: absolute;
	right: 8%;
	top: 13%;
	width: 5cqw;
	height: 5.6cqw;
	background: #ffed80;
	clip-path: polygon(50% 0, 94% 25%, 94% 75%, 50% 100%, 6% 75%, 6% 25%);
}
.card-mark > span {
	position: absolute;
	inset: 8%;
	background: #b4a043;
	clip-path: inherit;
}
.card-mark > span::after {
	content: "";
	position: absolute;
	inset: 10%;
	background: #ffed80;
	clip-path: inherit;
}
.card-back .card-mark {
	width: 3.8cqw;
	height: 4.3cqw;
}
</style>
