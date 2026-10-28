<script lang="ts">
 import {enhance} from '$app/forms';
 import {ArrowLeft,ArrowRight,LockKeyhole,LoaderCircle} from '@lucide/svelte';
 import {Button} from '#lib/components/ui/button/index.js';
 import {Input} from '#lib/components/ui/input/index.js';
 let {form}=$props();let pending=$state(false);
</script>
<svelte:head><title>Studio sign in — Yousof Davamkar</title><meta name="robots" content="noindex,nofollow"/></svelte:head>
<main class="login-page"><a href="/" class="login-back"><ArrowLeft size={18}/> Back to portfolio</a><div class="login-card"><div class="login-mark"><LockKeyhole size={25}/></div><span class="eyebrow">PORTFOLIO STUDIO</span><h1>Welcome back.</h1><p class="body-copy">Your work. Your words. Your little corner of the internet.</p><form method="POST" use:enhance={()=>{pending=true;return async({update})=>{await update();pending=false;};}}><div class="field"><label for="email">Email address</label><Input id="email" name="email" type="email" autocomplete="username" required/></div><div class="field"><label for="password">Password</label><Input id="password" name="password" type="password" autocomplete="current-password" required/></div>{#if form?.error}<p class="form-error" role="alert">{form.error}</p>{/if}<Button type="submit" class="pill-action" disabled={pending}>{#if pending}<LoaderCircle class="animate-spin"/> Signing in…{:else}Open studio <ArrowRight size={18}/>{/if}</Button></form><p class="privacy-note">Private access for the portfolio owner.</p></div></main>
