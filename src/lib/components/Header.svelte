<script lang="ts">
 import {page} from '$app/state';
 import {Menu,X,ArrowUpRight,Check} from '@lucide/svelte';
 import {Button} from '#lib/components/ui/button/index.js';
 import * as Sheet from '#lib/components/ui/sheet/index.js';
 import * as Dialog from '#lib/components/ui/dialog/index.js';
 let {preferences}=$props();
 let open=$state(false),collapsed=$state(false),colors=$state(false);
 const links=[{href:'/',label:'Home'},{href:'/about',label:'About me'},{href:'/work',label:'Portfolio'},{href:'/contact',label:'Contact me'}];
 const accents=[{id:'yellow',name:'Sunshine',color:'#ffca05'},{id:'red',name:'Coral',color:'#ff7676'},{id:'purple',name:'Lilac',color:'#b397ff'},{id:'teal',name:'Mint',color:'#5edbc5'}];
</script>
<header class="site-header">
 <div class="desktop-navigation">
  <Button variant="secondary" size="icon" class="round-button" onclick={()=>collapsed=!collapsed} aria-label={collapsed?'Show navigation':'Collapse navigation'} aria-expanded={!collapsed}>{#if collapsed}<Menu size={22}/>{:else}<X size={22}/>{/if}</Button>
  {#if !collapsed}<nav aria-label="Main navigation" class="nav-pill">{#each links as link}<a href={link.href} aria-current={(link.href==='/'?page.url.pathname==='/':page.url.pathname.startsWith(link.href))?'page':undefined}>{link.label}</a>{/each}</nav>{/if}
 </div>
 <div class="mobile-navigation">
  <Sheet.Root bind:open>
   <Sheet.Trigger class="round-button mobile-menu" aria-label="Open navigation"><Menu size={23}/></Sheet.Trigger>
   <Sheet.Content side="left" class="mobile-sheet">
    <Sheet.Header><Sheet.Title>Yosef Davamkar<span class="accent-text">.</span></Sheet.Title><Sheet.Description>Fullstack web developer</Sheet.Description></Sheet.Header>
    <nav aria-label="Mobile navigation">{#each links as link}<a href={link.href} onclick={()=>open=false} aria-current={page.url.pathname===link.href?'page':undefined}>{link.label}<ArrowUpRight size={21}/></a>{/each}</nav>
    <p class="sheet-note">Thoughtful design.<br/>Considered code.</p>
   </Sheet.Content>
  </Sheet.Root>
 </div>
 <Dialog.Root bind:open={colors}>
  <Dialog.Trigger class="round-button accent-trigger" aria-label="Choose accent color"><span></span></Dialog.Trigger>
  <Dialog.Content class="color-dialog"><Dialog.Header><Dialog.Title>A little change of mood.</Dialog.Title><Dialog.Description>Pick an accent that feels like you.</Dialog.Description></Dialog.Header>
   <div class="color-options" role="radiogroup" aria-label="Accent color">{#each accents as accent}<button type="button" role="radio" aria-checked={$preferences.accent===accent.id} style={`--swatch:${accent.color}`} onclick={()=>{preferences.setAccent(accent.id);colors=false;}}><span>{#if $preferences.accent===accent.id}<Check size={18}/>{/if}</span>{accent.name}</button>{/each}</div>
  </Dialog.Content>
 </Dialog.Root>
</header>
