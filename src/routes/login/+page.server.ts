import { fail, redirect } from '@sveltejs/kit';
import { api, clearTokens, convex, setTokens } from '#lib/server/convex.js';
import type { Actions } from './$types';
export const actions = {
	default: async (event) => {
		const form = await event.request.formData();
		const email = String(form.get('email') ?? '')
				.trim()
				.toLowerCase(),
			password = String(form.get('password') ?? '');
		if (!email || !password || email.length > 254 || password.length > 1024)
			return fail(400, { error: 'Enter your email and password.' });
		try {
			const client = convex();
			const result = await client.action(api.auth.signIn, {
				provider: 'password',
				params: { email, password, flow: 'signIn' }
			});
			if (!result.tokens) return fail(401, { error: 'Email or password is incorrect.' });
			client.setAuth(result.tokens.token);
			if (!(await client.query(api.admin.viewer, {}))) {
				await client.action(api.auth.signOut, {});
				clearTokens(event);
				return fail(403, { error: 'Administrator access is required.' });
			}
			setTokens(event, result.tokens);
		} catch {
			return fail(401, { error: 'Email or password is incorrect. Please try again.' });
		}
		redirect(303, '/dashboard');
	}
} satisfies Actions;
