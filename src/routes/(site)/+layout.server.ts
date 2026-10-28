import { api, convex } from '#lib/server/convex.js';
import type { LayoutServerLoad } from './$types';
export const load = async () =>
	({
		content: await convex().query(api.portfolio.content, {})
	}) satisfies ReturnType<LayoutServerLoad>;
