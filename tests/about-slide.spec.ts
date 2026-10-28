import { expect, type Page, test } from '@playwright/test';

async function inspectSlide(page: Page, path: string, direction: 1 | -1) {
	await page.waitForFunction((expected) => {
		const outgoing = document.querySelector('[data-page-slide-outgoing]');
		return location.pathname === expected && (outgoing?.getAnimations().length ?? 0) > 0;
	}, path);
	const motion = await page.evaluate(() => {
		const incoming = document.querySelector<HTMLElement>('#main');
		const outgoing = document.querySelector<HTMLElement>('[data-page-slide-outgoing]');
		if (!incoming || !outgoing) throw new Error('Slide did not start');
		for (const element of [incoming, outgoing]) {
			for (const animation of element.getAnimations()) {
				animation.pause();
				animation.currentTime = Number(animation.effect?.getComputedTiming().endTime) * 0.4;
			}
		}
		const next = new DOMMatrix(getComputedStyle(incoming).transform);
		const previous = new DOMMatrix(getComputedStyle(outgoing).transform);
		return {
			nextX: next.m41,
			previousX: previous.m41,
			nextY: next.m42,
			previousY: previous.m42,
			width: incoming.getBoundingClientRect().width
		};
	});
	expect(motion.nextX * direction).toBeLessThan(0);
	expect(motion.previousX * direction).toBeGreaterThan(0);
	expect(motion.nextY).toBe(0);
	expect(motion.previousY).toBe(0);
	expect(Math.abs((motion.previousX - motion.nextX) * direction - motion.width)).toBeLessThan(1);
	await expect(page.locator('[data-page-slide-layer]')).toHaveAttribute('aria-hidden', 'true');
	await expect(page.locator('[data-page-slide-layer]')).toHaveCSS('pointer-events', 'none');
	await page.evaluate(() => {
		for (const element of document.querySelectorAll('#main, [data-page-slide-outgoing]')) {
			for (const animation of element.getAnimations()) animation.play();
		}
	});
	await expect(page.locator('[data-page-slide-layer], [data-shared-art-layer]')).toHaveCount(0);
	await expect(page.locator('#main')).toHaveCSS('transform', 'none');
	await expect(page.locator('#main')).toHaveCSS('opacity', '1');
}

for (const width of [1440, 390]) {
	test(`About topics slide left and Back slides right at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 900 });
		await page.goto('/about', { waitUntil: 'networkidle' });
		await page.locator('.about-topic[href="/about/journey"]').click();
		await inspectSlide(page, '/about/journey', -1);
		await page.getByRole('link', { name: 'Back', exact: true }).click();
		await inspectSlide(page, '/about', 1);
		await page.goBack();
		await inspectSlide(page, '/about/journey', 1);
		await page.goForward();
		await inspectSlide(page, '/about', -1);
		expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
			true
		);
	});
}

test('a new navigation interrupts the slideshow without leaving snapshots or hidden content', async ({
	page
}) => {
	await page.goto('/about', { waitUntil: 'networkidle' });
	await page.locator('.about-topic[href="/about/journey"]').click();
	await expect(page.locator('[data-page-slide-layer]')).toHaveCount(1);
	await page
		.getByRole('navigation', { name: 'Main navigation', exact: true })
		.getByRole('link', { name: 'Contact me' })
		.click();
	await expect(page).toHaveURL(/\/contact$/);
	await expect(page.locator('[data-page-slide-layer], [data-shared-art-layer]')).toHaveCount(0);
	await expect(page.locator('#main')).toHaveCSS('transform', 'none');
	await expect(page.locator('#main')).toHaveCSS('opacity', '1');
});

for (const width of [1440, 390]) {
	test(`the About arch travels to a topic and back without duplicate artwork at ${width}px`, async ({
		page
	}) => {
		await page.setViewportSize({ width, height: 900 });
		await page.goto('/about', { waitUntil: 'networkidle' });
		for (const destination of ['/about/journey', '/about']) {
			if (destination === '/about')
				await page.getByRole('link', { name: 'Back', exact: true }).click();
			else await page.locator('.about-topic[href="/about/journey"]').click();
			await expect(page).toHaveURL(new RegExp(`${destination}$`));
			await expect(page.locator('[data-art-ghost]')).toHaveCount(1);
			await expect(page.locator('[data-art-page]')).toHaveCount(0);
			await expect(page.locator('#main [data-shared-art="ornament"]')).toHaveCSS(
				'visibility',
				'hidden'
			);
			await page.waitForFunction(() =>
				document
					.querySelector('[data-art-ghost="ornament"]')
					?.getAnimations()
					.some((animation) => Number(animation.currentTime) > 550)
			);
			// The content slide finishes first; the arch settles independently at its final location.
			await expect(page.locator('[data-page-slide-layer]')).toHaveCount(0);
			const landing = await page.evaluate(() => {
				const ghost = document.querySelector('[data-art-ghost="ornament"]');
				const target = document.querySelector('#main [data-shared-art="ornament"]');
				if (!ghost || !target) throw new Error('Missing shared arch');
				for (const animation of ghost.getAnimations({ subtree: true })) {
					animation.pause();
					animation.currentTime = Number(animation.effect?.getComputedTiming().endTime) - 0.01;
				}
				const actual = ghost.getBoundingClientRect();
				const expected = target.getBoundingClientRect();
				return {
					width: expected.width,
					height: expected.height,
					error: Math.max(
						Math.abs(actual.x - expected.x),
						Math.abs(actual.y - expected.y),
						Math.abs(actual.width - expected.width),
						Math.abs(actual.height - expected.height)
					)
				};
			});
			expect(landing.width).toBeGreaterThan(0);
			expect(landing.height).toBeGreaterThan(0);
			expect(landing.error).toBeLessThan(1);
			await page.evaluate(() => {
				for (const animation of document
					.querySelector('[data-art-ghost="ornament"]')
					?.getAnimations({ subtree: true }) ?? [])
					animation.play();
			});
			await expect(page.locator('[data-shared-art-layer]')).toHaveCount(0);
			await expect(page.locator('#main [data-shared-art="ornament"]')).toHaveCSS(
				'visibility',
				'visible'
			);
		}
	});
}

for (const interrupt of [false, true]) {
	test(`the primary arch stays visible between topic pages${interrupt ? ' when interrupted' : ''}`, async ({
		page
	}) => {
		await page.setViewportSize({ width: 1440, height: 810 });
		await page.goto('/about/journey', { waitUntil: 'networkidle' });
		const arch = page.locator('#main [data-shared-art="ornament"]');
		await expect(arch).toHaveCSS('visibility', 'visible');
		for (const [label, slug] of [
			['My activities', 'activities'],
			['My soft skills', 'soft-skills'],
			['My hard skills', 'hard-skills'],
			['Education & Training', 'education'],
			['Spoken Languages', 'languages']
		] as const) {
			await page.getByRole('link', { name: `Next: ${label}`, exact: true }).click();
			await expect(page).toHaveURL(new RegExp(`/about/${slug}$`));
			await expect(page.locator('[data-art-ghost="ornament"]')).toHaveCount(1);
			if (interrupt) await page.keyboard.press('Escape');
			await expect(page.locator('[data-shared-art-layer], [data-page-slide-layer]')).toHaveCount(0);
			await expect(arch).toHaveCSS('visibility', 'visible');
		}
		await page.goBack();
		await expect(page).toHaveURL(/\/about\/education$/);
		await expect(page.locator('[data-shared-art-layer], [data-page-slide-layer]')).toHaveCount(0);
		await expect(arch).toHaveCSS('visibility', 'visible');
	});
}
