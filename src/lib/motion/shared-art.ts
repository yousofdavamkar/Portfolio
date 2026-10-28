import { animate } from 'motion/mini';
import { easeOut } from './scene.js';

type Artwork = HTMLImageElement | SVGSVGElement;

function portraitClip(element: Artwork): string {
	const frame = element.closest<HTMLElement>('.portrait-scene');
	if (!frame || getComputedStyle(frame).overflow === 'visible') return 'inset(0% 0% 0% 0%)';
	const image = element.getBoundingClientRect();
	const bounds = frame.getBoundingClientRect();
	return `inset(${(Math.max(0, bounds.top - image.top) / image.height) * 100}% ${(Math.max(0, image.right - bounds.right) / image.width) * 100}% ${(Math.max(0, image.bottom - bounds.bottom) / image.height) * 100}% ${(Math.max(0, bounds.left - image.left) / image.width) * 100}%)`;
}

/** Detached artwork survives the route swap while the real pages crossfade. */
export function captureSharedArt() {
	const layer = document.createElement('div');
	layer.dataset['sharedArtLayer'] = '';
	layer.setAttribute('aria-hidden', 'true');
	layer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:15;overflow:hidden;';
	const shell = document.querySelector('.site-shell')?.getBoundingClientRect();
	if (shell)
		layer.style.clipPath = `inset(0 ${Math.max(0, innerWidth - shell.right)}px 0 ${Math.max(0, shell.left)}px)`;
	const restore: (() => void)[] = [];
	const animations: ReturnType<typeof animate>[] = [];
	const hide = (element: Artwork) => {
		const visibility = element.style.visibility;
		element.style.visibility = 'hidden';
		restore.push(() => {
			element.style.visibility = visibility;
		});
	};
	const items = Array.from(document.querySelectorAll<Artwork>('[data-shared-art]')).flatMap(
		(source) => {
			const rect = source.getBoundingClientRect();
			if (!rect.width || !rect.height || rect.bottom <= 0 || rect.top >= innerHeight) return [];
			const style = getComputedStyle(source);
			const name = source.dataset['sharedArt'];
			if (!name) return [];
			const angle = Number(source.dataset['artAngle'] ?? 0);
			const wrapper = document.createElement('div');
			wrapper.dataset['artGhost'] = name;
			wrapper.style.cssText = `position:absolute;left:0;top:0;width:${rect.width}px;height:${rect.height}px;transform-origin:center;opacity:${style.opacity};`;
			wrapper.style.transform = `translate(${rect.x}px, ${rect.y}px) rotate(${angle}deg)`;
			const image = source.cloneNode(true);
			if (!(image instanceof SVGSVGElement || image instanceof HTMLImageElement)) return [];
			image.removeAttribute('class');
			image.removeAttribute('data-shared-art');
			image.removeAttribute('id');
			image.style.cssText =
				'display:block;position:static;width:100%;height:100%;max-width:none;transform:none;opacity:1;visibility:visible;';
			image.style.stroke = style.stroke;
			image.style.strokeWidth = style.strokeWidth;
			image.style.clipPath = name === 'portrait' ? portraitClip(source) : 'none';
			wrapper.append(image);
			layer.append(wrapper);
			hide(source);
			return [{ name, rect, angle, wrapper, image }];
		}
	);
	if (items.length) document.body.append(layer);
	const cancel = () => {
		for (const animation of animations.splice(0)) animation.cancel();
		for (const reset of restore.splice(0)) reset();
		layer.remove();
	};
	return {
		hideDestination() {
			for (const { name } of items) {
				const target = document.querySelector<Artwork>(`[data-shared-art="${name}"]`);
				if (target) hide(target);
			}
		},
		play() {
			for (const item of items) {
				const target = document.querySelector<Artwork>(`[data-shared-art="${item.name}"]`);
				if (!target) {
					item.wrapper.remove();
					continue;
				}
				const end = target.getBoundingClientRect();
				const angle = Number(target.dataset['artAngle'] ?? 0);
				const scaleX = end.width / item.rect.width;
				const scaleY = end.height / item.rect.height;
				// The box retains its source size; compensate translation for scaling about its center.
				const x = end.x + (end.width - item.rect.width) / 2;
				const y = end.y + (end.height - item.rect.height) / 2;
				const start = `translate(${item.rect.x}px, ${item.rect.y}px) rotate(${item.angle}deg) scale(1, 1)`;
				const finish = `translate(${x}px, ${y}px) rotate(${angle}deg) scale(${scaleX}, ${scaleY})`;
				const ornament = item.name === 'ornament';
				const middle = `translate(${(item.rect.x + x) / 2 - (ornament ? 35 : 0)}px, ${(item.rect.y + y) / 2}px) rotate(${(item.angle + angle) / 2}deg) scale(${(1 + scaleX) / 2}, ${(1 + scaleY) / 2})`;
				animations.push(
					animate(
						item.wrapper,
						{
							transform: ornament ? [start, middle, finish] : [start, finish],
							opacity: Number(getComputedStyle(target).opacity)
						},
						{ duration: ornament ? 0.68 : 0.58, ease: easeOut }
					)
				);
				if (!ornament)
					animations.push(
						animate(
							item.image,
							{ clipPath: portraitClip(target) },
							{ duration: 0.58, ease: easeOut }
						)
					);
			}
			return Promise.all(animations.map((animation) => Promise.resolve(animation))).then(cancel);
		},
		cancel
	};
}
