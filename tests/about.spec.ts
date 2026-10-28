import { expect, test } from '@playwright/test';

const topics = [
	['My journey', 'journey'],
	['My activities', 'activities'],
	['My soft skills', 'soft-skills'],
	['My hard skills', 'hard-skills'],
	['Education & Training', 'education'],
	['Spoken Languages', 'languages']
] as const;

test('each About topic is its own deep-linkable page with a working Back link', async ({
	page
}) => {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.goto('/about', { waitUntil: 'networkidle' });
	await expect(page.locator('[data-slot="accordion-trigger"]')).toHaveCount(0);
	await expect(
		page.getByRole('navigation', { name: 'About me topics' }).getByRole('link')
	).toHaveCount(6);
	for (const [label, slug] of topics) {
		await page
			.getByRole('navigation', { name: 'About me topics' })
			.getByRole('link', { name: label, exact: true })
			.click();
		await expect(page).toHaveURL(new RegExp(`/about/${slug}$`));
		await expect(page.getByRole('heading', { level: 1 })).toContainText(new RegExp(label, 'i'));
		await page.reload({ waitUntil: 'networkidle' });
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
		await expect(
			page
				.getByRole('navigation', { name: 'Main navigation', exact: true })
				.getByRole('link', { name: 'About me' })
		).toHaveAttribute('aria-current', 'page');
		await page.getByRole('link', { name: 'Back', exact: true }).click();
		await expect(page).toHaveURL(/\/about$/);
	}
	expect(errors).toEqual([]);
});

test('mobile About matches the portrait-free navigation and all details fit narrow screens', async ({
	page
}) => {
	await page.setViewportSize({ width: 320, height: 700 });
	await page.goto('/about', { waitUntil: 'networkidle' });
	await expect(page.locator('.about-portrait')).toBeHidden();
	for (const [, slug] of topics) {
		await page.locator(`.about-topic[href="/about/${slug}"]`).click();
		await expect(page).toHaveURL(new RegExp(`/about/${slug}$`));
		await expect(page.getByRole('link', { name: 'Back', exact: true })).toBeVisible();
		expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
			320
		);
		await page.getByRole('link', { name: 'Back', exact: true }).click();
	}
	await page.getByRole('link', { name: 'Journey', exact: true }).click();
	await expect(page).toHaveURL(/\/about\/journey$/);
	await page.goBack();
	await expect(page).toHaveURL(/\/about$/);
	await page.goForward();
	await expect(page).toHaveURL(/\/about\/journey$/);
});

test('unknown About topics return a real 404', async ({ page }) => {
	const response = await page.goto('/about/not-a-topic');
	expect(response?.status()).toBe(404);
});
