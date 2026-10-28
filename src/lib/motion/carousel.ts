import { animate } from 'motion/mini';
import { easeOut, motionAllowed } from './scene.js';

type Slide = { key: string; direction: number };

/** A short reveal leaves route artwork free of persistent transforms. */
export function carouselReveal(node: HTMLElement, initial: Slide) {
	let key = initial.key;
	let animation: ReturnType<typeof animate> | undefined;
	return {
		update(slide: Slide) {
			if (slide.key === key) return;
			key = slide.key;
			animation?.cancel();
			if (!motionAllowed()) return;
			animation = animate(
				node,
				{
					opacity: [0, 1],
					transform: [`translate3d(${slide.direction * 36}px, 0, 0)`, 'translate3d(0, 0, 0)']
				},
				{ duration: 0.6, ease: easeOut }
			);
		},
		destroy() {
			animation?.cancel();
		}
	};
}
