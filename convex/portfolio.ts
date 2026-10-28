import { v } from 'convex/values';
import { query, mutation, internalMutation } from './_generated/server';
import { profileFields, projectFields } from './schema';
import { requireAdmin } from './admin';

const profileDoc = v.object({ _id: v.id('profiles'), _creationTime: v.number(), key: v.literal('main'), ...profileFields });
const projectDoc = v.object({ _id: v.id('projects'), _creationTime: v.number(), ...projectFields });
export const content = query({ args: {}, returns: v.object({ profile: v.union(v.object({ ...profileFields, resumeUrl: v.union(v.string(), v.null()) }), v.null()), projects: v.array(v.object({ ...projectFields, _id: v.id('projects') })) }), handler: async ctx => {
  const profile = await ctx.db.query('profiles').withIndex('by_key', q => q.eq('key','main')).unique();
  const rows = await ctx.db.query('projects').withIndex('by_published_and_order', q => q.eq('published', true)).take(100);
  return {
    profile: profile ? (({ _id, _creationTime, key, ...rest }) => ({ ...rest, resumeUrl: null as string | null }))(profile) : null,
    projects: await Promise.all(rows.map(async ({ _creationTime, ...p }) => ({ ...p, image: p.imageId ? await ctx.storage.getUrl(p.imageId) ?? p.image : p.image }))),
  };
}});
export const resume = query({args: {}, returns: v.union(v.string(),v.null()), handler: async ctx => {
  const profile = await ctx.db.query('profiles').withIndex('by_key', q=>q.eq('key','main')).unique();
  return profile?.resumeId ? await ctx.storage.getUrl(profile.resumeId) : null;
}});
export const dashboard = query({ args: {}, returns: v.object({ profile: v.union(profileDoc,v.null()), projects: v.array(projectDoc) }), handler: async ctx => {
  await requireAdmin(ctx);
  return { profile: await ctx.db.query('profiles').withIndex('by_key',q=>q.eq('key','main')).unique(), projects: await ctx.db.query('projects').withIndex('by_order').take(100) };
}});
function bounded(value: string, max: number, label: string) { if (value.length > max) throw new Error(`${label} is too long.`); }
function safeUrl(url: string) { if (url && !/^https:\/\//.test(url)) throw new Error('Use an https:// URL.'); }
export const saveProfile = mutation({ args: profileFields, returns: v.null(), handler: async (ctx, args) => {
  await requireAdmin(ctx);
  bounded(args.name,100,'Name'); bounded(args.role,150,'Role'); bounded(args.bio,3000,'Bio'); bounded(args.journey,6000,'Journey');
  if (args.skills.length > 40 || args.skills.some(s=>s.length>50)) throw new Error('Use up to 40 short skills.');
  safeUrl(args.github); safeUrl(args.linkedin);
  const row=await ctx.db.query('profiles').withIndex('by_key',q=>q.eq('key','main')).unique();
  if(row) await ctx.db.patch(row._id,{...args,resumeId:args.resumeId}); else await ctx.db.insert('profiles',{key:'main',...args});
  return null;
}});
export const saveProject = mutation({ args: { id: v.optional(v.id('projects')), ...projectFields }, returns: v.id('projects'), handler: async (ctx, {id,...args}) => {
  await requireAdmin(ctx);
  if (!args.title.trim() || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(args.slug)) throw new Error('A title and lowercase URL slug are required.');
  bounded(args.title,150,'Title'); bounded(args.summary,600,'Summary'); bounded(args.body,20000,'Case study'); safeUrl(args.url);
  if (args.image && !args.image.startsWith('/images/')) safeUrl(args.image);
  if (!Number.isFinite(args.order) || args.stack.length > 30) throw new Error('Invalid project settings.');
  const duplicate=await ctx.db.query('projects').withIndex('by_slug',q=>q.eq('slug',args.slug)).unique();
  if(duplicate && duplicate._id!==id) throw new Error('That slug is already in use.');
  if(id) { await ctx.db.patch(id,{...args,imageId:args.imageId}); return id; }
  if((await ctx.db.query('projects').withIndex('by_order').take(100)).length>=100) throw new Error('Project limit reached.');
  return await ctx.db.insert('projects',args);
}});
export const uploadUrl = mutation({args:{},returns:v.string(),handler:async ctx=>{await requireAdmin(ctx);return await ctx.storage.generateUploadUrl();}});
export const seed = internalMutation({args:{},returns:v.null(),handler:async ctx=>{
  if(!await ctx.db.query('profiles').withIndex('by_key',q=>q.eq('key','main')).unique()) await ctx.db.insert('profiles',{key:'main',name:'Yosef Davamkar',role:'Fullstack web developer',bio:'I share content about UI/UX design and my experiences from work.',journey:'Designing interfaces. Building experiences. Always learning.',experience:'3+',email:'',github:'https://github.com/yousofdavamkar',linkedin:'',skills:['SvelteKit','TypeScript','UI/UX design','Convex'],available:true});
  if(!await ctx.db.query('projects').withIndex('by_order').first()) await ctx.db.insert('projects',{title:'Elecode IranZaminn',slug:'elecode-iranzaminn',summary:'A closer look at the web experience featured in my portfolio.',body:'This project is featured in the original portfolio design. More details will be added here.',category:'Web development',stack:[],image:'/images/featured-project.png',url:'',published:true,order:0});
  return null;
}});
