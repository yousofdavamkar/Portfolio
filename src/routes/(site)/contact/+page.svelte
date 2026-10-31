<script lang="ts">
import {
	ArrowUpRight,
	BriefcaseBusiness,
	Check,
	Code2,
	LoaderCircle,
	Mail,
	Send
} from '@lucide/svelte';
import { getContext } from 'svelte';
import MediaImage from '#lib/components/MediaImage.svelte';
import { Button } from '#lib/components/ui/button/index.js';
import { Input } from '#lib/components/ui/input/index.js';
import { Textarea } from '#lib/components/ui/textarea/index.js';
import { PORTFOLIO, type PortfolioContext } from '#lib/state/portfolio.svelte.js';
import { enhance } from '$app/forms';
import type { PageProps } from './$types';

let { form }: PageProps = $props();
let pending = $state(false);
const portfolio = getContext<PortfolioContext>(PORTFOLIO);
const profile = $derived(portfolio.content.profile);
</script>
<svelte:head
	><title>Contact me — Yousof Davamkar</title>
	<meta
		name="description"
		content="Have a project in mind? Start a conversation with Yousof Davamkar."
	></svelte:head
>
<section class="contact-page content-page">
	<h1 data-reveal class="speech section-label speech-tail">
		Contact me <span aria-hidden="true">🙋🏻‍♂️</span>
	</h1>
	<div class="contact-grid">
		<div data-reveal class="contact-copy">
			<span class="eyebrow">GOOD THINGS START WITH A CONVERSATION</span>
			<h2>Let’s make<br>something <span class="accent-text">great.</span></h2>
			<p class="body-copy">
				A new idea, an interesting challenge, or just a hello.<br class="desktop-break">
				I’d love to hear from you.
			</p>
			<div class="social-links">
				{#if profile?.email}
					<a href={`mailto:${profile.email}`} aria-label="Email Yousof"><Mail /></a>
				{/if}
				{#if profile?.github}
					<a href={profile.github} target="_blank" rel="noreferrer" aria-label="GitHub"
						><Code2 /></a
					>
				{/if}
				{#if profile?.linkedin}
					<a href={profile.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn"
						><BriefcaseBusiness /></a
					>
				{/if}
			</div>
			<MediaImage
				class="contact-art"
				src="/images/contact-art.png"
				alt=""
				width={1277}
				height={1231}
				loading="lazy"
			/>
		</div>
		<div data-reveal class="contact-form-panel">
			{#if form?.success}
				<div class="success-message" role="status">
					<span class="success-icon"><Check size={28} /></span>
					<h2>Message received.</h2>
					<p>Thank you for reaching out. I’ll get back to you using the email you shared.</p>
					<Button variant="outline" class="pill-action" onclick={() => (form = null)}
						>Send another message <ArrowUpRight /></Button
					>
				</div>
			{:else}
				<form
					method="POST"
					use:enhance={() => {
						pending = true;
						return async ({ update }) => {
							await update();
							pending = false;
						};
					}}
				>
					<h3>Tell me what you’re thinking.</h3>
					<p class="form-description">Your next project could start right here.</p>
					<div class="field">
						<label for="name">Your name</label>
						<Input
							id="name"
							name="name"
							autocomplete="name"
							placeholder="How should I call you?"
							required
							maxlength={100}
							value={form?.name ?? ''}
						/>
					</div>
					<div class="field">
						<label for="email">Email address</label>
						<Input
							id="email"
							name="email"
							type="email"
							autocomplete="email"
							placeholder="you@example.com"
							required
							maxlength={254}
							value={form?.email ?? ''}
						/>
					</div>
					<div class="field">
						<label for="message">What do you have in mind?</label>
						<Textarea
							id="message"
							name="message"
							placeholder="A little about your idea, timeline, or question…"
							required
							minlength={10}
							maxlength={5000}
							rows={4}
							value={form?.message ?? ''}
						/>
					</div>
					<div class="honeypot" aria-hidden="true">
						<label for="website">Website</label>
						<input id="website" name="website" tabindex="-1" autocomplete="off">
					</div>
					{#if form?.error}
						<p class="form-error" role="alert">{form.error}</p>
					{/if}
					<Button type="submit" class="pill-action send-button" disabled={pending}
						>{#if pending}
							<LoaderCircle class="animate-spin" />
							Sending…
						{:else}
							Send message <Send size={18} />
						{/if}</Button
					>
					<p class="privacy-note">Your details are only used to reply to your message.</p>
				</form>
			{/if}
		</div>
	</div>
</section>

<style>
.contact-page {
	--contact-header-height: 120px;
	min-height: calc(100svh - var(--contact-header-height));
	display: flex;
	flex-direction: column;
	padding-block: clamp(12px, 2.5svh, 28px);
}
.section-label {
	flex: none;
	align-self: flex-start;
	margin-bottom: clamp(12px, 2svh, 24px);
}
.contact-grid {
	flex: 1;
	width: 100%;
	align-items: center;
}
.contact-copy {
	align-self: stretch;
	display: flex;
	flex-direction: column;
	justify-content: center;
}
.contact-copy h2 {
	font-size: clamp(32px, 5svh, 54px);
	margin: 16px 0;
}
.social-links {
	margin: 18px 0;
}
.contact-copy :global(.contact-art) {
	width: clamp(140px, calc(100svh - 530px), 330px);
	max-width: 75%;
	margin: 0 0 0 auto;
	flex: none;
}
.contact-form-panel {
	align-self: center;
	width: 100%;
	padding: clamp(16px, 2.5svh, 28px) clamp(20px, 2.4vw, 34px);
}
.form-description {
	margin: 6px 0 16px;
}
.field {
	gap: 6px;
	margin-bottom: 12px;
}
.field :global(input) {
	min-height: 44px;
	height: 44px;
	padding-block: 10px;
}
.field :global(textarea) {
	min-height: 80px;
	height: clamp(80px, 12svh, 110px);
}
.privacy-note {
	margin-top: 12px;
}
@media (max-width: 1100px) {
	.contact-page {
		--contact-header-height: 108px;
	}
}
@media (max-width: 767px) {
	.contact-page {
		--contact-header-height: 94px;
		padding: 12px 24px;
	}
	.section-label {
		font-size: 17px;
		padding: 8px 18px;
		margin-bottom: 12px;
	}
	.contact-grid {
		gap: 16px;
		justify-content: space-between;
	}
	.contact-copy h2 {
		font-size: 26px;
		letter-spacing: -0.8px;
		margin: 6px 0;
	}
	.contact-copy .body-copy {
		font-size: 12px;
		line-height: 1.6;
	}
	.social-links {
		margin: 8px 0 0;
	}
	.social-links a {
		width: 44px;
		height: 44px;
	}
	.contact-form-panel {
		padding: 16px;
	}
	.contact-form-panel h3 {
		font-size: 16px;
	}
	.form-description {
		font-size: 11px;
		margin-bottom: 12px;
	}
	.field :global(input),
	.field :global(textarea) {
		font-size: 16px;
	}
	.field :global(textarea) {
		height: 80px;
	}
	.contact-form-panel :global(.send-button) {
		min-height: 44px;
		padding-block: 10px;
	}
}
</style>
