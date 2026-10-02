# Majestic Meteorite

Static Astro site of dog profiles, deployed as a Cloudflare Worker.

Pages are prerendered at build time using `dogs.json` from the private Cloudflare R2 bucket `data` (object key `dogs.json`). The Cloudflare adapter keeps that prerender in Node so the build can read R2, then Wrangler publishes the static assets.

## Requirements

- Node.js 22.12.0 or newer (`package.json` `engines`)
- A Cloudflare account

## Commands

| Command           | Action                                               |
| ----------------- | ---------------------------------------------------- |
| `npm install`     | Install dependencies                                 |
| `npm run dev`     | Local dev server at `localhost:4321`                 |
| `npm run build`   | Production build                                     |
| `npm run preview` | Build, then preview the Worker locally with Wrangler |
| `npm run deploy`  | Build and deploy with Wrangler                       |

Log in once before the first deploy:

```sh
npx wrangler login
```

## Workers Builds

In the Cloudflare dashboard, import this repository and set:

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`

Use those two commands separately. `npm run deploy` also builds, so it would run the build twice in CI.

Workers Builds already provides a Node.js version new enough for Astro 7. If you override it, keep Node.js at 22.12.0 or newer.

Configure these build variables in Workers Builds. Mark the access key and secret as secrets:

- `CLOUDFLARE_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`

The R2 token needs read access to the `data` bucket. Local `npm run build` also requires these variables in the shell environment. Builds fail if the credentials or `data/dogs.json` object are unavailable; the local `public/dogs.json` file is not used as a fallback.

After the first deploy, set `site` in `astro.config.mjs` to the `workers.dev` URL or your custom domain. Canonical links are emitted only when `site` is set.

Unknown URLs serve `src/pages/404.astro` via `assets.not_found_handling: "404-page"` in `wrangler.jsonc`.
