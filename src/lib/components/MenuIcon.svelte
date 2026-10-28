<script lang="ts">
let { expanded }: { expanded: boolean } = $props();
</script>

<span class="menu-icon" class:expanded aria-hidden="true">
	<span class="line top"></span>
	<span class="line middle"></span>
	<span class="line bottom"></span>
</span>

<style>
.menu-icon {
	position: relative;
	display: block;
	width: 24px;
	height: 24px;
	flex: none;
}
.line {
	position: absolute;
	left: 0;
	top: 50%;
	width: 24px;
	height: 2px;
	margin-top: -1px;
	border-radius: 2px;
	background: currentColor;
	transform-origin: center;
	transition:
		transform 200ms var(--ease-out),
		opacity 140ms ease;
}
.top {
	transform: translateY(-7px);
}
.middle {
	transform: scaleX(1);
	opacity: 1;
}
.bottom {
	transform: translateY(7px);
}
.expanded .top {
	transform: rotate(45deg) scale(1.166667, 0.75);
}
.expanded .middle {
	transform: scaleX(0);
	opacity: 0;
}
.expanded .bottom {
	transform: rotate(-45deg) scale(1.166667, 0.75);
}
/* The mobile close control mounts with its sheet; give it the same morph. */
@starting-style {
	.expanded .top {
		transform: translateY(-7px);
	}
	.expanded .middle {
		transform: scaleX(1);
		opacity: 1;
	}
	.expanded .bottom {
		transform: translateY(7px);
	}
}
:global(html[data-input="keyboard"]) .line {
	transition: none;
}
@media (prefers-reduced-motion: reduce) {
	.line {
		transition: none;
	}
}
</style>
