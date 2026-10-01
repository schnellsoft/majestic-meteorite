// @ts-check
import { defineConfig } from "astro/config";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  output: "static",
  // Set `site` to the workers.dev or custom domain so canonical URLs are emitted.
  session: false,
  adapter: cloudflare({
    prerenderEnvironment: "node",
    imageService: "compile",
  }),
});
