# WEBSITE_CHANGELOG

## 2026-07-05

- Scope: initial local build for `blackimg.online` using the traffic-keyword homepage Skill.
- Inputs: brand keyword `black img`, traffic keyword `black img`, keyword `black img`, domain `blackimg.online`, reference site `https://www.black-image.com/`, and main function "black image generation from a sample with copy, texture, light angle, and brightness controls."
- Implemented: one handwritten `index.html` homepage with inline CSS and native JavaScript; no frontend framework, component library, package install, or build step.
- Implemented: central black image preview/editor, sample upload, beauty prompt builder, texture presets, light angle buttons, brightness slider, overlay copy, prompt copy, and PNG export.
- Implemented: homepage pricing/payment section with PayPal checkout CTA copy, same-domain `/api/checkout` path, and clear paid-preview boundary.
- Implemented: optional Cloudflare `worker.js` for `/api/runtime`, `/api/generate`, `/api/checkout`, and `/api/analytics`; secrets are environment-variable only.
- Implemented: Cloudflare Turnstile frontend widget using the public test key and Worker-side `TURNSTILE_SECRET_KEY` verification before paid/server-side actions.
- Verification: `node --check worker.js` passed; static HTML gate passed for one H1, canonical, Open Graph URL, JSON-LD, PayPal, Turnstile, `/api/generate`, `/api/checkout`, texture, light, brightness, overlay copy, and no frontend framework markers.
- Verification: Worker route checks passed for `/`, `/api/runtime`, `/api/generate` preview-only 503 when AI env vars are missing, `/api/checkout` PayPal configuration 503 when PayPal env vars are missing, and 404 handling.
- Verification: browser desktop 1280x720 and mobile 390x844 checks passed with no horizontal overflow after mobile style adjustment, no visible control text overflow, one H1, visible first-viewport tool area, and functional Generate preview click.
- Verification: local static checkout click returns a clear endpoint-unavailable message instead of a fake PayPal redirect.
- Production status: production deployment, DNS, HTTPS, search submission, and live PayPal checkout were not performed in this local homepage build.
- Follow-up: configure `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_ENV`, `TURNSTILE_SECRET_KEY`, `AI_IMAGE_ENDPOINT`, `AI_IMAGE_API_KEY`, and optional `ANALYTICS_DB` before production checkout or real AI generation.

- Scope: reran the `traffic-keyword-homepage-skill` final acceptance checklist and fixed the remaining content-depth gap.
- Implemented: added a `Settings guide` section with practical guidance for sample usage, texture selection, light direction, copy-safe composition, export, and paid server-side generation boundaries.
- Implemented: added the Guide anchor to navigation and changed internal-facing UI labels from `AI endpoint` / `Turnstile token` to `Server AI` / `Protection check`.
- Verification: final gate script passed with 1 H1, 1361 visible words, keyword coverage for `black img` / `black image`, canonical, OG URL, FAQ JSON-LD, one-file rule, PayPal, Turnstile, `/api/generate`, `/api/checkout`, upload, texture, light, brightness, overlay copy, loading/success/error states, Guide anchor, no framework/provider residue, and no public reference-domain copy.
- Browser verification: desktop 1280x720 and mobile 390x844 checks passed with no horizontal overflow, no visible control text overflow, visible first-viewport tool area, working Generate preview click, and clear checkout-unavailable state in local static preview.
- Process lesson: the first version passed most functional gates but missed the Skill's content-depth target; prevention is to include a word-count/content-utility gate in the first local acceptance script, not only metadata and interaction markers.

- Scope: updated pricing per Owner input to four tiers: Free, Starter, Pro, and Scale.
- Implemented: Free includes 6 black img generations, 3 downloads, copy input, texture, light angle, brightness, and free templates.
- Implemented: Starter is the default selected paid tier at $9 monthly or $54 yearly with 50% yearly discount, 30 generations, 30 downloads, all templates, and no custom prompt input.
- Implemented: Pro is $49 monthly or $294 yearly with 50% yearly discount, 500 generations, 500 downloads, all templates, and custom prompt input.
- Implemented: Scale is $89 monthly or $534 yearly with 50% yearly discount, 5000 generations, 5000 downloads, all templates, and custom prompt input.
- Implemented: removed billing lifecycle wording from visible pricing copy and Worker public plan payload; Free plan no longer attempts PayPal checkout.
- Verification: pricing gate passed with 1487 visible words, four plan cards, Starter default, yearly 50% off, no old paid-tier values, no billing lifecycle wording, PayPal/Turnstile markers, SEO markers, and responsive 2-column/1-column pricing layout.
- Verification: Worker runtime exposes `free`, `starter`, `pro`, and `scale`; `/api/checkout` returns 400 for Free and 503 configuration status for paid checkout when PayPal env vars are missing.

- Scope: publication attempt using the open-source-code website build Skill release checks.
- Implemented: added `public/` assets for Cloudflare Worker Assets, `robots.txt`, `sitemap.xml`, `llms.txt`, `public/product.json`, README, `.gitignore`, and machine-readable `reports/*.json` evidence sidecars.
- Implemented: added Worker routes for `/robots.txt`, `/sitemap.xml`, and `/llms.txt`.
- Fixed: changed Worker asset lookup for the homepage from `/index.html` to `/` to avoid a Cloudflare Assets 307 loop.
- GitHub: created public repository `clauxel/blackimg-online`; local commit and push are part of the current release flow.
- Cloudflare: `npx wrangler deploy` succeeded with Worker version `fa7dff30-59ff-4656-8566-f03c94f2959d`, workers.dev trigger, `blackimg.online/*`, and `www.blackimg.online/*`.
- DNS: created Cloudflare zone, apex/www proxied A records, Worker routes, full SSL, Always Use HTTPS, and automatic HTTPS rewrites; SpaceShip API accepted nameservers `archer.ns.cloudflare.com` and `sydney.ns.cloudflare.com`.
- Live preview verification: workers.dev homepage returns 200; `/api/runtime`, `/robots.txt`, `/sitemap.xml`, `/api/checkout`, and `/missing` were checked.
- Production blocker: public validating DNS still returns DS key tag `34646` and `DNSKEY Missing no SEP matching the DS`; checking-disabled DNS still shows cached SpaceShip launch nameservers during propagation. Apex HTTPS is not yet accepted as production live.
- Provider blockers: PayPal credentials, Turnstile secret, AI image provider, and optional D1 analytics remain unconfigured, so payment, paid AI generation, and data loop are not production complete.
