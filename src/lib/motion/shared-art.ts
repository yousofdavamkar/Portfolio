import { animate } from 'motion/mini';

const travelEase = [0.42, 0, 0.2, 1] as const;
const travelDuration = 1.05;

type Artwork = HTMLImageElement | SVGSVGElement;

function portraitClip(element: Artwork): string {
	const frame = element.closest<HTMLElement>('.portrait-scene');
	if (!frame || getComputedStyle(frame).overflow === 'visible') return 'inset(0% 0% 0% 0%)';
	const image = element.getBoundingClientRect();
	const bounds = frame.getBoundingClientRect();
	return `inset(${(Math.max(0, bounds.top - image.top) / image.height) * 100}% ${(Math.max(0, image.right - bounds.right) / image.width) * 100}% ${(Math.max(0, image.bottom - bounds.bottom) / image.height) * 100}% ${(Math.max(0, bounds.left - image.left) / image.width) * 100}%)`;
}

/** Detached artwork survives the route swap while the real pages crossfade. */
export function captureSharedArt(main: HTMLElement) {
	const layer = document.createElement('div');
	layer.dataset['sharedArtLayer'] = '';
	layer.setAttribute('aria-hidden', 'true');
	layer.inert = true;
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
			wrapper.style.cssText = `position:absolute;left:0;top:0;width:${rect.width}px;height:${rect.height}px;transform-origin:center;will-change:transform;opacity:${style.opacity};`;
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
	// Crossfade the previous composition without holding the router or the artwork still.
	const backdrop = document.createElement('div');
	const mainBounds = main.getBoundingClientRect();
	backdrop.dataset['artPage'] = '';
	backdrop.style.cssText = `position:absolute;left:${mainBounds.x}px;top:${mainBounds.y}px;width:${mainBounds.width}px;height:${mainBounds.height}px;container-type:inline-size;pointer-events:none;`;
	const previousPage = main.cloneNode(true);
	if (previousPage instanceof HTMLElement) {
		previousPage.removeAttribute('id');
		previousPage.style.cssText = 'position:relative;margin:0;width:100%;opacity:1;transform:none;';
		for (const node of previousPage.querySelectorAll('[id], [data-shared-art]')) {
			node.removeAttribute('id');
			node.removeAttribute('data-shared-art');
		}
		backdrop.append(previousPage);
		layer.prepend(backdrop);
	}
	document.body.append(layer);
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
			const fade = animate(backdrop, { opacity: [1, 0] }, { duration: 0.38, ease: 'easeInOut' });
			animations.push(fade);
			void fade.then(() => backdrop.remove());
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
				const ornament = item.name === 'ornament';
				// Sample a continuous arc rather than two straight segments meeting at a corner.
				// One easing curve drives position, rotation and scale for the entire journey.
				const transforms = Array.from({ length: 61 }, (_, index) => {
					const progress = index / 60;
					const bend = ornament ? Math.sin(Math.PI * progress) * 35 : 0;
					const left = item.rect.x + (x - item.rect.x) * progress - bend;
					const top = item.rect.y + (y - item.rect.y) * progress;
					const rotation = item.angle + (angle - item.angle) * progress;
					return `translate3d(${left}px, ${top}px, 0) rotate(${rotation}deg) scale(${1 + (scaleX - 1) * progress}, ${1 + (scaleY - 1) * progress})`;
				});
				animations.push(
					animate(
						item.wrapper,
						{
							transform: transforms,
							opacity: Number(getComputedStyle(target).opacity)
						},
						{ duration: travelDuration, ease: travelEase }
					)
				);
				if (!ornament)
					animations.push(
						animate(
							item.image,
							{ clipPath: portraitClip(target) },
							{ duration: travelDuration, ease: travelEase }
						)
					);
			}
			return Promise.all(animations.map((animation) => Promise.resolve(animation))).then(cancel);
		},
		cancel
	};
}
