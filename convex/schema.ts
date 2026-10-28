import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import { authTables } from '@convex-dev/auth/server';

export const profileFields = {
  name: v.string(), role: v.string(), bio: v.string(), journey: v.string(),
  experience: v.string(), email: v.string(), github: v.string(), linkedin: v.string(),
  skills: v.array(v.string()), available: v.boolean(),
  resumeId: v.optional(v.id('_storage')),
};
export const projectFields = {
  title: v.string(), slug: v.string(), summary: v.string(), body: v.string(),
  category: v.string(), stack: v.array(v.string()), image: v.string(),
  imageId: v.optional(v.id('_storage')), url: v.string(), published: v.boolean(), order: v.number(),
};
export const messageFields = {
  name: v.string(), email: v.string(), message: v.string(),
  status: v.union(v.literal('new'), v.literal('read'), v.literal('archived')),
};
export default defineSchema({
  ...authTables,
  admins: defineTable({ userId: v.id('users') }).index('by_userId', ['userId']),
  profiles: defineTable({ key: v.literal('main'), ...profileFields }).index('by_key', ['key']),
  projects: defineTable(projectFields).index('by_slug', ['slug']).index('by_published_and_order', ['published', 'order']).index('by_order', ['order']),
  messages: defineTable(messageFields).index('by_status', ['status']),
});
