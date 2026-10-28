import { getAuthUserId, createAccount } from '@convex-dev/auth/server';
import { internalAction, internalMutation, query, type QueryCtx, type MutationCtx } from './_generated/server';
import { internal } from './_generated/api';
import { v } from 'convex/values';

export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId || !await ctx.db.query('admins').withIndex('by_userId', q => q.eq('userId', userId)).unique()) {
    throw new Error('Administrator access required.');
  }
  return userId;
}
export const viewer = query({ args: {}, returns: v.union(v.object({ email: v.string() }), v.null()), handler: async ctx => {
  const id = await getAuthUserId(ctx);
  if (!id || !await ctx.db.query('admins').withIndex('by_userId', q => q.eq('userId', id)).unique()) return null;
  return { email: (await ctx.db.get(id))?.email ?? '' };
}});
export const grant = internalMutation({ args: { userId: v.id('users') }, returns: v.null(), handler: async (ctx, { userId }) => {
  if (!await ctx.db.query('admins').withIndex('by_userId', q => q.eq('userId', userId)).unique()) await ctx.db.insert('admins', { userId });
  return null;
}});
export const provision = internalAction({ args: { email: v.string(), password: v.string() }, returns: v.null(), handler: async (ctx, args) => {
  if (args.password.length < 16) throw new Error('Use at least 16 characters.');
  const { user } = await createAccount(ctx, { provider: 'password', account: { id: args.email.toLowerCase(), secret: args.password }, profile: { email: args.email.toLowerCase() } });
  await ctx.runMutation(internal.admin.grant, { userId: user._id });
  return null;
}});
