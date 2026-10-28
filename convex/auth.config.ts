import type { AuthConfig } from 'convex/server';

const domain = process.env['CONVEX_SITE_URL'];
if (!domain) throw new Error('CONVEX_SITE_URL is required for authentication.');

export default {
	providers: [
		{
			domain,
			applicationID: 'convex'
		}
	]
} satisfies AuthConfig;
