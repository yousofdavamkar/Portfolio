import { expect, test } from '@playwright/test';

test('types each message in order, then hides the indicator without shifting the layout', async ({
	page
}) => {
	await page.route('**/api/resume', (route) => route.fulfill({ json: { url: null } }));
	await page.goto('/');
	const indicator = page.locator('.intro-label');
	const greeting = page.locator('.greeting');
	const introduction = page.locator('.intro-title');
	const lastMessage = page.locator('.resume-bubble');
	await expect(indicator).toBeVisible();
	await expect(introduction).toBeHidden();
	await expect(lastMessage).toBeHidden();
	await expect(greeting).toBeVisible();
	const initialBox = await page.locator('.hero-intro').boundingBox();
	await expect(introduction).toBeVisible();
	await expect(greeting.locator('.untyped')).toHaveCount(0);
	await expect(lastMessage).toBeHidden();
	await expect(lastMessage).toBeVisible();
	await expect(introduction.locator('.untyped')).toHaveCount(0);
	await expect(indicator).toBeHidden({ timeout: 8000 });
	await expect(page.locator('.hero-intro .untyped')).toHaveCount(0);
	await expect(
		page.getByRole('heading', { name: 'I’m Yousof Davamkar, a Fullstack web developer!' })
	).toBeVisible();
	await expect(lastMessage.getByRole('link', { name: 'Let’s build it together' })).toHaveAttribute(
		'href',
		'/contact'
	);
	expect(await page.locator('.hero-intro').boundingBox()).toEqual(initialBox);
});

test('a slow resume types the correct final message before the indicator disappears', async ({
	page
}) => {
	await page.route('**/api/resume', async (route) => {
		await new Promise((resolve) => setTimeout(resolve, 3600));
		await route.fulfill({ json: { url: 'https://example.com/resume.pdf' } });
	});
	await page.goto('/');
	await expect(page.getByRole('status', { name: 'Loading resume' })).toBeVisible({ timeout: 5000 });
	await expect(page.locator('.intro-label')).toBeVisible();
	await expect(page.locator('.intro-label')).toBeHidden({ timeout: 8000 });
	await expect(page.getByRole('link', { name: '(Download CV)' })).toHaveAttribute(
		'href',
		'https://example.com/resume.pdf'
	);
	await expect(page.locator('.hero-intro .untyped')).toHaveCount(0);
});

test('reduced motion and keyboard input reveal the entire introduction immediately', async ({
	page
}) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/');
	await expect(page.locator('.intro-label')).toBeHidden();
	await expect(page.locator('.intro-title')).toBeVisible();
	await expect(page.locator('.resume-bubble')).toBeVisible();
	await page.emulateMedia({ reducedMotion: 'no-preference' });
	await page.reload();
	await expect(page.locator('.intro-label')).toBeVisible();
	await page.keyboard.press('Tab');
	await expect(page.locator('.intro-label')).toBeHidden();
	await expect(page.locator('.hero-intro .untyped')).toHaveCount(0);
});
