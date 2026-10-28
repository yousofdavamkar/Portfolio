import { expect, type Page, test } from '@playwright/test';

function nav(page: Page) {
	return page.getByRole('navigation', { name: 'Main navigation', exact: true });
}

async function clickNavigation(page: Page, name: string) {
	const box = await nav(page).getByRole('link', { name, exact: true }).boundingBox();
	if (!box) throw new Error(`Navigation link not visible: ${name}`);
	// Real pointer input, without locator auto-wait masking mid-animation failures.
	await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
}

async function settled(page: Page, path: string) {
	await expect(page).toHaveURL(new RegExp(`${path}$`));
	await expect
		.poll(() =>
			page.locator('#main').evaluate((main) => ({
				opacity: getComputedStyle(main).opacity,
				transform: getComputedStyle(main).transform,
				busy: main.closest('[aria-busy]')?.getAttribute('aria-busy') === 'true'
			}))
		)
		.toEqual({ opacity: '1', transform: 'none', busy: false });
	await expect(page.locator('.journey-graphics, .navigation-loading')).toHaveCount(0);
}

test('next-page links and history restore readable, interactive pages', async ({ page }) => {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.goto('/', { waitUntil: 'networkidle' });
	await page.getByRole('link', { name: 'Discover more about me' }).click();
	await settled(page, '/about');
	await page.getByRole('link', { name: 'Explore portfolio', exact: true }).click();
	await settled(page, '/work');
	await page.goBack();
	await settled(page, '/about');
	await page.goForward();
	await settled(page, '/work');
	expect(errors).toEqual([]);
});

for (const delay of [20, 200]) {
	test(`a new click wins ${delay}ms into a transition`, async ({ page }) => {
		await page.goto('/', { waitUntil: 'networkidle' });
		await clickNavigation(page, 'About me');
		await page.waitForFunction(
			() => (document.querySelector('#main')?.getAnimations().length ?? 0) > 0
		);
		await page.waitForTimeout(delay);
		await clickNavigation(page, 'Contact me');
		await settled(page, '/contact');
		await clickNavigation(page, 'Portfolio');
		await settled(page, '/work');
	});
}

test('keyboard input cancels animation without leaving content faded', async ({ page }) => {
	await page.goto('/', { waitUntil: 'networkidle' });
	await clickNavigation(page, 'About me');
	await page.waitForFunction(
		() => (document.querySelector('#main')?.getAnimations().length ?? 0) > 0
	);
	await page.keyboard.press('Escape');
	await settled(page, '/about');
	await nav(page).getByRole('link', { name: 'Contact me' }).focus();
	await page.keyboard.press('Enter');
	await settled(page, '/contact');
});

test('reduced motion keeps navigation immediate and the fixed yellow theme', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.addInitScript(() => localStorage.setItem('portfolio-accent', 'purple'));
	await page.goto('/', { waitUntil: 'networkidle' });
	await clickNavigation(page, 'About me');
	await settled(page, '/about');
	await expect(page.getByRole('button', { name: 'Choose accent color' })).toHaveCount(0);
	await expect(page.locator('.accent-trigger, .color-dialog')).toHaveCount(0);
	expect(
		await page
			.locator('html')
			.evaluate((html) => getComputedStyle(html).getPropertyValue('--primary').trim())
	).toBe('#ffca05');
	expect(await page.locator('#main').evaluate((main) => main.getAnimations().length)).toBe(0);
});

test('mobile menu closes and page transitions leave no overflow or blocked controls', async ({
	page
}) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/', { waitUntil: 'networkidle' });
	for (const [name, path] of [
		['About me', '/about'],
		['Contact me', '/contact']
	] as const) {
		await page.getByRole('button', { name: 'Open navigation' }).click();
		await page
			.getByRole('navigation', { name: 'Mobile navigation' })
			.getByRole('link', { name })
			.click();
		await settled(page, path);
		await expect(page.getByRole('dialog')).toHaveCount(0);
		expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
			true
		);
	}
});

test('slow loading keeps the header usable and a newer destination wins', async ({ page }) => {
	await page.goto('/', { waitUntil: 'networkidle' });
	await page.route('**/contact/__data.json*', async (route) => {
		await new Promise((resolve) => setTimeout(resolve, 800));
		await route.continue();
	});
	await clickNavigation(page, 'Contact me');
	await expect(page.locator('.navigation-loading')).toBeVisible();
	const link = nav(page).getByRole('link', { name: 'About me' });
	const clickable = await link.evaluate((element) => {
		const rect = element.getBoundingClientRect();
		return document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2) === element;
	});
	expect(clickable).toBe(true);
	await clickNavigation(page, 'About me');
	await settled(page, '/about');
});
