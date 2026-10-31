import { expect, test } from '@playwright/test';

test('Portfolio types its label, project name and summary in order without layout shifts', async ({
	page
}) => {
	await page.clock.install();
	await page.clock.pauseAt(new Date());
	await page.goto('/work', { waitUntil: 'networkidle' });
	const label = page.locator('.section-label');
	const title = page.locator('.project-copy h2');
	const summary = page.locator('.project-copy .body-copy');
	const geometry = () =>
		page
			.locator('.section-label, .project-copy h2, .project-copy .body-copy, .project-copy a')
			.evaluateAll((elements) =>
				elements.map((element) => element.getBoundingClientRect().toJSON())
			);
	const before = await geometry();
	await page.clock.runFor(280);
	expect(await label.locator('.typed-character:not(.untyped)').count()).toBeGreaterThan(0);
	expect(await label.locator('.untyped').count()).toBeGreaterThan(0);
	await expect(title.locator('.typed-character:not(.untyped)')).toHaveCount(0);
	await expect(summary.locator('.typed-character:not(.untyped)')).toHaveCount(0);
	await page.clock.runFor(480);
	await expect(label.locator('.untyped')).toHaveCount(0);
	expect(await title.locator('.typed-character:not(.untyped)').count()).toBeGreaterThan(0);
	expect(await title.locator('.untyped').count()).toBeGreaterThan(0);
	await expect(summary.locator('.typed-character:not(.untyped)')).toHaveCount(0);
	await page.clock.runFor(750);
	await expect(title.locator('.untyped')).toHaveCount(0);
	expect(await summary.locator('.typed-character:not(.untyped)').count()).toBeGreaterThan(0);
	expect(await summary.locator('.untyped').count()).toBeGreaterThan(0);
	await page.clock.runFor(1600);
	await expect(page.locator('.work-page .untyped')).toHaveCount(0);
	expect(await geometry()).toEqual(before);
});

test('Portfolio typing finishes immediately for reduced motion or keyboard input', async ({
	page
}) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/work', { waitUntil: 'networkidle' });
	await expect(page.locator('.work-page')).toHaveClass(/typing-complete/);
	await expect(page.locator('.work-page .untyped')).toHaveCount(0);
	await page.emulateMedia({ reducedMotion: 'no-preference' });
	await page.reload();
	await page.keyboard.press('Tab');
	await expect(page.locator('.work-page .untyped')).toHaveCount(0);
	await page.getByRole('link', { name: 'View Details', exact: true }).click();
	await expect(page).toHaveURL(/\/work\/[^/]+$/);
	await expect(page.locator('.work-page')).toHaveCount(0);
});

test('Portfolio text remains readable without JavaScript', async ({ browser }) => {
	const context = await browser.newContext({ javaScriptEnabled: false });
	const page = await context.newPage();
	await page.goto('/work');
	for (const selector of ['.section-label', '.project-copy h2', '.project-copy .body-copy']) {
		await expect(page.locator(`${selector} .typed-character`).first()).toHaveCSS(
			'visibility',
			'visible'
		);
	}
	await context.close();
});
