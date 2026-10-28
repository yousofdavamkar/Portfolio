import { expect, type Page, test } from '@playwright/test';

async function openPortfolio(page: Page, mobile: boolean) {
	if (mobile) {
		await page.getByRole('button', { name: 'Open navigation' }).click();
		await page
			.getByRole('navigation', { name: 'Mobile navigation' })
			.getByRole('link', { name: 'Portfolio', exact: true })
			.click();
	} else await page.getByRole('link', { name: 'Explore portfolio', exact: true }).click();
}

async function settled(page: Page) {
	await expect(page.locator('[data-shared-art-layer], [data-page-slide-layer]')).toHaveCount(0);
	await expect(page.locator('#main')).toHaveCSS('opacity', '1');
	await expect(page.locator('#main')).toHaveCSS('transform', 'none');
	await expect(page.locator('#main [data-shared-art="ornament"]')).toHaveCSS(
		'visibility',
		'visible'
	);
}

for (const from of ['/about', '/about/languages']) {
	for (const width of [1440, 390]) {
		test(`${from} crossfades into Portfolio with a continuous arch at ${width}px`, async ({
			page
		}) => {
			await page.setViewportSize({ width, height: 900 });
			await page.goto(from, { waitUntil: 'networkidle' });
			await openPortfolio(page, width < 768);
			for (const destination of ['/work', from]) {
				await expect(page).toHaveURL(new RegExp(`${destination}$`));
				await expect(page.locator('[data-art-ghost]')).toHaveCount(1);
				await expect(page.locator('[data-page-slide-layer]')).toHaveCount(0);
				await expect(page.locator('[data-shared-art-layer]')).toHaveCSS('pointer-events', 'none');
				await expect(page.locator('#main [data-shared-art="ornament"]')).toHaveCSS(
					'visibility',
					'hidden'
				);
				await page.waitForFunction(() =>
					document
						.querySelector('[data-art-ghost="ornament"]')
						?.getAnimations()
						.some((animation) => Number(animation.currentTime) > 200)
				);
				const landing = await page.evaluate(() => {
					const ghost = document.querySelector('[data-art-ghost="ornament"]');
					const target = document.querySelector('#main [data-shared-art="ornament"]');
					if (!ghost || !target) throw new Error('Missing shared arch');
					for (const animation of ghost.getAnimations({ subtree: true })) {
						animation.pause();
						animation.currentTime = Number(animation.effect?.getComputedTiming().endTime) - 0.01;
					}
					const actual = ghost.getBoundingClientRect();
					const expected = target.getBoundingClientRect();
					return Math.max(
						Math.abs(actual.x - expected.x),
						Math.abs(actual.y - expected.y),
						Math.abs(actual.width - expected.width),
						Math.abs(actual.height - expected.height)
					);
				});
				expect(landing).toBeLessThan(1);
				if (destination === '/work' && width >= 1024) {
					await expect(page.locator('.project-preview')).toHaveCSS('opacity', '0');
					await expect(page.locator('.project-preview')).toHaveAttribute('inert', '');
					// Even when the U is held past its usual duration, the image waits for completion.
					await page.waitForTimeout(1100);
					await expect(page.locator('.project-preview')).toHaveCSS('opacity', '0');
				}
				await page.evaluate(() => {
					for (const animation of document
						.querySelector('[data-art-ghost="ornament"]')
						?.getAnimations({ subtree: true }) ?? [])
						animation.play();
				});
				await settled(page);
				if (destination === '/work') {
					if (width >= 1024) {
						await expect(page.locator('.project-preview')).toHaveCSS('opacity', '1');
						await expect(page.locator('.project-preview')).not.toHaveAttribute('inert');
					}
					await page.goBack();
				}
			}
			expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
				true
			);
		});
	}

	test(`${from} to Portfolio cleans up interrupted and reduced-motion transitions`, async ({
		page
	}) => {
		await page.goto(from, { waitUntil: 'networkidle' });
		await openPortfolio(page, false);
		await expect(page).toHaveURL(/\/work$/);
		await expect(page.locator('[data-art-ghost="ornament"]')).toHaveCount(1);
		await page.keyboard.press('Escape');
		await settled(page);
		await expect(page.locator('.project-preview')).toHaveCSS('opacity', '1');
		await expect(page.locator('.project-preview')).not.toHaveAttribute('inert');
		await page.emulateMedia({ reducedMotion: 'reduce' });
		await page.goBack();
		await openPortfolio(page, false);
		await expect(page).toHaveURL(/\/work$/);
		await settled(page);
		expect(await page.locator('#main').evaluate((main) => main.getAnimations().length)).toBe(0);
	});
}
