import { expect, test } from '@playwright/test';

test('Contact fits the viewport with its artwork and keeps the form behind Hire Me', async ({
	page
}) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	for (const viewport of [
		{ width: 1440, height: 810 },
		{ width: 1440, height: 720 },
		{ width: 390, height: 844 }
	]) {
		await page.setViewportSize(viewport);
		await page.goto('/contact', { waitUntil: 'networkidle' });
		await expect(page.getByRole('heading', { name: /Contact me/, level: 1 })).toBeVisible();
		await expect(page.locator('.scene-graphics')).toHaveCount(0);
		await expect(page.getByRole('dialog')).toHaveCount(0);
		expect(
			await page
				.locator('.contact-artwork img')
				.evaluate((image) => image instanceof HTMLImageElement && image.naturalWidth > 0)
		).toBe(true);
		expect(
			await page.evaluate(
				() =>
					document.documentElement.scrollWidth <= innerWidth &&
					document.documentElement.scrollHeight <= innerHeight + 1
			)
		).toBe(true);
		const hire = page.getByRole('button', { name: 'Hire Me!', exact: true });
		await hire.click();
		await expect(page.getByRole('dialog', { name: 'Tell me what you’re thinking.' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Send message', exact: true })).toBeInViewport();
		await page.keyboard.press('Escape');
		await expect(page.getByRole('dialog')).toHaveCount(0);
		await expect(hire).toBeFocused();
	}
});

test('The contact dialog preserves enhanced submission and shows success without leaving the page', async ({
	page
}) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	// Keep this verification local: no message is written to the real backend.
	await page.route('**/contact', async (route) => {
		if (route.request().method() !== 'POST') return route.continue();
		await route.fulfill({
			contentType: 'application/json',
			body: JSON.stringify({ type: 'success', status: 200, data: '[{"success":1},true]' })
		});
	});
	await page.goto('/contact', { waitUntil: 'networkidle' });
	await page.getByRole('button', { name: 'Hire Me!', exact: true }).click();
	await page.getByLabel('Your name', { exact: true }).fill('Contact preview');
	await page.getByLabel('Email address', { exact: true }).fill('preview@example.com');
	await page
		.getByLabel('What do you have in mind?', { exact: true })
		.fill('A local contact form verification.');
	await page.getByRole('button', { name: 'Send message', exact: true }).click();
	await expect(page.getByRole('dialog', { name: 'Message received.' })).toBeVisible();
	await expect(page).toHaveURL(/\/contact$/);
	await page.getByRole('button', { name: /Send another message/ }).click();
	await expect(page.getByLabel('Your name', { exact: true })).toHaveValue('');
	await expect(page.getByRole('button', { name: 'Send message', exact: true })).toBeEnabled();
});
