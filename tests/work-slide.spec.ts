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
	test(`View Details slides left and All projects slides right at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 900 });
		await page.goto('/work', { waitUntil: 'networkidle' });
		await page.getByRole('link', { name: 'View Details', exact: true }).click();
		await inspectSlide(page, '/work/elecode-iranzaminn', -1);
		await expect(page.locator('#main .laptop')).toHaveCSS('visibility', 'visible');
		await page.getByRole('link', { name: 'All projects', exact: true }).click();
		await inspectSlide(page, '/work', 1);
		await page.goBack();
		await inspectSlide(page, '/work/elecode-iranzaminn', 1);
		await page.goForward();
		await inspectSlide(page, '/work', -1);
		await expect(page.locator('#main .laptop')).toHaveCSS('visibility', 'visible');
	});
}

test('reduced motion skips the View Details slideshow', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/work', { waitUntil: 'networkidle' });
	await page.getByRole('link', { name: 'View Details', exact: true }).click();
	await expect(page).toHaveURL(/\/work\/elecode-iranzaminn$/);
	await expect(page.locator('[data-page-slide-layer], [data-shared-art-layer]')).toHaveCount(0);
	await expect(page.locator('#main')).toHaveCSS('transform', 'none');
	await expect(page.locator('#main .laptop')).toHaveCSS('visibility', 'visible');
});

for (const width of [1440, 390]) {
	test(`Portfolio and Contact slide smoothly in both directions at ${width}px`, async ({
		page
	}) => {
		await page.setViewportSize({ width, height: 900 });
		await page.goto('/work', { waitUntil: 'networkidle' });
		if (width < 768) {
			await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
			await page
				.getByRole('navigation', { name: 'Mobile navigation' })
				.getByRole('link', { name: 'Contact me' })
				.click();
		} else {
			await page.locator('.work-page .section-next').click();
		}
		await inspectSlide(page, '/contact', -1);
		await expect(page.locator('.site-header')).toHaveCSS('transform', 'none');
		await expect(page.getByRole('button', { name: 'Hire Me!', exact: true })).toBeVisible();
		expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
			true
		);
		await page.goBack();
		await inspectSlide(page, '/work', 1);
		await page.goForward();
		await inspectSlide(page, '/contact', -1);
	});
}

test('Contact navigation cleans up when interrupted and skips motion when requested', async ({
	page
}) => {
	await page.goto('/work', { waitUntil: 'networkidle' });
	await page.locator('.work-page .section-next').click();
	await expect(page.locator('[data-page-slide-layer]')).toHaveCount(1);
	await page
		.getByRole('navigation', { name: 'Main navigation', exact: true })
		.getByRole('link', { name: 'Home', exact: true })
		.click();
	await expect(page).toHaveURL('/');
	await expect(page.locator('[data-page-slide-layer], [data-shared-art-layer]')).toHaveCount(0);
	await expect(page.locator('#main')).toHaveCSS('opacity', '1');
	await expect(page.locator('#main')).toHaveCSS('transform', 'none');
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/work', { waitUntil: 'networkidle' });
	await page.locator('.work-page .section-next').click();
	await expect(page).toHaveURL('/contact');
	await expect(page.locator('[data-page-slide-layer]')).toHaveCount(0);
	await expect(page.locator('#main')).toHaveCSS('transform', 'none');
});
