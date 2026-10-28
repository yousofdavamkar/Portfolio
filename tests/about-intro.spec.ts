import { expect, test } from '@playwright/test';

test('About types both headings in order, then reveals topics without shifting the layout', async ({
	page
}) => {
	await page.goto('/about');
	const label = page.locator('.about-label');
	const question = page.locator('.about-question');
	const topics = page.locator('.topic-reveal');
	const geometry = () =>
		page
			.locator('.about-label, .about-question, .about-choices nav')
			.evaluateAll((elements) =>
				elements.map((element) => element.getBoundingClientRect().toJSON())
			);
	const before = await geometry();
	await expect
		.poll(() => label.locator('.typed-character:not(.untyped)').count(), { intervals: [20] })
		.toBeGreaterThan(0);
	expect(await label.locator('.untyped').count()).toBeGreaterThan(0);
	await expect(question).toBeHidden();
	await expect(topics.first()).toBeHidden();
	await expect(question).toBeVisible();
	await expect(label.locator('.untyped')).toHaveCount(0);
	await expect
		.poll(() => question.locator('.typed-character:not(.untyped)').count(), { intervals: [20] })
		.toBeGreaterThan(0);
	expect(await question.locator('.untyped').count()).toBeGreaterThan(0);
	await expect(topics.first()).toBeVisible();
	await expect(question.locator('.untyped')).toHaveCount(0);
	await expect(topics.last()).toBeHidden();
	await expect(page.locator('.about-page')).toHaveClass(/intro-complete/);
	for (const topic of await topics.all()) await expect(topic).toBeVisible();
	expect(await geometry()).toEqual(before);
	await expect(
		page.getByRole('heading', { name: 'What do you want to know about me?', exact: true })
	).toBeVisible();
});

test('About typing skips for reduced motion and keyboard input and cleans up on navigation', async ({
	page
}) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/about');
	await expect(page.locator('.about-page')).toHaveClass(/intro-complete/);
	await expect(page.locator('.about-page .untyped')).toHaveCount(0);
	await expect(page.locator('.topic-reveal').last()).toBeVisible();
	await page.emulateMedia({ reducedMotion: 'no-preference' });
	await page.reload();
	await page.keyboard.press('Tab');
	await expect(page.locator('.about-page')).toHaveClass(/intro-complete/);
	await expect(page.locator('.about-page .untyped')).toHaveCount(0);
	await page.getByRole('link', { name: 'My journey', exact: true }).click();
	await expect(page).toHaveURL(/\/about\/journey$/);
	await page.getByRole('link', { name: 'Back', exact: true }).click();
	await expect(page).toHaveURL(/\/about$/);
	await page
		.getByRole('navigation', { name: 'Main navigation', exact: true })
		.getByRole('link', { name: 'Contact me' })
		.click();
	await expect(page).toHaveURL(/\/contact$/);
	await expect(page.locator('.about-page')).toHaveCount(0);
	await expect(page.locator('#main')).toHaveCSS('opacity', '1');
});

test('About remains readable and navigable without JavaScript', async ({ browser }) => {
	const context = await browser.newContext({ javaScriptEnabled: false });
	const page = await context.newPage();
	await page.goto('/about');
	await expect(page.getByRole('heading', { name: 'About me', exact: true })).toBeVisible();
	await expect(
		page.getByRole('heading', { name: 'What do you want to know about me?', exact: true })
	).toBeVisible();
	await expect(page.locator('.about-label .typed-character').first()).toHaveCSS(
		'visibility',
		'visible'
	);
	await page.getByRole('link', { name: 'My journey', exact: true }).click();
	await expect(page).toHaveURL(/\/about\/journey$/);
	await context.close();
});
