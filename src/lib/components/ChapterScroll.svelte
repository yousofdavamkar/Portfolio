<script lang="ts">
import { onMount } from 'svelte';
import { createChapterDepth } from '#lib/motion/chapter-depth.js';
import { motionAllowed } from '#lib/motion/scene.js';
import { afterNavigate, beforeNavigate, goto } from '$app/navigation';
import { page } from '$app/state';

const chapters = [
	{ path: '/', name: 'Home' },
	{ path: '/about', name: 'About me' },
	{ path: '/work', name: 'Portfolio' },
	{ path: '/contact', name: 'Contact me' }
] as const;
const index = $derived(chapters.findIndex((chapter) => chapter.path === page.url.pathname));
let progress = $state(0);
let mounted = $state(false);
let pending = false;
let gestureGeneration = 0;
let resetGesture = () => {};
beforeNavigate(() => {
	gestureGeneration++;
	pending = true;
	resetGesture();
});
afterNavigate(() => {
	pending = false;
	resetGesture();
});

onMount(() => {
	mounted = true;
	const depth = createChapterDepth();
	let previousMagnitude = 0;
	let lastDeparture = 0;
	let departure: ReturnType<typeof setTimeout> | undefined;
	let lastWheel = 0;
	let wheelTotal = 0;
	let consumed = false;
	let idle: ReturnType<typeof setTimeout> | undefined;
	let touch: { x: number; y: number; target: Element; claimed: boolean } | undefined;
	const threshold = 100;
	const reset = () => {
		clearTimeout(idle);
		wheelTotal = 0;
		progress = 0;
		touch = undefined;
		// Require a fresh gesture after menu navigation or browser history as well.
		consumed = true;
		lastWheel = performance.now();
	};
	resetGesture = reset;
	const blocked = () =>
		index < 0 ||
		pending ||
		document.hidden ||
		Boolean(document.querySelector('[data-site-intro], [role="dialog"], [aria-busy="true"]'));
	const excluded = (target: Element) =>
		Boolean(
			target.closest(
				'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="slider"], [role="listbox"], [data-chapter-scroll="off"]'
			)
		);
	const neighbor = (direction: number) => chapters[index + direction];
	const scrollable = (element: Element, direction: number) => {
		const room = element.scrollHeight - element.clientHeight;
		return room > 2 && (direction > 0 ? element.scrollTop < room - 2 : element.scrollTop > 2);
	};
	const canScroll = (target: Element, direction: number) => {
		// Nested scroll regions own their entire gesture, including overscroll at their edges.
		for (
			let element: Element | null = target;
			element && element !== document.body && element !== document.documentElement;
			element = element.parentElement
		) {
			const style = getComputedStyle(element);
			if (/(auto|scroll)/.test(style.overflowY) && element.scrollHeight > element.clientHeight + 2)
				return true;
		}
		return Boolean(document.scrollingElement && scrollable(document.scrollingElement, direction));
	};
	const navigate = (direction: number, input: 'pointer' | 'keyboard' = 'pointer') => {
		const next = neighbor(direction);
		if (!next || blocked()) return;
		document.documentElement.dataset['input'] = input;
		const generation = ++gestureGeneration;
		pending = true;
		lastDeparture = performance.now();
		consumed = true;
		progress = 0;
		// Use the same router as the menu: shared U, portrait, and card animations stay intact.
		const commit = () => {
			if (generation !== gestureGeneration) return;
			void goto(next.path).catch(() => {
				pending = false;
				depth.reset();
				reset();
			});
		};
		if (input === 'pointer' && motionAllowed()) {
			depth.set(direction);
			departure = setTimeout(commit, 220);
		} else commit();
	};
	const wheel = (event: WheelEvent) => {
		if (
			event.ctrlKey ||
			event.metaKey ||
			event.altKey ||
			event.shiftKey ||
			Math.abs(event.deltaX) >= Math.abs(event.deltaY)
		)
			return;
		// Hit-test the live scene, rather than a wheel target latched before a route change.
		const target =
			document.elementFromPoint(event.clientX, event.clientY) ??
			(event.target instanceof Element ? event.target : null);
		if (!target) return;
		const now = performance.now();
		const magnitude = Math.abs(event.deltaY);
		const freshBurst =
			!blocked() && now - lastDeparture > 1000 && magnitude > previousMagnitude * 1.65 + 6;
		if (now - lastWheel > 240 || freshBurst) {
			consumed = false;
			wheelTotal = 0;
		}
		lastWheel = now;
		previousMagnitude = magnitude;
		clearTimeout(idle);
		idle = setTimeout(() => {
			progress = 0;
			wheelTotal = 0;
			consumed = false;
			previousMagnitude = 0;
			if (!blocked()) depth.set(0);
		}, 240);
		const direction = Math.sign(event.deltaY);
		if (blocked()) {
			if (
				index >= 0 &&
				!excluded(target) &&
				!document.querySelector('[data-site-intro], [role="dialog"]')
			)
				event.preventDefault();
			consumed = true;
			progress = 0;
			return;
		}
		if (excluded(target) || canScroll(target, direction)) {
			consumed = true;
			progress = 0;
			return;
		}
		if (!neighbor(direction)) return;
		// Suppress rubber-band scrolling only when a chapter gesture owns the viewport edge.
		event.preventDefault();
		if (consumed) return;
		if (Math.sign(wheelTotal) !== direction) wheelTotal = 0;
		const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1;
		wheelTotal += event.deltaY * unit;
		document.documentElement.dataset['input'] = 'pointer';
		progress = Math.max(-1, Math.min(1, wheelTotal / threshold));
		depth.set(progress);
		if (Math.abs(wheelTotal) >= threshold) navigate(direction);
	};
	const touchstart = (event: TouchEvent) => {
		const point = event.touches.item(0);
		const target = event.target instanceof Element ? event.target : null;
		touch =
			point && event.touches.length === 1 && target && !blocked() && !excluded(target)
				? { x: point.clientX, y: point.clientY, target, claimed: false }
				: undefined;
	};
	const touchmove = (event: TouchEvent) => {
		const point = event.touches.item(0);
		if (!touch || !point || event.touches.length !== 1 || blocked()) {
			touch = undefined;
			return;
		}
		const delta = touch.y - point.clientY;
		if (Math.abs(delta) < 12) return;
		if (
			Math.abs(point.clientX - touch.x) > Math.abs(delta) ||
			canScroll(touch.target, Math.sign(delta))
		) {
			touch = undefined;
			progress = 0;
			return;
		}
		if (!neighbor(Math.sign(delta))) return;
		touch.claimed = true;
		event.preventDefault();
		document.documentElement.dataset['input'] = 'pointer';
		progress = Math.max(-1, Math.min(1, delta / 80));
		depth.set(progress);
	};
	const touchend = (event: TouchEvent) => {
		const point = event.changedTouches.item(0);
		const gesture = touch;
		touch = undefined;
		progress = 0;
		if (gesture?.claimed && point && Math.abs(gesture.y - point.clientY) >= 80)
			navigate(Math.sign(gesture.y - point.clientY));
		else depth.set(0);
	};
	const keydown = (event: KeyboardEvent) => {
		if (
			event.defaultPrevented ||
			event.repeat ||
			event.ctrlKey ||
			event.metaKey ||
			event.altKey ||
			event.shiftKey ||
			!['PageDown', 'PageUp'].includes(event.key)
		)
			return;
		const target = event.target instanceof Element ? event.target : null;
		const direction = event.key === 'PageDown' ? 1 : -1;
		if (
			!target ||
			target.closest('a, button') ||
			blocked() ||
			excluded(target) ||
			canScroll(target, direction) ||
			!neighbor(direction)
		)
			return;
		event.preventDefault();
		navigate(direction, 'keyboard');
	};
	const interrupt = () => {
		clearTimeout(departure);
		gestureGeneration++;
		pending = false;
		reset();
		depth.reset();
	};
	const nativeScroll = () => {
		if (blocked()) return;
		const room = document.documentElement.scrollHeight - innerHeight;
		if (room > 20) depth.set(Math.min(0.3, (scrollY / room) * 0.3));
	};
	const preference = matchMedia('(prefers-reduced-motion: reduce)');
	document.addEventListener('portfolio:scroll-captured', depth.reset);
	window.addEventListener('scroll', nativeScroll, { passive: true });
	window.addEventListener('keydown', interrupt);
	window.addEventListener('pointerdown', interrupt);
	preference.addEventListener('change', interrupt);
	window.addEventListener('wheel', wheel, { passive: false });
	window.addEventListener('touchstart', touchstart, { passive: true });
	window.addEventListener('touchmove', touchmove, { passive: false });
	window.addEventListener('touchend', touchend);
	window.addEventListener('touchcancel', interrupt);
	window.addEventListener('keydown', keydown);
	window.addEventListener('resize', interrupt);
	document.addEventListener('visibilitychange', interrupt);
	return () => {
		interrupt();
		document.removeEventListener('portfolio:scroll-captured', depth.reset);
		window.removeEventListener('scroll', nativeScroll);
		window.removeEventListener('keydown', interrupt);
		window.removeEventListener('pointerdown', interrupt);
		preference.removeEventListener('change', interrupt);
		resetGesture = () => {};
		window.removeEventListener('wheel', wheel);
		window.removeEventListener('touchstart', touchstart);
		window.removeEventListener('touchmove', touchmove);
		window.removeEventListener('touchend', touchend);
		window.removeEventListener('touchcancel', interrupt);
		window.removeEventListener('keydown', keydown);
		window.removeEventListener('resize', interrupt);
		document.removeEventListener('visibilitychange', interrupt);
	};
});
</script>

{#if mounted && index >= 0}
	<div
		class="chapter-progress"
		aria-hidden="true"
		style={`--chapter-progress: ${(index + Math.abs(progress) * (progress < 0 ? -1 : 1)) / (chapters.length - 1)}`}
	>
		<span></span>
	</div>
	<div class="chapter-scroll-hint" aria-hidden="true">
		<span class="chapter-number">0{index + 1} / 04</span>
		<span class="hint-line"></span>
		<span>{index === chapters.length - 1 ? 'Scroll up to revisit' : 'Scroll to explore'}</span>
	</div>
{/if}

<style>
.chapter-progress {
	position: fixed;
	inset: 0 0 auto;
	height: 2px;
	z-index: 45;
	pointer-events: none;
}
.chapter-progress span {
	display: block;
	height: 100%;
	background: var(--primary);
	opacity: 0.55;
	transform: scaleX(var(--chapter-progress));
	transform-origin: left;
	transition: transform 900ms cubic-bezier(0.22, 1, 0.36, 1);
}
.chapter-scroll-hint {
	position: fixed;
	bottom: max(22px, env(safe-area-inset-bottom));
	left: 50%;
	transform: translateX(-50%);
	z-index: 20;
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 8px 14px;
	border: 1px solid rgb(255 255 255 / 7%);
	border-radius: 999px;
	background: rgb(20 20 20 / 92%);
	color: #aaa;
	font-size: 9px;
	letter-spacing: 0.14em;
	text-transform: uppercase;
	white-space: nowrap;
	pointer-events: none;
}
.chapter-number {
	color: var(--primary);
	font-variant-numeric: tabular-nums;
}
.hint-line {
	width: 26px;
	height: 1px;
	background: currentColor;
	opacity: 0.4;
}
:global(body:has([data-site-intro])) .chapter-scroll-hint,
:global(body:has([role="dialog"])) .chapter-scroll-hint,
:global(body:has([role="dialog"])) .chapter-progress {
	visibility: hidden;
}
@media (max-width: 767px), (max-height: 600px) {
	.chapter-scroll-hint {
		display: none;
	}
}
@media (prefers-reduced-motion: reduce) {
	.chapter-progress span {
		transition: none;
	}
}
</style>
