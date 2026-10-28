import { Password } from '@convex-dev/auth/providers/Password';
import { convexAuth } from '@convex-dev/auth/server';

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
	providers: [
		Password({
			profile(params) {
				// Accounts are provisioned through an internal admin action, never public signup.
				if (params['flow'] !== 'signIn') throw new Error('Public registration is disabled.');
				if (typeof params['email'] !== 'string') throw new Error('Email is required.');
				return { email: params['email'].trim().toLowerCase() };
			}
		})
	]
});
