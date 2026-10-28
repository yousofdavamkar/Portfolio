import { expect, type Page, test } from '@playwright/test';

// Inject fixtures only into this browser's live subscription; never write sample projects.
async function withProjects(page: Page) {
	await page.routeWebSocket(/convex\.cloud/, (socket) => {
		const server = socket.connectToServer();
		server.onMessage((message) => {
			const frame: unknown = JSON.parse(message.toString());
			const replace = (value: unknown): void => {
				if (!value || typeof value !== 'object') return;
				if ('projects' in value && Array.isArray(value.projects)) {
					const first: unknown = value.projects[0];
					if (first && typeof first === 'object') {
						value.projects = [
							{
								...first,
								title: 'Fixture Alpha',
								gallery: [{ image: '/images/portrait.png', caption: 'Fixture screenshot' }]
							},
							{
								...first,
								title: 'Fixture Beta',
								slug: 'fixture-beta',
								category: 'Interface design'
							},
							{
								...first,
								title: 'Fixture Gamma',
								slug: 'fixture-gamma',
								category: 'Interface design'
							}
						];
					}
					return;
				}
				for (const child of Object.values(value)) replace(child);
			};
			replace(frame);
			socket.send(JSON.stringify(frame));
		});
	});
}

async function settled(page: Page) {
	await expect(page.locator('[data-shared-art-layer]')).toHaveCount(0);
	await expect(page.locator('#main [data-shared-art="project"]')).toHaveCSS(
		'visibility',
		'visible'
	);
}

for (const width of [1440, 390]) {
	test(`detail artwork travels both ways and vertical content slides work at ${width}px`, async ({
		page
	}) => {
		await page.setViewportSize({ width, height: 900 });
		await page.goto('/work', { waitUntil: 'networkidle' });
		await page.getByRole('link', { name: 'View Details', exact: true }).click();
		await expect(page).toHaveURL(/\/work\/[^/]+$/);
		await expect(page.locator('[data-art-ghost="project"]')).toHaveCount(1);
		await settled(page);
		await expect(page.locator('.slide-count')).toHaveText('1 / 2');
		await page.getByRole('button', { name: 'Next detail slide', exact: true }).click();
		await expect(page.locator('.slide-count')).toHaveText('2 / 2');
		await expect(
			page.getByRole('button', { name: 'Next detail slide', exact: true })
		).toBeDisabled();
		await page.locator('.slide-viewport').focus();
		await page.keyboard.press('Home');
		await expect(page.locator('.slide-count')).toHaveText('1 / 2');
		await page.mouse.click(2, 2);
		await page.getByRole('link', { name: 'All projects' }).click();
		await expect(page).toHaveURL(/\/work$/);
		await expect(page.locator('[data-art-ghost="project"]')).toHaveCount(1);
		await settled(page);
		expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
			true
		);
	});
}

test('autoplay advances, wraps, pauses on interaction and filters to one project', async ({
	page
}) => {
	await withProjects(page);
	await page.clock.install();
	await page.goto('/work', { waitUntil: 'networkidle' });
	await expect(page.locator('.project-copy h2')).toHaveText('Fixture Alpha');
	await page.mouse.move(1, 1);
	await page.clock.fastForward(6100);
	await expect(page.locator('.project-copy h2')).toHaveText('Fixture Beta');
	await page.clock.fastForward(6100);
	await expect(page.locator('.project-copy h2')).toHaveText('Fixture Gamma');
	await page.clock.fastForward(6100);
	await expect(page.locator('.project-copy h2')).toHaveText('Fixture Alpha');
	await page.locator('.project-art').hover();
	await page.clock.fastForward(12000);
	await expect(page.locator('.project-copy h2')).toHaveText('Fixture Alpha');
	await page.getByRole('button', { name: 'Pause project slideshow' }).click();
	await page.mouse.move(1, 1);
	await page
		.getByRole('button', { name: 'Play project slideshow' })
		.evaluate((node) => node.blur());
	await page.clock.fastForward(12000);
	await expect(page.locator('.project-copy h2')).toHaveText('Fixture Alpha');
	await page.getByRole('button', { name: 'Next project', exact: true }).click();
	await expect(page.locator('.project-copy h2')).toHaveText('Fixture Beta');
	await page.getByRole('button', { name: 'Web development', exact: true }).click();
	await expect(page.locator('.project-number')).toHaveAttribute('aria-label', 'Project 1 of 1');
	await expect(page.getByRole('button', { name: 'Next project', exact: true })).toBeDisabled();
});

test('reduced motion disables autoplay and gallery screenshots stay within the current project', async ({
	page
}) => {
	await withProjects(page);
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/work', { waitUntil: 'networkidle' });
	await expect(page.locator('.project-copy h2')).toHaveText('Fixture Alpha');
	await page.clock.install();
	await page.clock.fastForward(18000);
	await expect(page.locator('.project-copy h2')).toHaveText('Fixture Alpha');
	await expect(page.getByRole('button', { name: 'Pause project slideshow' })).toHaveCount(0);
	await page.getByRole('link', { name: 'View Details', exact: true }).click();
	await settled(page);
	await expect(page.locator('.slide-count')).toHaveText('1 / 3');
	await page.getByRole('button', { name: 'Next detail slide', exact: true }).click();
	await expect(page.locator('.slide-count')).toHaveText('2 / 3');
	await expect(page.getByText('Fixture screenshot', { exact: true })).toBeVisible();
	await page.getByRole('button', { name: 'Next detail slide', exact: true }).click();
	await expect(page.locator('.slide-count')).toHaveText('3 / 3');
	await expect(page).toHaveURL(/\/work\/elecode-iranzaminn$/);
});

test('interrupted detail transitions and browser history restore real artwork', async ({
	page
}) => {
	await page.goto('/work', { waitUntil: 'networkidle' });
	await page.getByRole('link', { name: 'View Details', exact: true }).click();
	await expect(page.locator('[data-art-ghost="project"]')).toHaveCount(1);
	await page.keyboard.press('Escape');
	await settled(page);
	await page.getByRole('button', { name: 'Next detail slide', exact: true }).click();
	await expect(page.locator('.slide-count')).toHaveText('2 / 2');
	await page.goBack();
	await expect(page).toHaveURL(/\/work$/);
	await settled(page);
	await page.goForward();
	await expect(page).toHaveURL(/\/work\/elecode-iranzaminn$/);
	await settled(page);
	await expect(page.locator('.slide-count')).toHaveText('1 / 2');
	await expect(page.locator('#main [data-shared-art="ornament"]')).toHaveCSS(
		'visibility',
		'visible'
	);
});
