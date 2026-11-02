import { expect, type Page, test } from '@playwright/test';

async function settled(page: Page) {
	await expect(page.locator('[data-shared-art-layer], [data-page-slide-layer]')).toHaveCount(0);
	await expect(page.locator('#main')).toHaveCSS('opacity', '1');
	await expect(page.locator('#main')).toHaveCSS('transform', 'none');
}

for (const width of [1440, 390]) {
	test(`Contact cards rotate independently while the Portfolio U stays in place at ${width}px`, async ({
		page
	}) => {
		await page.setViewportSize({ width, height: 900 });
		await page.goto('/work', { waitUntil: 'networkidle' });
		const sourceBounds = await page.locator('.work-ornament').boundingBox();
		if (width < 768) {
			await page.getByRole('button', { name: 'Open navigation' }).click();
			await page
				.getByRole('navigation', { name: 'Mobile navigation' })
				.getByRole('link', { name: 'Contact me' })
				.click();
		} else await page.locator('.work-page .section-next').click();
		await expect(page).toHaveURL('/contact');
		await expect(
			page.locator('[data-art-ghost], [data-art-replacement], [data-page-slide-layer]')
		).toHaveCount(0);
		const motion = await page.evaluate(() => {
			const backdrop = document.querySelector('[data-art-page]');
			const ornament = backdrop?.querySelector('.work-ornament');
			if (!backdrop || !ornament) throw new Error('Missing outgoing Portfolio composition');
			for (const animation of backdrop.getAnimations()) animation.pause();
			const cards = Array.from(document.querySelectorAll('#main [data-contact-card]'));
			const rotations = cards.map((card) => {
				const animation = card.getAnimations()[0];
				if (!animation) throw new Error('Missing card rotation');
				animation.pause();
				animation.currentTime = Number(animation.effect?.getTiming().delay) + 300;
				const matrix = new DOMMatrix(getComputedStyle(card).transform);
				return Math.abs(matrix.m13) + Math.abs(matrix.m31);
			});
			const main = document.querySelector('#main');
			if (!main) throw new Error('Missing page');
			const transform = new DOMMatrix(getComputedStyle(main).transform);
			return {
				ornament: ornament.getBoundingClientRect().toJSON(),
				rotations,
				x: transform.m41,
				y: transform.m42
			};
		});
		expect(motion.ornament).toMatchObject(sourceBounds ?? {});
		expect(motion.rotations).toHaveLength(2);
		expect(motion.rotations.every((rotation) => rotation > 0.1)).toBe(true);
		expect(motion.x).toBe(0);
		expect(motion.y).toBe(0);
		await expect(page.locator('#main [data-shared-art="contact"]')).toHaveCSS(
			'visibility',
			'visible'
		);
		await page.evaluate(() => {
			for (const element of document.querySelectorAll('[data-art-page], #main [data-contact-card]'))
				for (const animation of element.getAnimations()) animation.play();
		});
		await settled(page);
		for (const card of await page.locator('#main [data-contact-card]').all())
			await expect(card).toHaveCSS('transform', 'none');
		await page.getByRole('button', { name: 'Hire Me!', exact: true }).click();
		await expect(page.getByRole('dialog')).toBeVisible();
		await page.getByRole('button', { name: 'Close', exact: true }).click();
		await page.goBack();
		await expect(page.locator('[data-art-ghost], [data-art-replacement]')).toHaveCount(0);
		await expect
			.poll(() =>
				page
					.locator('[data-art-page] [data-contact-card]')
					.evaluateAll((cards) => cards.filter((card) => card.getAnimations().length > 0).length)
			)
			.toBe(2);
		const reverse = await page.evaluate(() => {
			const backdrop = document.querySelector('[data-art-page]');
			if (!backdrop) throw new Error('Missing outgoing Contact composition');
			for (const animation of backdrop.getAnimations({ subtree: true })) {
				animation.pause();
				animation.currentTime = 400;
			}
			const cards = Array.from(backdrop.querySelectorAll('[data-contact-card]'));
			return {
				opacity: Number(getComputedStyle(backdrop).opacity),
				rotations: cards.map((card) => {
					const matrix = new DOMMatrix(getComputedStyle(card).transform);
					return Math.abs(matrix.m13) + Math.abs(matrix.m31);
				}),
				delays: cards.map((card) => card.getAnimations()[0]?.effect?.getTiming().delay)
			};
		});
		expect(reverse.opacity).toBeGreaterThan(0.75);
		expect(reverse.rotations).toHaveLength(2);
		expect(reverse.rotations.every((rotation) => rotation > 0.1)).toBe(true);
		expect(reverse.delays).toEqual([100, 0]);
		await page.evaluate(() => {
			for (const animation of document
				.querySelector('[data-art-page]')
				?.getAnimations({ subtree: true }) ?? [])
				animation.play();
		});
		await settled(page);
		await expect(page.locator('.work-ornament')).toHaveCSS('visibility', 'visible');
		await page.goForward();
		await settled(page);
	});
}

test('Independent card rotation resets on interruption and skips reduced motion', async ({
	page
}) => {
	await page.goto('/work', { waitUntil: 'networkidle' });
	await page.locator('.work-page .section-next').click();
	await expect(page.locator('[data-shared-art-layer]')).toHaveCount(1);
	await page.keyboard.press('Escape');
	await settled(page);
	for (const card of await page.locator('#main [data-contact-card]').all())
		await expect(card).toHaveCSS('transform', 'none');
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/work', { waitUntil: 'networkidle' });
	await page.locator('.work-page .section-next').click();
	await expect(page).toHaveURL('/contact');
	await settled(page);
	expect(
		await page
			.locator('#main [data-contact-card]')
			.evaluateAll((cards) => cards.every((card) => card.getAnimations().length === 0))
	).toBe(true);
});

test('Contact return animation works through the menu and cleans up when interrupted', async ({
	page
}) => {
	await page.goto('/contact', { waitUntil: 'networkidle' });
	await page
		.getByRole('navigation', { name: 'Main navigation' })
		.getByRole('link', { name: 'Portfolio', exact: true })
		.click();
	await expect(page).toHaveURL('/work');
	await expect(page.locator('[data-art-page] [data-contact-card]')).toHaveCount(2);
	await page.keyboard.press('Escape');
	await settled(page);
	await expect(page.locator('.work-ornament')).toHaveCSS('visibility', 'visible');
	await expect(page.locator('[data-contact-card]')).toHaveCount(0);
});
