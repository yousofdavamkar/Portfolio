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
	await expect(page.locator('[data-page-slide-layer]')).toHaveCount(0);
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
	await expect(page.locator('[data-page-slide-layer]')).toHaveCount(0);
	await expect(page.locator('#main')).toHaveCSS('transform', 'none');
	await expect(page.locator('#main')).toHaveCSS('opacity', '1');
});
