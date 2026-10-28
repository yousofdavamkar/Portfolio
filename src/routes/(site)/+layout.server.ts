import { convex, api } from '#lib/server/convex.js';
export const load=async()=>({content:await convex().query(api.portfolio.content,{})});
