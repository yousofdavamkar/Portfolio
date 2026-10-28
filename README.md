# Yosef's portfolio

A responsive SvelteKit portfolio and authenticated content studio, based on the portfolio Figma file inspected through Helium. Original portrait, project and contact artwork live in `static/images`.

## Stack

- Svelte 5, SvelteKit 3, TypeScript, Tailwind CSS 4 and shadcn-svelte.
- Zustand's vanilla store for browser preferences, bridged into Svelte subscriptions.
- Framework-independent `swr-store` for resume lookup and revalidation.
- Convex for published content, authenticated administration, uploads and a rate-limited contact inbox.
- Convex Auth password sessions held in HttpOnly cookies; public account registration is disabled.

## Run locally

```sh
npm ci
npx convex dev --configure
npx @convex-dev/auth --skip-git-check --web-server-url http://localhost:5173
node scripts/provision-dev.mjs
npx convex dev --once
npx convex run portfolio:seed '{}'
npm run dev
```

Choose your own Convex development project during configuration. Set `PUBLIC_CONVEX_URL` in `.env.local` to its cloud URL. The provisioning script sets the server-only contact secret in both Convex and `.env.local`, creates a development administrator, and saves the generated login there as `STUDIO_EMAIL` and `STUDIO_PASSWORD`. Never commit that file. The existing local environment is already configured.

Visit `/login` to access `/dashboard`. The studio manages profile text, skills, availability, resume PDFs, project drafts/publication and contact messages. Upload files first, then save the profile or project to attach them. There is no downloadable CV until one is uploaded. The seeded project description is an editable placeholder, not a completed case study.

## Checks and production

```sh
npm run check
npm run build
```

The Node adapter writes `build/`. Configure a production Convex deployment, its authentication keys and `SITE_URL`, a matching server-only `CONTACT_SECRET`, and `PUBLIC_CONVEX_URL` before building for production. Run `node build` behind HTTPS with the correct `ORIGIN`; production cookies are Secure. Provision the administrator privately for that deployment. Do not reuse development credentials.

## Design and accessibility

Layouts adapt from phone to desktop. Navigation uses a mobile sheet, and the studio uses accessible shadcn dialogs and tabs. Motion is reduced for reduced-motion preferences and keyboard input. Poppins is self-hosted. The original dark palette, yellow accent, speech bubbles and geometric portrait framing are retained; accent preferences are saved in the browser.

References: [original Figma](https://www.figma.com/design/Gis2vvOMoRcwh63BEEAmuW/portfolio), [shadcn-svelte](https://www.shadcn-svelte.com/docs), [SvelteKit](https://svelte.dev/docs/kit), [Convex](https://docs.convex.dev/). Emil design guidance informed interaction polish. Firecrawl was attempted, but its requests failed in this environment; no Firecrawl research results are represented as verified.

## Loading behavior

The [shadcn-svelte Skeleton](https://www.shadcn-svelte.com/docs/components/skeleton) component covers pending page navigation, resume lookup and project images. Navigation placeholders appear only after 150 ms and clear as soon as navigation settles. Image frames reserve space, handle cached loads and replace failed images with an accessible fallback. Reduced-motion preferences disable skeleton pulsing. Secondary artwork, the about portrait and dashboard thumbnails use native lazy loading and asynchronous decoding; the homepage portrait and featured project images remain eager. The Convex live-update client loads in a separate JavaScript chunk after hydration while server-rendered content remains available.

## Motion and page transitions

[Motion's official Svelte 5 integration](https://motion.dev/docs/svelte) powers the public portfolio with `animateView`, `animate`, `inView`, and `scroll`. The next-page arrows and navigation links use a vertical page sweep, staggered content, shared portrait/project artwork, and a chapter interlude with concentric rings and accent graphics. Browser back reverses the direction. A scroll-progress line and rotating orbit respond to normal document scrolling; scrolling is not hijacked.

The router retains its normal history, focus and scroll behavior. Data-loading skeletons clear before outgoing snapshots are captured. Reduced-motion preferences and keyboard navigation skip decorative transitions, and older browsers receive a simple entry animation. Observers and animations are cleaned up between pages. Authentication and dashboard routes do not use the public portfolio's cinematic transitions.
