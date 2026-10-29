# Yousof's portfolio

A responsive SvelteKit portfolio and authenticated content studio, based on the portfolio Figma file inspected through Helium. Original portrait, project and contact artwork live in `static/images`.

## Stack

- Svelte 5, SvelteKit 3, TypeScript, Tailwind CSS 4 and shadcn-svelte.
- Zustand's vanilla store for project navigation, bridged into Svelte subscriptions.
- Framework-independent `swr-store` for resume lookup and revalidation.
- Convex for published content, authenticated administration, uploads and a rate-limited contact inbox.
- Convex Auth password sessions held in HttpOnly cookies; public account registration is disabled.

## Run locally

Install dependencies from the committed `bun.lock`; use `bun add` and `bun remove` to change them. The lockfile preserves the versions from the previous npm install. See [Bun’s lockfile migration](https://bun.sh/docs/pm/lockfile#automatic-lockfile-migration) and [runtime configuration](https://bun.sh/docs/runtime/bunfig#run-bun-auto-alias-node-to-bun).

```sh
bun install --frozen-lockfile
bunx --bun convex dev --configure
bunx --bun @convex-dev/auth --skip-git-check --web-server-url http://localhost:5173
bun run setup:dev
bunx --bun convex dev --once
bunx --bun convex run portfolio:seed '{}'
bun run dev
```

Choose your own Convex development project during configuration. Set `PUBLIC_CONVEX_URL` in `.env.local` to its cloud URL. The provisioning script sets the server-only contact secret in both Convex and `.env.local`, creates a development administrator, and saves the generated login there as `STUDIO_EMAIL` and `STUDIO_PASSWORD`. Never commit that file. The existing local environment is already configured.

Visit `/login` to access `/dashboard`. The studio manages profile text, skills, availability, resume PDFs, project drafts/publication and contact messages. Upload files first, then save the profile or project to attach them. There is no downloadable CV until one is uploaded. The seeded project description is an editable placeholder, not a completed case study.

## Checks and production

Use Bun **1.4.4**, pinned in `.bun-version` and `packageManager`. The local `bunfig.toml` makes Bun the runtime for package scripts and their Node-shebang tools. Development takes place on `develop`; `main` is reserved for production. Deployment automation will be configured when Vercel is connected.

```sh
bun run lint
bun run check
bun run build
```

`build` runs Biome and the TypeScript checks before Vite builds the application. TypeScript **7.0.2** is installed as `@typescript/native`; `bun run tsc` explicitly uses its native compiler, and `svelte-check --tsgo` uses it for Svelte diagnostics. The explicit compiler path prevents the transitive TypeScript 6 binary from taking precedence. TypeScript 6 remains installed under the `typescript` name for the JavaScript compiler API used by SvelteKit and Svelte's tooling. This follows [Svelte's supported TypeScript 7 setup](https://github.com/sveltejs/language-tools/blob/master/packages/svelte-check/README.md#typescript-7-supports).

`tsconfig.strict.json` applies to the frontend, maintained scripts, and Convex. It enables strict checking, exact optional properties, checked indexed access, explicit index-signature access, unused-code checks, return-path checks, and erasable TypeScript syntax. App-owned code is TypeScript, including `scripts/provision-dev.ts`; Convex-generated JavaScript and declarations remain generator-managed. Third-party declarations use `skipLibCheck`. Convex Auth's published optional-field types are re-inferred from its validators in `convex/schema.ts` without changing runtime tables or indexes.

Biome **2.6.3** handles formatting, import organization, and linting, with errors for explicit `any`, non-null assertions, and `@ts-ignore`. Use `bun run format`, `bun run format:check`, or `bun run lint:fix`. Generated files, build output, and the Bun lockfile are excluded. Full Svelte formatting and linting are [experimental in Biome](https://biomejs.dev/introduction/language-support/#html-super-languages-support); Svelte's compiler also checks templates and accessibility. The existing global stylesheet's specificity and `!important` overrides are retained, including reduced-motion overrides. The shared editor settings enable Biome formatting and fixes on save.

The existing SvelteKit Node-compatible adapter writes `build/`, which the start script runs with Bun. Configure a production Convex deployment, its authentication keys and `SITE_URL`, a matching server-only `CONTACT_SECRET`, and `PUBLIC_CONVEX_URL` before building for production. Run `bun run start` behind HTTPS with the correct `ORIGIN`; production cookies are Secure. Provision the administrator privately for that deployment. Do not reuse development credentials.

## Design and accessibility

Layouts adapt from phone to desktop. Navigation uses a mobile sheet, and the studio uses accessible shadcn dialogs and tabs. Motion is reduced for reduced-motion preferences and keyboard input. Poppins is self-hosted. The original dark palette, yellow accent, speech bubbles and geometric portrait framing are retained. The portfolio uses a fixed dark theme with a yellow accent; there is no theme picker or saved color preference.

References: [original Figma](https://www.figma.com/design/Gis2vvOMoRcwh63BEEAmuW/portfolio), [shadcn-svelte](https://www.shadcn-svelte.com/docs), [SvelteKit](https://svelte.dev/docs/kit), [Convex](https://docs.convex.dev/). Emil design guidance informed interaction polish. Firecrawl was attempted, but its requests failed in this environment; no Firecrawl research results are represented as verified.

## Loading behavior

The [shadcn-svelte Skeleton](https://www.shadcn-svelte.com/docs/components/skeleton) component covers pending page navigation, resume lookup and project images. Navigation placeholders appear only after 150 ms and clear as soon as navigation settles. Image frames reserve space, handle cached loads and replace failed images with an accessible fallback. Reduced-motion preferences disable skeleton pulsing. Secondary artwork, the about portrait and dashboard thumbnails use native lazy loading and asynchronous decoding; the homepage portrait and featured project images remain eager. The Convex live-update client loads in a separate JavaScript chunk after hydration while server-rendered content remains available.

## Motion and page transitions

[Motion's official Svelte 5 integration](https://motion.dev/docs/svelte) powers short, coordinated page transitions and scroll reveals. The current content fades and shifts out over 140 ms; the next page enters over 320 ms. The header remains live, browser back reverses direction, and a second navigation cancels the old animation. The page is animated as one surface, avoiding overlapping section snapshots and chapter overlays. A scroll-progress line and rotating orbit respond to normal document scrolling.

The router retains normal history, focus, and scroll behavior. Reduced-motion preferences and keyboard navigation skip decorative transitions. Animation cleanup restores the page's original styles, and a bounded timeout prevents an outgoing animation from blocking navigation. Scroll reveals start after the page transition finishes, without replaying an entrance animation. Authentication and dashboard routes do not animate.

Run `bun run test:e2e` for browser regressions covering rapid clicks during both transition phases, next-page links, history, keyboard cancellation, reduced motion, the removed theme picker, and mobile navigation. The tests start a local development server on port 5180 when one is not already running.
