import { expect, test } from '@playwright/test';

for (const width of [1440, 1920]) {
	test(`Portfolio preserves the desktop design proportions at ${width}px`, async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'reduce' });
		await page.setViewportSize({ width, height: (width * 810) / 1440 });
		await page.goto('/work', { waitUntil: 'networkidle' });
		await expect(page.locator('.scene-graphics')).toHaveCount(0);
		const image = page.locator('.project-art img');
		await expect(image).toBeVisible();
		expect(
			await image.evaluate(
				(element) => element instanceof HTMLImageElement && element.naturalWidth > 0
			)
		).toBe(true);
		const box = await page.locator('.project-art .laptop').boundingBox();
		if (!box) throw new Error('Missing showcase artwork');
		const scale = width / 1440;
		for (const [actual, expected] of [
			[box.x, 415],
			[box.y, 273],
			[box.width, 612],
			[box.height, 537]
		]) {
			if (actual === undefined || expected === undefined)
				throw new Error('Missing image measurement');
			expect(Math.abs(actual / scale - expected)).toBeLessThan(1);
		}
		await expect(page.locator('.project-preview')).toBeVisible();
		const controls = await page.locator('.arrow-buttons').boundingBox();
		const count = await page.locator('.project-number').boundingBox();
		if (!controls || !count) throw new Error('Missing project navigation');
		expect(controls.y + controls.height).toBeLessThan(count.y);
		expect(
			await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 1)
		).toBe(true);
		await page.getByRole('link', { name: 'View Details', exact: true }).click();
		await expect(page).toHaveURL(/\/work\/[^/]+$/);
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
	});
}

for (const width of [320, 428, 768]) {
	test(`Portfolio remains readable and navigable at ${width}px`, async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'reduce' });
		await page.setViewportSize({ width, height: 926 });
		await page.goto('/work', { waitUntil: 'networkidle' });
		await expect(page.getByRole('heading', { name: /Portfolio/, level: 1 })).toBeVisible();
		await expect(page.locator('.project-preview')).toBeHidden();
		await page.getByRole('button', { name: 'Next project', exact: true }).scrollIntoViewIfNeeded();
		await expect(page.locator('.project-number')).toBeVisible();
		expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
			true
		);
		await page.getByRole('link', { name: 'View Details', exact: true }).click();
		await expect(page).toHaveURL(/\/work\/[^/]+$/);
	});
}
