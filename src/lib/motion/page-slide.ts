import { animate } from 'motion/mini';
import { easeOut } from './scene.js';

export const pageSlideDuration = 0.48;

/** Keep the outgoing composition visible while the next route slides alongside it. */
export function capturePageSlide(main: HTMLElement) {
	const bounds = main.getBoundingClientRect();
	const layer = document.createElement('div');
	layer.dataset['pageSlideLayer'] = '';
	layer.setAttribute('aria-hidden', 'true');
	layer.inert = true;
	layer.style.cssText = 'position:fixed;inset:0;overflow:hidden;pointer-events:none;z-index:15;';
	layer.style.clipPath = `inset(0 ${Math.max(0, innerWidth - bounds.right)}px 0 ${Math.max(0, bounds.left)}px)`;
	const outgoing = document.createElement('div');
	outgoing.dataset['pageSlideOutgoing'] = '';
	outgoing.style.cssText = `position:absolute;left:${bounds.x}px;top:${bounds.y}px;width:${bounds.width}px;height:${bounds.height}px;container-type:inline-size;will-change:transform;`;
	const copy = main.cloneNode(true);
	if (copy instanceof HTMLElement) {
		copy.removeAttribute('id');
		copy.style.cssText = 'position:relative;width:100%;margin:0;opacity:1;transform:none;';
		for (const node of copy.querySelectorAll('[id], [data-shared-art]')) {
			node.removeAttribute('id');
			node.removeAttribute('data-shared-art');
		}
		outgoing.append(copy);
	}
	layer.append(outgoing);
	document.body.append(layer);
	let animation: ReturnType<typeof animate> | undefined;
	const cancel = () => {
		animation?.cancel();
		layer.remove();
	};
	return {
		distance: bounds.width,
		play() {
			animation = animate(
				outgoing,
				{ transform: ['translate3d(0, 0, 0)', `translate3d(${bounds.width}px, 0, 0)`] },
				{ duration: pageSlideDuration, ease: easeOut }
			);
			return Promise.resolve(animation).then(cancel);
		},
		cancel
	};
}
