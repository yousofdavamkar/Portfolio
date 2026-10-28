import {redirect} from '@sveltejs/kit';
import {adminClient,api,clearTokens} from '#lib/server/convex.js';
export async function POST(event){const {client}=await adminClient(event);await client.action(api.auth.signOut,{});clearTokens(event);redirect(303,'/login');}
