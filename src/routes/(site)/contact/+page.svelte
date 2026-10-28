<script lang="ts">
 import {getContext} from 'svelte';
 import {enhance} from '$app/forms';
 import {ArrowUpRight,Mail,Code2,BriefcaseBusiness,Send,Check,LoaderCircle} from '@lucide/svelte';
 import {Button} from '#lib/components/ui/button/index.js';
 import {Input} from '#lib/components/ui/input/index.js';
 import {Textarea} from '#lib/components/ui/textarea/index.js';
 import {PORTFOLIO,type PortfolioContext} from '#lib/state/portfolio.svelte.js';
 let {form}=$props(); let pending=$state(false);
 const portfolio=getContext<PortfolioContext>(PORTFOLIO);const profile=$derived(portfolio.content.profile);
</script>
<svelte:head><title>Contact me — Yosef Davamkar</title><meta name="description" content="Have a project in mind? Start a conversation with Yosef Davamkar."/></svelte:head>
<section class="contact-page content-page">
 <h1 class="speech section-label speech-tail">Contact me <span aria-hidden="true">🙋🏻‍♂️</span></h1>
 <div class="contact-grid"><div class="contact-copy"><span class="eyebrow">GOOD THINGS START WITH A CONVERSATION</span><h2>Let’s make<br/>something <span class="accent-text">great.</span></h2><p class="body-copy">A new idea, an interesting challenge, or just a hello.<br class="desktop-break"/> I’d love to hear from you.</p>
  <div class="social-links">{#if profile?.email}<a href={`mailto:${profile.email}`} aria-label="Email Yosef"><Mail/></a>{/if}{#if profile?.github}<a href={profile.github} target="_blank" rel="noreferrer" aria-label="GitHub"><Code2/></a>{/if}{#if profile?.linkedin}<a href={profile.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn"><BriefcaseBusiness/></a>{/if}</div>
  <img class="contact-art" src="/images/contact-art.png" alt="" width="642" height="566" loading="lazy"/>
 </div>
 <div class="contact-form-panel">{#if form?.success}<div class="success-message" role="status"><span class="success-icon"><Check size={28}/></span><h2>Message received.</h2><p>Thank you for reaching out. I’ll get back to you using the email you shared.</p><Button variant="outline" class="pill-action" onclick={()=>form=null}>Send another message <ArrowUpRight/></Button></div>{:else}
 <form method="POST" use:enhance={()=>{pending=true;return async({update})=>{await update();pending=false;};}}>
  <h3>Tell me what you’re thinking.</h3><p class="form-description">Your next project could start right here.</p>
  <div class="field"><label for="name">Your name</label><Input id="name" name="name" autocomplete="name" placeholder="How should I call you?" required maxlength={100} value={form?.name??''}/></div>
  <div class="field"><label for="email">Email address</label><Input id="email" name="email" type="email" autocomplete="email" placeholder="you@example.com" required maxlength={254} value={form?.email??''}/></div>
  <div class="field"><label for="message">What do you have in mind?</label><Textarea id="message" name="message" placeholder="A little about your idea, timeline, or question…" required minlength={10} maxlength={5000} rows={4} value={form?.message??''}/></div>
  <div class="honeypot" aria-hidden="true"><label for="website">Website</label><input id="website" name="website" tabindex="-1" autocomplete="off"/></div>
  {#if form?.error}<p class="form-error" role="alert">{form.error}</p>{/if}
  <Button type="submit" class="pill-action send-button" disabled={pending}>{#if pending}<LoaderCircle class="animate-spin"/> Sending…{:else}Send message <Send size={18}/>{/if}</Button><p class="privacy-note">Your details are only used to reply to your message.</p>
 </form>{/if}</div></div>
</section>
