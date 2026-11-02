import { expect, type Page, test } from '@playwright/test';

async function ready(page: Page, path: string) {
	await expect(page).toHaveURL(path);
	await expect(page.locator('[data-site-intro]')).toHaveCount(0, { timeout: 7000 });
	await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
	await expect(page.locator('[data-shared-art-layer]')).toHaveCount(0);
}
async function edge(page: Page, direction: number) {
	await page.evaluate(
		(direction) =>
			window.scrollTo({
				top: direction > 0 ? document.documentElement.scrollHeight : 0,
				behavior: 'instant'
			}),
		direction
	);
	await page.mouse.move(650, 330);
	await page.waitForTimeout(300);
}
async function chapter(page: Page, direction: number, path: string) {
	await edge(page, direction);
	await page.mouse.wheel(0, direction * 130);
	await ready(page, path);
}

test('wheel follows every chapter forward and backward through the shared-art transitions', async ({
	page
}) => {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.goto('/', { waitUntil: 'networkidle' });
	await ready(page, '/');
	await chapter(page, 1, '/about');
	await chapter(page, 1, '/work');
	await edge(page, 1);
	await page.mouse.wheel(0, 130);
	await expect(page.locator('[data-contact-card]')).not.toHaveCount(0);
	await ready(page, '/contact');
	await chapter(page, -1, '/work');
	await chapter(page, -1, '/about');
	await chapter(page, -1, '/');
	await edge(page, -1);
	await page.mouse.wheel(0, -500);
	await expect(page).toHaveURL('/');
	expect(errors).toEqual([]);
});

test('trackpad momentum cannot skip a chapter, but a fresh gesture can continue', async ({
	page
}) => {
	await page.goto('/about', { waitUntil: 'networkidle' });
	await ready(page, '/about');
	await edge(page, 1);
	for (let i = 0; i < 32; i++) {
		await page.mouse.wheel(0, 28);
		await page.waitForTimeout(55);
	}
	await ready(page, '/work');
	await chapter(page, 1, '/contact');
});

test('native page scrolling finishes before a new gesture advances; details keep their own scrolling', async ({
	page
}) => {
	await page.setViewportSize({ width: 390, height: 700 });
	await page.goto('/about', { waitUntil: 'networkidle' });
	await ready(page, '/about');
	await page.mouse.move(190, 400);
	await page.mouse.wheel(0, 60);
	await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
	await expect(page).toHaveURL('/about');
	await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
	await page.waitForTimeout(350);
	await page.mouse.wheel(0, 150);
	await ready(page, '/work');
	await page.goto('/about/activities', { waitUntil: 'networkidle' });
	await ready(page, '/about/activities');
	await page.mouse.wheel(0, 1200);
	await page.waitForTimeout(350);
	await expect(page).toHaveURL('/about/activities');
	await expect(page.locator('.chapter-progress')).toHaveCount(0);
});

test('dialogs, horizontal gestures, and zoom never change chapters; menu still works', async ({
	page
}) => {
	await page.goto('/contact', { waitUntil: 'networkidle' });
	await ready(page, '/contact');
	await page.getByRole('button', { name: 'Hire Me!', exact: true }).click();
	await expect(page.getByRole('dialog')).toBeVisible();
	await page.mouse.move(650, 330);
	await page.mouse.wheel(0, -500);
	await expect(page).toHaveURL('/contact');
	await page.getByRole('button', { name: 'Close', exact: true }).click();
	await edge(page, -1);
	await page.mouse.wheel(400, -100);
	await page.locator('#main').dispatchEvent('wheel', { deltaY: -400, ctrlKey: true });
	await expect(page).toHaveURL('/contact');
	await page
		.getByRole('navigation', { name: 'Main navigation', exact: true })
		.getByRole('link', { name: 'Portfolio', exact: true })
		.click();
	await ready(page, '/work');
	await chapter(page, -1, '/about');
});

test('reduced motion and PageUp/PageDown retain chapter navigation without animated layers', async ({
	page
}) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/about', { waitUntil: 'networkidle' });
	await ready(page, '/about');
	await edge(page, 1);
	await page.keyboard.press('PageDown');
	await ready(page, '/work');
	await edge(page, -1);
	await page.keyboard.press('PageUp');
	await ready(page, '/about');
	await expect(page.locator('[data-art-page]')).toHaveCount(0);
	await chapter(page, 1, '/work');
	await page.goBack();
	await ready(page, '/about');
});

test('touch swipes navigate at the edge and leave short or horizontal gestures alone', async ({
	page
}) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/contact', { waitUntil: 'networkidle' });
	await ready(page, '/contact');
	await page.evaluate(() => window.scrollTo(0, 0));
	const swipe = async (x: number, y: number) =>
		page.locator('#main').evaluate(
			(target, end) => {
				const start = new Touch({ identifier: 1, target, clientX: 190, clientY: 350 });
				const finish = new Touch({ identifier: 1, target, clientX: end.x, clientY: end.y });
				target.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, touches: [start] }));
				target.dispatchEvent(
					new TouchEvent('touchmove', { bubbles: true, cancelable: true, touches: [finish] })
				);
				target.dispatchEvent(
					new TouchEvent('touchend', { bubbles: true, changedTouches: [finish] })
				);
			},
			{ x, y }
		);
	await swipe(290, 370);
	await expect(page).toHaveURL('/contact');
	await swipe(190, 380);
	await expect(page).toHaveURL('/contact');
	await swipe(190, 500);
	await ready(page, '/work');
});

test('successive scrolls with a stationary pointer navigate all chapters in both directions', async ({
	page
}) => {
	await page.setViewportSize({ width: 1440, height: 1000 });
	await page.goto('/', { waitUntil: 'networkidle' });
	await ready(page, '/');
	await page.mouse.move(1100, 500);
	for (const path of ['/about', '/work', '/contact']) {
		await page.waitForTimeout(350);
		await page.mouse.wheel(0, 150);
		await ready(page, path);
	}
	for (const path of ['/work', '/about', '/']) {
		await page.waitForTimeout(350);
		await page.mouse.wheel(0, -150);
		await ready(page, path);
	}
});

test('a new trackpad burst unlocks without moving the pointer, while decaying momentum stays put', async ({
	page
}) => {
	await page.setViewportSize({ width: 1440, height: 1000 });
	await page.goto('/about', { waitUntil: 'networkidle' });
	await ready(page, '/about');
	await page.mouse.move(700, 500);
	await page.mouse.wheel(0, 140);
	for (let i = 0; i < 22; i++) {
		await page.waitForTimeout(80);
		await page.mouse.wheel(0, Math.max(2, 25 - i));
	}
	await ready(page, '/work');
	await page.mouse.wheel(0, 140);
	await ready(page, '/contact');
});

test('partial scrolling scrubs artwork depth and settles back; reduced motion keeps artwork still', async ({
	page
}) => {
	await page.setViewportSize({ width: 1440, height: 1000 });
	await page.goto('/work', { waitUntil: 'networkidle' });
	await ready(page, '/work');
	await page.mouse.move(700, 500);
	await page.mouse.wheel(0, 55);
	await expect
		.poll(() => page.locator('.project-art').evaluate((el) => Number(el.style.scale || 1)))
		.toBeGreaterThan(1.02);
	await expect
		.poll(() =>
			page.locator('.project-copy h2').evaluate((el) => Number(getComputedStyle(el).opacity))
		)
		.toBeLessThan(0.95);
	await expect(page).toHaveURL('/work');
	await expect(page.locator('.project-art')).toHaveCSS('scale', 'none');
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.mouse.wheel(0, 55);
	await expect(page.locator('.project-art')).toHaveCSS('scale', 'none');
	await expect(page).toHaveURL('/work');
});

test('a menu click wins during the scroll departure and restores all artwork styles', async ({
	page
}) => {
	await page.setViewportSize({ width: 1440, height: 1000 });
	await page.goto('/about', { waitUntil: 'networkidle' });
	await ready(page, '/about');
	await page.mouse.move(700, 500);
	await page.mouse.wheel(0, 150);
	await page
		.getByRole('navigation', { name: 'Main navigation', exact: true })
		.getByRole('link', { name: 'Contact me' })
		.click();
	await ready(page, '/contact');
	await page.waitForTimeout(400);
	await expect(page).toHaveURL('/contact');
	await expect(page.locator('.contact-artwork')).toHaveCSS('scale', 'none');
});
