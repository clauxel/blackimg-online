# WEBSITE_CHANGELOG

## 2026-07-05

- First screen spacing: removed the forced full-screen vertical centering from the hero editor area and tightened the top/bottom padding so the fixed navigation, headline, and studio sit closer together with less empty gray space.
- Verification: synced the homepage HTML and rechecked the local first-screen spacing markers before deployment.

- Navigation: changed the top navigation from sticky to fixed, added page offset/anchor scroll margin, and gave the bar/link/icon a restrained motion effect so it feels fixed but alive.
- Verification: synced `index.html` to `public/index.html` and rechecked local HTML/Worker basics before release.
- Release prep: uploaded the `THOUSANDENGINE_API_KEY` Worker secret and corrected product metadata to show the current production blocker precisely: PayPal and ThousandEngine are configured, while `TURNSTILE_SECRET_KEY` is still missing.
- Production fix: added an explicit Worker route for `/product.json` and pointed the Open Graph image at the existing `/premium-black-img.jpg` asset so production metadata no longer references missing resources.

- Inner-page Skill audit: checked the homepage against the `内页建设 Skill` gates for keyword focus, On Page SEO, text-noise, technical SEO/GEO, and internal links.
- GEO: added a visible `Source and update` row in the Method and limits section and `dateModified` schema metadata so the page exposes source/check scope and review date in the HTML, not only in sitemap/llms files.
- Verification: reran local HTTP, word-count/frequency, metadata, schema, and sync checks after the audit fix.

- Prompt UX: changed the first-screen `Image direction` textarea to an empty `Custom prompt` field so users write their own generation prompt.
- Worker: added `customPrompt` as the main generation request field and kept `userPrompt` / `prompt` as compatibility fallbacks. The backend now combines the user-written custom prompt with the fixed black-image beauty prompt before sending the request to the image provider.
- Pricing metadata: aligned plan descriptions so custom prompt input is no longer described as locked while the public form accepts user-written prompts.
- Verification: local checks confirm the old `Image direction` label and default textarea prompt are gone, the API request sends `customPrompt`, and Worker prompt construction preserves the custom prompt while appending the backend beauty layer.

- Layout: increased the first-screen headline-to-studio spacing and raised the studio/canvas height so the main function area feels roomier while staying focused on the editor.
- Verification: synchronized `index.html` to `public/index.html` and reran local static checks after the spacing/height adjustment.

- Local preview: fixed uploaded-image layering so the sample is drawn last as a larger foreground subject with opacity, shadow, rim light, and border; the black texture and lighting now render behind it.
- Verification: source-order check confirms `drawTexture`, `drawLight`, then `drawSample`, so the uploaded image is no longer buried under the black texture/background layers.

- Prompt: added a default image-fusion prompt that treats the uploaded image as the foreground subject and the selected black texture as the premium black background.
- Prompt: strengthened the Worker-side prompt layer to preserve foreground identity/details, blend into a black-dominant textured background, and push the fused result toward beautiful, luxurious, polished, premium editorial aesthetics.
- Verification: direct Worker prompt inspection confirms foreground/black-texture/premium-beautiful markers, and browser verification confirms the default prompt appears in the input.

- AI model: checked the ThousandEngine model list and changed the default image/edit model from `gpt-image-1` to `gpt-image-2`, because ThousandEngine describes `gpt-image-2` as its most advanced image generation/editing model with high-quality image input support.
- AI model: removed the legacy `AI_IMAGE_MODEL` fallback for ThousandEngine image generation so old environment variables cannot silently downgrade the model.
- Verification: local runtime simulation reports `aiProvider: thousandengine`, `aiConfigured: true`, and `aiModel: gpt-image-2`; a regression check with `AI_IMAGE_MODEL=gpt-image-1` still reports `gpt-image-2`.

- UX: made `AI Generate` require both an uploaded sample image and a prompt; clicking without an image now shows the friendly in-page message `Add an image first` / `AI needs image + prompt` and does not call the API.
- Worker: changed AI generation to the image-edit/composition path using `THOUSANDENGINE_IMAGE_EDIT_ENDPOINT`, with server-side validation for missing prompt or missing uploaded image.
- Configuration: corrected the ThousandEngine default API base to `https://thousandengine.com/v1` after provider probing showed that `api.thousandengine.com` is not reachable from this environment.
- Verification: browser click test confirms the no-image AI button state, Local Compose remains free/no-image capable, Worker input-validation checks return 400 before quota/provider work, and synced HTML/Worker checks pass.

- Credentials: saved the Owner-provided ThousandEngine API key into local Keychain under service `blackimg-online.thousandengine` and account `THOUSANDENGINE_API_KEY`; no secret value was written to the repo.
- Generation: changed the studio action buttons to `AI Generate` and `Local Compose`; AI generation calls `/api/generate`, while Local Compose stays browser-only and free.
- Worker: added a ThousandEngine/OpenAI-compatible image generation adapter using `THOUSANDENGINE_API_KEY`, optional endpoint/model/size vars, and plan-based AI generation quota responses.
- Quota: added browser-side AI credit tracking by active plan and optional D1-backed `generation_usage` persistence when `ANALYTICS_DB` is configured; Local Compose does not consume AI credits.
- Verification: Keychain item exists, Worker syntax passes, product JSON parses, `/api/runtime` reports `aiProvider: thousandengine`, `/api/generate` returns a ThousandEngine configuration message without a key, and quota exhaustion returns 429.

- UI: increased the visible brightness range in the canvas renderer with stronger directional highlights, edge glow, and low-brightness shadow compression.
- Verification: `index.html` and `public/index.html` are synchronized after the brightness renderer update.

- UI: removed the visible `Output` panel from the studio, including the prompt-output/state summary box, while keeping Turnstile as a compact pricing-section protection check.
- Verification: `index.html` and `public/index.html` are synchronized after the Output panel removal.

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
- Superseded production blocker: the first post-deploy probe saw stale registrar DNS state during propagation. The DNS/HTTPS follow-up below confirms that Cloudflare NS, DS cleanup, apex HTTPS, and www HTTPS now pass.
- Provider blockers: PayPal credentials, Turnstile secret, AI image provider, and optional D1 analytics remain unconfigured, so payment, paid AI generation, and data loop are not production complete.

## 2026-07-05 - DNS/HTTPS release follow-up

- Cloudflare: reran `npx wrangler deploy`; Worker/Assets deployment succeeded with version `58645d9a-49fc-4da0-b803-af7d75601243`, workers.dev trigger, `blackimg.online/*`, and `www.blackimg.online/*`.
- DNS/NS: reran the Cloudflare/SpaceShip launch script using local Keychain credentials. Cloudflare zone is active; SpaceShip registrar reports custom nameservers `archer.ns.cloudflare.com` and `sydney.ns.cloudflare.com`; public DNS-over-HTTPS returns those Cloudflare nameservers and no stale DS Answer.
- TLS: Cloudflare Universal SSL is enabled with an active certificate pack for `blackimg.online` and `*.blackimg.online`.
- Production checks: direct probes with proxy variables disabled return HTTP/2 200 for `https://blackimg.online/`, `https://www.blackimg.online/`, and `https://blackimg.online/checkout/`; `/api/runtime`, `/robots.txt`, `/sitemap.xml`, `/api/checkout`, `/f9715da5fdfad6bf714ceeb6f4d3b1af.txt`, and `/missing` were checked.
- Search submission: published an IndexNow key file and submitted `https://blackimg.online/` plus `https://blackimg.online/llms.txt`; IndexNow returned HTTP 202. GSC/Bing Webmaster remain blocked because the required API/OAuth credentials are unavailable in the local secure credential store and the current environment.
- Browser tooling blocker: Codex in-app browser navigation to the live domain timed out and stayed at `about:blank`; direct HTTPS/API fallback evidence is recorded, but the required live click-flow gate remains blocked.
- Remaining provider/tool blockers: PayPal credentials, Turnstile secret, AI image provider, optional D1 analytics, GSC/Bing Webmaster credentials, and live browser click-flow verification remain unconfigured or incomplete, so the open-source-code release gate is still not `production_complete`.

## 2026-07-05 - Cleaner first screen and premium black image

- Design: simplified the first screen by replacing the three fact cards with one quiet note and two clear actions, while keeping the central editor visible.
- Layout: changed the studio from a busy three-column first-screen layout to a cleaner two-column editor/preview layout with output details moved below the main preview.
- Content: added a standalone premium black image section with a generated high-aesthetic black visual, material notes, light notes, and text-safe space notes.
- Content: added detailed practical recipes for product hero, poster background, and architecture mood board use cases.
- Asset: added optimized `public/premium-black-img.jpg` at 1586x992, about 154 KB, served through the Worker route `/premium-black-img.jpg`.
- Verification: `index.html` and `public/index.html` are synchronized; `node --check worker.js` passed; `public/product.json` parses; visible text count is 1729 words; no automatic-renewal wording is present.

## 2026-07-05 - Stricter clean first screen

- Design: reduced the first screen to one short slogan, `Make beautiful black img.`, followed immediately by the main generation/editor area.
- Content: moved first-screen explanatory copy into the lower workflow and guide content so the initial view stays quiet while the detailed sections remain useful.
- Verification: local static checks confirm 1684 visible words, the old first-screen explainer classes and CTA copy are absent, premium image and detailed recipe sections remain present, and no automatic-renewal wording is present.

## 2026-07-05 - Premium black site icon

- Design: added `public/site-icon.svg`, a high-end black rounded-square icon with subtle graphite depth, cool rim light, diagonal light blade, and an abstract `bi` mark.
- Implementation: replaced the inline data favicon with `/site-icon.svg`, reused the same asset in the header brand mark, added a Worker route for `/site-icon.svg`, and registered the route in `public/product.json`.
- Verification: SVG asset renders locally, `index.html` and `public/index.html` are synchronized, `worker.js` syntax passes, and `public/product.json` parses.

## 2026-07-05 - Restore first-screen slogan

- Design: restored the first-screen slogan to `Black img generator with light, texture, and copy` per Owner feedback while keeping the first screen limited to the slogan and the main generation/editor area.
- Verification: local static checks confirm the restored H1, new site icon references, premium image section, detailed recipe section, and no automatic-renewal wording.

## 2026-07-05 - Configure PayPal live credentials

- Credentials: saved Owner-provided PayPal live Client ID and Secret key 1 into local Keychain under live-specific PayPal service names, and synchronized them to Cloudflare Worker secrets `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` without writing secret values to the repo.
- Configuration: changed Worker `PAYPAL_ENV` from sandbox to live in `wrangler.toml` and deployed Cloudflare Worker version `d325d174-27e7-4be2-9381-40c5f27c6a97`.
- Verification: local OAuth probe confirms the new credentials work against PayPal live and not sandbox; production `/api/runtime` reports `paymentConfigured: true`; production `/api/checkout` no longer returns the PayPal configuration error.
- Remaining blocker: `/api/checkout` is still blocked by missing `TURNSTILE_SECRET_KEY`, returning the expected Turnstile configuration error before a PayPal order is created.
- Process lesson: avoid broad Keychain dump commands with context output because they can include secret data; use exact service/account reads and provider probes that print only statuses.

## 2026-07-05 - Preview interaction and clean canvas fix

- Interaction: fixed `Generate preview` so each click increments `Preview #n`, updates the status pill, and renders a new seed-based light/texture variation instead of redrawing an identical-looking canvas.
- Design: removed the local canvas triangle composition and all local text drawing; the preview now stays as a clean black image with texture and light only.
- Copy: changed the first-screen input from `Overlay copy` with default `Black img` to an empty `Copy prompt` field, and changed prompt wording to reserve text space instead of rendering text over the preview.
- Checkout UX: Free plan selection now updates the pricing status in place and no longer scrolls the user back to the top of the page.
- Verification: `node --check worker.js` passed; `public/product.json` parses; `index.html` and `public/index.html` are synchronized; static scans confirm no `drawComposition`, no `function drawText`, no `.fillText`, no default `value="Black img"`, and no `scrollIntoView`.
- Browser verification: local HTTP browser check confirmed one `Generate preview` button, status changed to `Preview rendered #1`, screenshot hash changed after click, copy label is `Copy prompt`, copy value is empty, no triangle/text drawing functions are present, and Free plan click stayed in pricing instead of jumping to the studio.
- Process lesson: event-handler checks are not enough for visual tools; future preview acceptance should verify a visible state change such as status text plus screenshot or canvas hash.

## 2026-07-05 - Pricing selected-card contrast fix

- Design: changed the default Starter pricing card from a near-black filled card to a light graphite selected state with a dark outline and dark `Default` badge.
- Reason: the selected card background was visually too close to the black checkout button, making the CTA hard to distinguish.
- Verification: `index.html` and `public/index.html` are synchronized; static CSS check confirms `.plan-card.featured` now uses a light gradient background while `.btn.primary` remains black.
- Process lesson: selected states and primary CTAs need separate contrast roles; future pricing checks should compare the selected card background against the CTA color, not only card-to-page contrast.

## 2026-07-05 - Shorter first-screen studio

- Design: reduced the desktop studio height by tightening hero padding, shell padding, panel gaps, upload height, textarea height, chip/button height, preview header spacing, and canvas minimum height.
- Removed: the visible `Copy prompt` input field from the first-screen control panel; the page keeps a hidden empty value so existing prompt-building JavaScript stays stable.
- Content: removed public copy and plan bullets that claimed users could add visible text overlays from the first-screen tool.
- Verification: local checks confirm `index.html` and `public/index.html` are synchronized, `worker.js` syntax passes, `public/product.json` parses, and visible `Copy prompt` input no longer exists.
- Browser verification: at the 1280x720 local preview viewport, the H1 is a single 40px-tall line, the control panel bottom is 700px, the preview panel bottom is 700px, the visible copy text-input count is 0, the hidden copy input count is 1, and all four texture buttons are on one row.
- Process lesson: compact-first-screen checks need to measure the real control-panel and preview-panel bounding boxes at the target desktop viewport, not just reduce isolated CSS values.

## 2026-07-05 - Default Pro plan and restored headline

- Pricing: changed the default selected package from Starter to Pro, the third pricing option. The Pro card now carries the `featured` selected state and `Default` badge; Starter is no longer highlighted.
- Runtime: changed Worker runtime `defaultPlan` and `public/product.json` pricing `defaultPlan` from `starter` to `pro`.
- Hero: restored the first-screen headline to the original wording, `Black img generator for cinematic dark images`.
- Verification: local static checks confirm exactly one featured pricing card, `data-plan="pro"` is the featured card, the checkout status says `Default selected plan: Pro`, and no `Starter plan is selected by default` copy remains.
- Process lesson: pricing defaults must be updated in three places together: visible card state, runtime default, and product metadata.

## 2026-07-05 - Texture dropdown with 20 presets

- UI: replaced the four Texture buttons with a native Texture dropdown to reduce first-screen height and make room for more options.
- Presets: expanded Texture from 4 options to 20 options: Silk, Graphite, Glass, Marble, Velvet, Obsidian, Carbon fiber, Satin, Leather, Smoke, Black paper, Slate, Wet asphalt, Brushed metal, Ceramic, Rubber, Ink wash, Charcoal, Black sand, and Holographic film.
- Rendering: mapped the 20 presets into four local preview texture families so the preview changes when a new preset is selected.
- Verification: local checks confirm `#textureInput` exists, has 20 options, the old `#textureGroup` button group is gone, `index.html` and `public/index.html` are synchronized, and changing the dropdown updates the visible texture state.
- Process lesson: when a control grows past a handful of choices, use a select/menu and verify both option count and state update, not just the rendered HTML.

## 2026-07-05 - Circular light-angle control

- UI: replaced the four Light angle buttons (`NW`, `NE`, `SE`, `SW`) with a compact circular angle dial.
- Interaction: the dial supports click/drag pointer adjustment plus keyboard adjustment with arrow keys, PageUp/PageDown, Home, and End.
- State: the dial updates `state.angle`, the preview light direction, `stateAngle`, `captionLight`, the degree readout, direction label, and ARIA slider values.
- Verification: local checks confirm `#angleDial` exists, old `button[data-angle]` controls are gone, the initial angle is `315° / NW light`, ArrowRight changes the angle to `320°`, clicking the right side of the dial sets `90° / E light`, and the compact dial keeps the 1280x720 first-screen control and preview panel bottoms at 720px.
- Process lesson: custom visual controls need both pointer and keyboard verification so the UI remains usable after replacing native buttons.

## 2026-07-05 - Centered first-screen headline spacing

- Design: centered the first-screen headline and increased the vertical space around the title so it sits more comfortably between the fixed navigation and the studio editor.
- Layout: changed `.hero-tool` desktop padding to `32px 0 30px`, increased the title-to-studio gap to `28px`, and constrained the headline width to keep the centered line polished on wide desktop screens.
- Verification: local checks confirm `index.html` and `public/index.html` are synchronized, `worker.js` syntax passes, and browser measurement at 1280x720 shows centered text, a 31px navigation-to-title gap, and a 28px title-to-studio gap.
- Process lesson: when adjusting first-screen spacing, verify actual browser bounding boxes after CSS edits instead of relying on visual estimates.
