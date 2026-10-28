import { redirect } from '@sveltejs/kit';
import { adminClient, api, clearTokens } from '#lib/server/convex.js';
import type { RequestHandler } from './$types';
export async function POST(event: Parameters<RequestHandler>[0]) {
	const { client } = await adminClient(event);
	await client.action(api.auth.signOut, {});
	clearTokens(event);
	redirect(303, '/login');
}
