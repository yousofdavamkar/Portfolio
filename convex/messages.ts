import { HOUR, RateLimiter } from '@convex-dev/rate-limiter';
import { paginationOptsValidator } from 'convex/server';
import { v } from 'convex/values';
import { components } from './_generated/api';
import { mutation, query } from './_generated/server';
import { requireAdmin } from './admin';
import { messageFields } from './schema';

const limits = new RateLimiter(components.rateLimiter, {
	contact: { kind: 'token bucket', rate: 5, period: HOUR, capacity: 5 },
	global: { kind: 'token bucket', rate: 100, period: HOUR, capacity: 100 }
});
export const send = mutation({
	args: {
		name: v.string(),
		email: v.string(),
		message: v.string(),
		key: v.string(),
		secret: v.string()
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		if (!process.env['CONTACT_SECRET'] || args.secret !== process.env['CONTACT_SECRET'])
			throw new Error('Invalid request.');
		if (
			!args.name.trim() ||
			args.name.length > 100 ||
			!/^\S+@\S+\.\S+$/.test(args.email) ||
			args.email.length > 254 ||
			args.message.trim().length < 10 ||
			args.message.length > 5000
		)
			throw new Error('Please check your contact details and message.');
		await limits.limit(ctx, 'contact', { key: args.key, throws: true });
		await limits.limit(ctx, 'global', { throws: true });
		await ctx.db.insert('messages', {
			name: args.name.trim(),
			email: args.email.trim(),
			message: args.message.trim(),
			status: 'new'
		});
		return null;
	}
});
export const inbox = query({
	args: { paginationOpts: paginationOptsValidator },
	returns: v.object({
		page: v.array(v.object({ _id: v.id('messages'), _creationTime: v.number(), ...messageFields })),
		isDone: v.boolean(),
		continueCursor: v.string()
	}),
	handler: async (ctx, args) => {
		await requireAdmin(ctx);
		return await ctx.db.query('messages').order('desc').paginate(args.paginationOpts);
	}
});
export const mark = mutation({
	args: { id: v.id('messages'), status: messageFields.status },
	returns: v.null(),
	handler: async (ctx, args) => {
		await requireAdmin(ctx);
		await ctx.db.patch(args.id, { status: args.status });
		return null;
	}
});
