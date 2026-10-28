import { authTables } from '@convex-dev/auth/server';
import { defineSchema, defineTable, type TableDefinition } from 'convex/server';
import { type ObjectType, type VObject, v } from 'convex/values';

// Auth's published declarations predate exactOptionalPropertyTypes. Re-infer
// optional fields from their validators; runtime tables and indexes stay intact.
type ExactAuthTable<Table> =
	Table extends TableDefinition<
		infer Validator,
		infer Indexes,
		infer SearchIndexes,
		infer VectorIndexes
	>
		? Validator extends VObject<infer _Value, infer Fields>
			? TableDefinition<VObject<ObjectType<Fields>, Fields>, Indexes, SearchIndexes, VectorIndexes>
			: never
		: never;
const exactAuthTables = authTables as {
	[Name in keyof typeof authTables]: ExactAuthTable<(typeof authTables)[Name]>;
};

export const profileFields = {
	name: v.string(),
	role: v.string(),
	bio: v.string(),
	journey: v.string(),
	experience: v.string(),
	email: v.string(),
	github: v.string(),
	linkedin: v.string(),
	skills: v.array(v.string()),
	available: v.boolean(),
	resumeId: v.optional(v.id('_storage'))
};
export const projectFields = {
	title: v.string(),
	slug: v.string(),
	summary: v.string(),
	body: v.string(),
	category: v.string(),
	stack: v.array(v.string()),
	image: v.string(),
	imageId: v.optional(v.id('_storage')),
	url: v.string(),
	published: v.boolean(),
	order: v.number()
};
export const messageFields = {
	name: v.string(),
	email: v.string(),
	message: v.string(),
	status: v.union(v.literal('new'), v.literal('read'), v.literal('archived'))
};
export default defineSchema({
	...exactAuthTables,
	admins: defineTable({ userId: v.id('users') }).index('by_userId', ['userId']),
	profiles: defineTable({ key: v.literal('main'), ...profileFields }).index('by_key', ['key']),
	projects: defineTable(projectFields)
		.index('by_slug', ['slug'])
		.index('by_published_and_order', ['published', 'order'])
		.index('by_order', ['order']),
	messages: defineTable(messageFields).index('by_status', ['status'])
});
