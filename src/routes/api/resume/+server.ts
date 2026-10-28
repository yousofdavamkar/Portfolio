import { json } from '@sveltejs/kit';
import { convex,api } from '#lib/server/convex.js';
export async function GET(){try{return json({url:await convex().query(api.portfolio.resume,{})},{headers:{'Cache-Control':'public, max-age=30, stale-while-revalidate=300'}});}catch(error){console.error('Resume query failed',String(error));throw error;}}
