import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: './tests',
	fullyParallel: true,
	workers: 2,
	reporter: 'list',
	outputDir: '.artifacts/playwright',
	use: {
		baseURL: 'http://127.0.0.1:5180',
		viewport: { width: 1280, height: 900 },
		screenshot: 'only-on-failure',
		trace: 'retain-on-failure'
	},
	webServer: {
		command: 'npm run dev -- --host 127.0.0.1 --port 5180 --strictPort',
		url: 'http://127.0.0.1:5180',
		reuseExistingServer: !process.env['CI']
	}
});
