<script lang="ts">
import {
	ArrowUp,
	ArrowUpRight,
	BriefcaseBusiness,
	Check,
	LoaderCircle,
	Mail,
	Send
} from '@lucide/svelte';
import { getContext } from 'svelte';
import MediaImage from '#lib/components/MediaImage.svelte';
import { Button } from '#lib/components/ui/button/index.js';
import * as Dialog from '#lib/components/ui/dialog/index.js';
import { Input } from '#lib/components/ui/input/index.js';
import { Textarea } from '#lib/components/ui/textarea/index.js';
import { PORTFOLIO, type PortfolioContext } from '#lib/state/portfolio.svelte.js';
import { enhance } from '$app/forms';
import type { PageProps } from './$types';

let { form }: PageProps = $props();
let pending = $state(false);
let contactOpen = $state(false);
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
<section class="contact-page">
	<div class="contact-backdrop" aria-hidden="true"></div>
	<h1 data-reveal class="speech contact-label speech-tail">
		Contact me <span aria-hidden="true">🙋🏻‍♂️</span>
	</h1>
	<div data-reveal class="contact-copy">
		<div class="contact-bio">
			{#if profile?.bio}
				<p>{profile.bio}</p>
			{/if}
		</div>
		<Dialog.Root bind:open={contactOpen}>
			<Dialog.Trigger class="contact-hire">Hire Me!</Dialog.Trigger>
			<Dialog.Content class="contact-dialog">
				{#if form?.success}
					<div class="success-message" role="status">
						<span class="success-icon"><Check size={28} /></span>
						<Dialog.Title class="contact-form-title">Message received.</Dialog.Title>
						<Dialog.Description
							>Thank you for reaching out. I’ll get back to you using the email you
							shared.</Dialog.Description
						>
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
								try {
									await update();
								} finally {
									pending = false;
								}
							};
						}}
					>
						<Dialog.Title class="contact-form-title">Tell me what you’re thinking.</Dialog.Title>
						<Dialog.Description class="form-description"
							>Your next project could start right here.</Dialog.Description
						>
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
			</Dialog.Content>
		</Dialog.Root>
		<nav class="social-links" aria-label="Social links">
			{#if profile?.linkedin}
				<a href={profile.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn"
					><BriefcaseBusiness /></a
				>
			{/if}
			{#if profile?.email}
				<a href={`mailto:${profile.email}`} aria-label="Email Yousof"><Mail /></a>
			{/if}
			{#if profile?.github}
				<a href={profile.github} target="_blank" rel="noreferrer" aria-label="GitHub"
					><img src="/images/github.svg" alt="GitHub" width="30" height="30"></a
				>
			{/if}
		</nav>
	</div>
	<div data-reveal class="contact-illustration" aria-hidden="true">
		<MediaImage
			class="contact-artwork"
			src="/images/contact-art.png"
			alt=""
			width={1277}
			height={1231}
			loading="eager"
		/>
	</div>
	<Button href="/" variant="outline" size="icon" class="section-next" aria-label="Back to home"
		><ArrowUp /></Button
	>
</section>

<style>
:global(.site-shell:has(.contact-page)) {
	background: linear-gradient(180deg, #101010, #303030);
}
.contact-page {
	--contact-header-height: 120px;
	position: relative;
	min-height: calc(100svh - var(--contact-header-height));
	padding: 1.666667cqw 0 9.722222cqw;
	isolation: isolate;
}
.contact-backdrop {
	position: absolute;
	z-index: -1;
	top: calc(-1 * var(--contact-header-height));
	right: 0;
	bottom: 0;
	width: 30.555556cqw;
	background: #252525;
}
.contact-label {
	margin: 0 0 4.444444cqw 6.458333cqw;
	padding: 1.111111cqw 2.222222cqw;
	font-size: 1.666667cqw;
	line-height: 1.5;
	border-radius: 3.472222cqw;
	position: relative;
	z-index: 2;
}
.contact-label span {
	margin-left: 0.347222cqw;
	font-size: 2.222222cqw;
	line-height: 1;
	vertical-align: middle;
}
.contact-copy {
	position: relative;
	z-index: 2;
	width: 43.055556cqw;
	margin-left: 5.555556cqw;
}
.contact-bio {
	min-height: 11.111111cqw;
	margin-bottom: 3.333333cqw;
	font-size: 1.111111cqw;
	line-height: 2;
	color: #f5f5f5;
}
.contact-bio p {
	margin: 0;
	white-space: pre-line;
}
.contact-page :global(.contact-hire) {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 3.888889cqw;
	min-height: 44px;
	padding: 0 1.666667cqw;
	border: 1px solid var(--primary);
	border-radius: 100px;
	color: var(--primary);
	background: transparent;
	font-size: 1.111111cqw;
	font-weight: 500;
	cursor: pointer;
	transition:
		background-color 160ms ease,
		transform 160ms var(--ease-out);
}
.contact-page :global(.contact-hire:active) {
	transform: scale(0.97);
}
.social-links {
	margin: 3.333333cqw 0 0;
	gap: 2.5cqw;
	flex-wrap: wrap;
}
.social-links a {
	width: 4.166667cqw;
	height: 4.166667cqw;
	min-width: 44px;
	min-height: 44px;
	background: var(--primary);
}
.social-links img,
.social-links :global(svg) {
	width: 2.083333cqw;
	height: 2.083333cqw;
}
.contact-illustration {
	position: absolute;
	z-index: 1;
	right: 0;
	top: 1.666667cqw;
	width: 40.972222cqw;
	pointer-events: none;
}
.contact-illustration :global(.contact-artwork) {
	width: 100%;
}
.contact-page :global(.section-next) {
	left: 5.555556cqw;
	bottom: 2.777778cqw;
	width: 3.888889cqw;
	height: 3.888889cqw;
	min-width: 44px;
	min-height: 44px;
	z-index: 3;
}
:global(.contact-dialog) {
	max-width: min(520px, calc(100vw - 32px));
	max-height: calc(100dvh - 32px);
	overflow-y: auto;
	overscroll-behavior: contain;
	padding: 32px;
	background: #242424;
	border: 1px solid #ffffff14;
	border-radius: 24px;
	animation-duration: 200ms;
	animation-timing-function: var(--ease-out);
}
:global(.contact-form-title) {
	font-size: 20px;
	line-height: 1.4;
	padding-right: 28px;
}
:global(.contact-dialog .form-description) {
	margin: 8px 0 24px;
	font-size: 12px;
}
:global(.contact-dialog input),
:global(.contact-dialog textarea) {
	font-size: 16px;
}
:global(.contact-dialog .send-button) {
	min-height: 44px;
}
@media (hover: hover) and (pointer: fine) {
	.contact-page :global(.contact-hire:hover) {
		background: #ffca0510;
	}
}
@media (min-width: 768px) and (max-width: 1100px) {
	.contact-page {
		--contact-header-height: 108px;
	}
	.contact-bio,
	.contact-page :global(.contact-hire) {
		font-size: 14px;
	}
	.contact-label {
		font-size: 20px;
	}
}
@media (min-width: 768px) and (min-aspect-ratio: 19 / 10) {
	.contact-page {
		padding-bottom: 100px;
	}
	.contact-label {
		margin-bottom: 32px;
	}
	.contact-bio {
		min-height: 80px;
		margin-bottom: 32px;
	}
	.social-links {
		margin-top: 32px;
	}
	.contact-illustration {
		width: min(40.972222cqw, calc((100svh - 170px) * 1.03737));
	}
}
@media (max-width: 767px) {
	.contact-page {
		--contact-header-height: 94px;
		display: flex;
		flex-direction: column;
		padding: 10px 24px 24px;
	}
	.contact-backdrop {
		top: 46%;
		width: 45%;
	}
	.contact-label {
		align-self: flex-start;
		margin: 0 0 32px 7px;
		padding: 8px 16px;
		font-size: 16px;
		line-height: 24px;
		border-radius: 50px;
	}
	.contact-label span {
		font-size: 20px;
		margin-left: 4px;
	}
	.contact-copy {
		width: 100%;
		margin: 0;
	}
	.contact-bio {
		min-height: 0;
		font-size: 14px;
		line-height: 2;
		margin-bottom: 24px;
	}
	.contact-page :global(.contact-hire) {
		height: 48px;
		padding: 0 24px;
		font-size: 14px;
	}
	.social-links {
		gap: 20px;
		margin-top: 24px;
	}
	.social-links a {
		width: 48px;
		height: 48px;
	}
	.social-links img,
	.social-links :global(svg) {
		width: 24px;
		height: 24px;
	}
	.contact-illustration {
		position: relative;
		top: auto;
		right: -24px;
		width: min(76cqw, 350px);
		margin: auto 0 0 auto;
		padding-top: 24px;
	}
	.contact-page :global(.section-next) {
		display: none;
	}
	:global(.contact-dialog) {
		padding: 24px;
	}
}
@media (prefers-reduced-motion: reduce) {
	:global(.contact-dialog) {
		animation: none;
	}
}
</style>
