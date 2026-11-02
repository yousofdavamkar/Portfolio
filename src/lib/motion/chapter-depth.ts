import { motionAllowed } from '#lib/motion/scene.js';

type Layer = {
	element: HTMLElement | SVGSVGElement;
	y: number;
	zoom: number;
	turn: number;
	delay: number;
	fade: boolean;
	original: { translate: string; scale: string; rotate: string; opacity: string };
};

/** Independent CSS transforms preserve typing, carousel, and shared-art transforms. */
export function createChapterDepth() {
	let layers: Layer[] = [];
	let frame = 0;
	let value = 0;
	let target = 0;
	let previousTime = 0;
	const collect = () => {
		const main = document.querySelector('#main');
		if (!main) return;
		const add = (selector: string, y: number, zoom = 0, turn = 0, stagger = 0, fade = false) => {
			for (const [index, element] of main
				.querySelectorAll<HTMLElement | SVGSVGElement>(selector)
				.entries()) {
				if (fade && Number(getComputedStyle(element).opacity) < 0.95) continue;
				const { translate, scale, rotate, opacity } = element.style;
				layers.push({
					element,
					y,
					zoom,
					turn,
					delay: Math.min(index * stagger, 0.4),
					fade,
					original: { translate, scale, rotate, opacity }
				});
			}
		};
		// Foreground artwork grows while its framing moves more slowly behind it.
		add('.portrait-scene', -28, 0.075);
		add('.project-art', -34, 0.11);
		add('.contact-artwork', -24, 0.055);
		add('.home-ornament, .about-arch', 22, -0.025);
		// Keep the capsule and its U aligned as one framing layer.
		add('.work-ornament, .project-preview', 22);
		add('.portrait-scene .orb, .contact-artwork .satellite', -38, 0.08, 0, 0.06);
		add('[data-contact-card]', -10, 0.025, 8, 0.12);
		add(
			'.hero-intro > .speech, .about-label, .about-question, .topic-reveal, .work-page > .section-label, .project-copy h2, .project-copy .body-copy, .project-copy .pill-action, .contact-label, .contact-copy > *',
			-54,
			0,
			0,
			0.055,
			true
		);
	};
	const restore = () => {
		for (const { element, original } of layers) Object.assign(element.style, original);
	};
	const paint = () => {
		const direction = Math.sign(value);
		const amount = Math.abs(value);
		for (const layer of layers) {
			const local = Math.max(0, (amount - layer.delay) / (1 - layer.delay));
			layer.element.style.translate = `0 ${direction * layer.y * local}px`;
			layer.element.style.scale = String(1 + layer.zoom * local);
			layer.element.style.rotate = `${direction * layer.turn * local}deg`;
			if (layer.fade) layer.element.style.opacity = String(1 - local * 0.45);
		}
	};
	const tick = (time: number) => {
		const elapsed = previousTime ? Math.min(time - previousTime, 64) : 16;
		previousTime = time;
		value += (target - value) * (1 - Math.exp(-elapsed / 55));
		if (Math.abs(target - value) < 0.001) value = target;
		paint();
		if (value !== target) frame = requestAnimationFrame(tick);
		else {
			frame = 0;
			previousTime = 0;
			if (value === 0) restore();
		}
	};
	return {
		set(progress: number) {
			if (!motionAllowed()) return;
			if (!layers.length) collect();
			target = Math.max(-1, Math.min(1, progress));
			if (!frame) frame = requestAnimationFrame(tick);
		},
		reset() {
			cancelAnimationFrame(frame);
			frame = 0;
			previousTime = 0;
			value = 0;
			target = 0;
			restore();
			layers = [];
		}
	};
}
