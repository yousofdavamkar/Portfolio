import { expect, type Page, test } from '@playwright/test';

async function inspectArtwork(page: Page, targetName: 'contact' | 'ornament') {
	const layer = page.locator('[data-shared-art-layer]');
	const target = page.locator(`#main [data-shared-art="${targetName}"]`);
	await expect(layer).toHaveCount(1);
	await expect(page.locator('[data-page-slide-layer]')).toHaveCount(0);
	await expect(layer.locator('[data-art-replacement]')).toHaveCount(1);
	await expect(target).toHaveCSS('visibility', 'hidden');
	const landing = await page.evaluate((name) => {
		const ghost = document.querySelector('[data-art-ghost]');
		const target = document.querySelector(`#main [data-shared-art="${name}"]`);
		const main = document.querySelector('#main');
		if (!ghost || !target || !main) throw new Error('Missing chapter artwork');
		for (const animation of ghost.getAnimations({ subtree: true })) {
			animation.pause();
			animation.currentTime = Number(animation.effect?.getComputedTiming().endTime) - 0.01;
		}
		const actual = ghost.getBoundingClientRect();
		const expected = target.getBoundingClientRect();
		const transform = new DOMMatrix(getComputedStyle(main).transform);
		return {
			error: Math.max(
				Math.abs(actual.x - expected.x),
				Math.abs(actual.y - expected.y),
				Math.abs(actual.width - expected.width),
				Math.abs(actual.height - expected.height)
			),
			x: transform.m41,
			y: transform.m42
		};
	}, targetName);
	expect(landing.error).toBeLessThan(1);
	expect(landing.x).toBe(0);
	expect(landing.y).toBe(0);
	await expect(layer).toHaveAttribute('aria-hidden', 'true');
	await expect(layer).toHaveCSS('pointer-events', 'none');
	await page.evaluate(() => {
		for (const animation of document
			.querySelector('[data-art-ghost]')
			?.getAnimations({ subtree: true }) ?? [])
			animation.play();
	});
	await expect(layer).toHaveCount(0);
	await expect(target).toHaveCSS('visibility', 'visible');
	await expect(page.locator('#main')).toHaveCSS('opacity', '1');
	await expect(page.locator('#main')).toHaveCSS('transform', 'none');
}

for (const width of [1440, 390]) {
	test(`Portfolio and Contact exchange artwork with an in-place crossfade at ${width}px`, async ({
		page
	}) => {
		await page.setViewportSize({ width, height: 900 });
		await page.goto('/work', { waitUntil: 'networkidle' });
		if (width < 768) {
			await page.getByRole('button', { name: 'Open navigation' }).click();
			await page
				.getByRole('navigation', { name: 'Mobile navigation' })
				.getByRole('link', { name: 'Contact me' })
				.click();
		} else await page.locator('.work-page .section-next').click();
		await expect(page).toHaveURL('/contact');
		await inspectArtwork(page, 'contact');
		await expect(page.locator('.site-header')).toHaveCSS('transform', 'none');
		await page.getByRole('button', { name: 'Hire Me!', exact: true }).click();
		await expect(page.getByRole('dialog')).toBeVisible();
		await page.getByRole('button', { name: 'Close', exact: true }).click();
		await page.goBack();
		await inspectArtwork(page, 'ornament');
		if (width >= 1024) await expect(page.locator('.project-preview')).toHaveCSS('opacity', '1');
		await page.goForward();
		await inspectArtwork(page, 'contact');
	});
}

test('Contact artwork restores on interruption and reduced motion', async ({ page }) => {
	await page.goto('/work', { waitUntil: 'networkidle' });
	await page.locator('.work-page .section-next').click();
	await expect(page.locator('[data-shared-art-layer]')).toHaveCount(1);
	await page
		.getByRole('navigation', { name: 'Main navigation', exact: true })
		.getByRole('link', { name: 'Home', exact: true })
		.click();
	await expect(page).toHaveURL('/');
	await expect(page.locator('[data-shared-art-layer], [data-page-slide-layer]')).toHaveCount(0);
	await expect(page.locator('#main')).toHaveCSS('opacity', '1');
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/work', { waitUntil: 'networkidle' });
	await page.locator('.work-page .section-next').click();
	await expect(page).toHaveURL('/contact');
	await expect(page.locator('[data-shared-art-layer], [data-page-slide-layer]')).toHaveCount(0);
	await expect(page.locator('#main [data-shared-art="contact"]')).toHaveCSS(
		'visibility',
		'visible'
	);
});
