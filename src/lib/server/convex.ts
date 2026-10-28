import { ConvexHttpClient } from 'convex/browser';
import { PUBLIC_CONVEX_URL } from '$app/env/public';
import { api } from '../../../convex/_generated/api';
import { redirect, type RequestEvent } from '@sveltejs/kit';
import { dev } from '$app/env';

export function convex() {
  if (!PUBLIC_CONVEX_URL) throw new Error('PUBLIC_CONVEX_URL is not configured.');
  return new ConvexHttpClient(PUBLIC_CONVEX_URL);
}
export function setTokens(event: RequestEvent, tokens: {token:string;refreshToken:string}) {
  const options={path:'/',httpOnly:true,secure:!dev,sameSite:'lax' as const};
  event.cookies.set('portfolio_access',tokens.token,{...options,maxAge:3600});
  event.cookies.set('portfolio_refresh',tokens.refreshToken,{...options,maxAge:60*60*24*30});
}
export function clearTokens(event: RequestEvent) {
  event.cookies.delete('portfolio_access',{path:'/'});
  event.cookies.delete('portfolio_refresh',{path:'/'});
}
export async function adminClient(event: RequestEvent) {
  const client=convex();
  const token=event.cookies.get('portfolio_access');
  if(token) client.setAuth(token);
  let viewer=null;
  try {viewer=await client.query(api.admin.viewer,{});} catch { /* Try the HttpOnly refresh token below. */ }
  if(!viewer) {
    const refreshToken=event.cookies.get('portfolio_refresh');
    if(refreshToken) {
      try {
        const result=await convex().action(api.auth.signIn,{refreshToken});
        if(result.tokens) { setTokens(event,result.tokens); client.setAuth(result.tokens.token); viewer=await client.query(api.admin.viewer,{}); }
      } catch { clearTokens(event); }
    }
  }
  if(!viewer) redirect(303,'/login');
  return {client,viewer};
}
export { api };
