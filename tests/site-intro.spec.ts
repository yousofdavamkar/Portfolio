import { expect, test } from '@playwright/test';

for (const [width, height] of [
	[1440, 900],
	[390, 900],
	[844, 390]
] as const) {
	test(`branded opening draws the U and hands off to typing at ${width}px`, async ({ page }) => {
		const errors: string[] = [];
		page.on('pageerror', (error) => errors.push(error.message));
		await page.setViewportSize({ width, height });
		await page.goto('/', { waitUntil: 'domcontentloaded' });
		const intro = page.locator('[data-site-intro]');
		await expect(intro).toBeVisible();
		await expect(page.locator('.site-shell')).toHaveAttribute('inert', '');
		await expect(page.locator('.hero-intro .typed-character:not(.untyped)')).toHaveCount(0);
		await expect
			.poll(() =>
				intro
					.locator('path')
					.evaluateAll((paths) =>
						paths.some((path) => Number.parseFloat(getComputedStyle(path).strokeDashoffset) > 0)
					)
			)
			.toBe(true);
		await page.waitForTimeout(1150);
		await page.screenshot({ path: `.artifacts/site-intro-${width}.png` });
		expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
			true
		);
		await expect(intro).toHaveCount(0, { timeout: 6000 });
		await expect(page.locator('.site-shell')).not.toHaveAttribute('inert');
		await expect(page.locator('.home-ornament')).toHaveCSS('visibility', 'visible');
		expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('');
		await expect(page.locator('.greeting')).toBeVisible();
		await expect(page.locator('.intro-title')).toBeVisible();
		await page.getByRole('link', { name: 'Discover more about me' }).click();
		await expect(page).toHaveURL('/about');
		await page.goBack();
		await expect(page).toHaveURL('/');
		await expect(intro).toHaveCount(0);
		expect(errors).toEqual([]);
	});
}

test('skip, keyboard and reduced motion always unlock the page', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: 'Skip intro' }).click();
	await expect(page.locator('[data-site-intro]')).toHaveCount(0);
	await expect(page.locator('.site-shell')).not.toHaveAttribute('inert');
	await page.reload();
	await expect(page.locator('[data-site-intro]')).toBeVisible();
	await expect(page.locator('.site-shell')).toHaveAttribute('inert', '');
	await page.keyboard.press('Tab');
	await expect(page.locator('[data-site-intro]')).toHaveCount(0);
	await expect(page.locator('.hero-intro .untyped')).toHaveCount(0);
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.reload();
	await expect(page.locator('[data-site-intro]')).toHaveCount(0);
	await expect(page.locator('.site-shell')).not.toHaveAttribute('inert');
	await expect(page.locator('.home-ornament')).toHaveCSS('visibility', 'visible');
});

test('slow or failed portrait assets cannot trap the visitor', async ({ page }) => {
	let release = () => {};
	const hold = new Promise<void>((resolve) => {
		release = resolve;
	});
	await page.route('**/images/**', async (route) => {
		await hold;
		await route.abort();
	});
	await page.goto('/', { waitUntil: 'domcontentloaded' });
	await expect(page.locator('[data-site-intro]')).toBeVisible();
	await expect(page.locator('[data-site-intro]')).toHaveCount(0, { timeout: 6500 });
	await expect(page.locator('.site-shell')).not.toHaveAttribute('inert');
	release();
});

test('the server-rendered portfolio stays accessible without JavaScript', async ({ browser }) => {
	const context = await browser.newContext({ javaScriptEnabled: false });
	const page = await context.newPage();
	await page.goto('http://127.0.0.1:5180/');
	await expect(page.locator('[data-site-intro]')).toBeHidden();
	await expect(page.locator('.site-shell')).not.toHaveAttribute('inert');
	await expect(page.locator('.intro-title')).toBeVisible();
	await context.close();
});
