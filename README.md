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
