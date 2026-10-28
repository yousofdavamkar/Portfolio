<script lang="ts">
 import {onMount,setContext,untrack} from 'svelte';
 import {PUBLIC_CONVEX_URL} from '$app/env/public';
 import {api} from '../../../convex/_generated/api';
 import {PORTFOLIO,type PortfolioContext} from '#lib/state/portfolio.svelte.js';
 import {createPreferences} from '#lib/state/preferences.js';
 import SceneGraphics from '#lib/components/SceneGraphics.svelte';
 import Header from '#lib/components/Header.svelte';
 let {data,children}=$props();
 let content=$state(untrack(()=>data.content));
 let connected=$state(true);
 const preferences=createPreferences();
 setContext<PortfolioContext>(PORTFOLIO,{get content(){return content;}});
 setContext('preferences',preferences);
 onMount(()=>{
  try{const saved=localStorage.getItem('portfolio-accent');if(saved&&['yellow','red','purple','teal'].includes(saved))preferences.setAccent(saved);}catch{}
  const unsubPrefs=preferences.subscribe(state=>{document.documentElement.dataset.accent=state.accent;try{localStorage.setItem('portfolio-accent',state.accent);}catch{}});
  let disposed=false;
  let disconnect=()=>{};
  // SSR content stays usable while the live-update bundle loads separately.
  void import('convex/browser').then(({ConvexClient})=>{
   if(disposed)return;
   const client=new ConvexClient(PUBLIC_CONVEX_URL);
   const unsub=client.onUpdate(api.portfolio.content,{},value=>{content=value;connected=true;},()=>{connected=false;});
   disconnect=()=>{unsub();void client.close();};
  }).catch(()=>{if(!disposed)connected=false;});
  return ()=>{disposed=true;disconnect();unsubPrefs();};
 });
</script>
<a class="skip-link" href="#main">Skip to content</a>
<div class="site-shell">
 <SceneGraphics/>
 <Header {preferences}/>
 <main id="main">{@render children()}</main>
 {#if !connected}<p class="connection-note" role="status">Showing the last available version. Reconnecting…</p>{/if}
</div>
