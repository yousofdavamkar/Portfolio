import { animate, inView, scroll, stagger } from 'motion';

export const easeOut = [0.22, 1, 0.36, 1] as const;
export const motionAllowed = () =>
	!matchMedia('(prefers-reduced-motion: reduce)').matches &&
	document.documentElement.dataset['input'] !== 'keyboard';

/** Each scene owns its observers and animations, including work below the fold. */
export function animateScene(root: HTMLElement, entrance: boolean) {
	const cleanups: (() => void)[] = [];
	if (!motionAllowed()) return () => {};
	const targets = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));
	const visible = targets.filter((element) => {
		const rect = element.getBoundingClientRect();
		return rect.top < innerHeight && rect.bottom > 0;
	});
	const reveal = (elements: HTMLElement[], delay = false) => {
		if (!elements.length) return;
		const animation = animate(
			elements,
			{ opacity: [0, 1], transform: ['translateY(38px)', 'translateY(0px)'] },
			{ duration: 0.65, ease: easeOut, delay: delay ? stagger(0.065) : 0 }
		);
		cleanups.push(() => animation.cancel());
	};
	if (entrance) reveal(visible, true);
	for (const element of targets.filter((element) => !visible.includes(element))) {
		// Don't conceal content scrolled past, including browser history restoration.
		if (element.getBoundingClientRect().bottom < 0) continue;
		const previousOpacity = element.style.opacity;
		element.style.opacity = '0';
		cleanups.push(() => {
			element.style.opacity = previousOpacity;
		});
		cleanups.push(
			inView(
				element,
				() => {
					element.style.opacity = previousOpacity;
					reveal([element]);
				},
				{ margin: '0px 0px -32px 0px', amount: 0.1 }
			)
		);
	}
	const orbit = root.querySelector<HTMLElement>('.scene-orbit');
	if (orbit) {
		const animation = animate(
			orbit,
			{ transform: ['translateY(0px) rotate(-16deg)', 'translateY(-100px) rotate(48deg)'] },
			{ ease: 'linear' }
		);
		const stop = scroll(animation);
		cleanups.push(() => {
			stop();
			animation.cancel();
		});
	}
	return () => {
		for (const cleanup of cleanups.splice(0).reverse()) cleanup();
	};
}

export function scrollProgress(element: HTMLElement) {
	const animation = animate(element, { scaleX: [0, 1] }, { ease: 'linear' });
	const stop = scroll(animation);
	return () => {
		stop();
		animation.cancel();
	};
}
