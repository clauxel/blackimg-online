# black img

`blackimg.online` is a single-page black img generator and editor.

The homepage lets visitors create a local black img preview from a sample and custom prompt, tune texture, light angle, brightness, and aspect ratio, then export a PNG. Paid server-side generation and PayPal checkout are routed through the same-domain Cloudflare Worker when production secrets are configured.

## Files

- `index.html` - canonical handwritten homepage source.
- `public/index.html` - Cloudflare Worker static asset copy.
- `worker.js` - Cloudflare Worker routes for runtime, generation, checkout, analytics, robots, sitemap, and llms.
- `public/robots.txt`, `public/sitemap.xml`, `public/llms.txt` - public crawl and AI context files.
- `reports/` - local and production gate evidence.

## Verification

```bash
node --check worker.js
npx wrangler deploy --dry-run
```

Production checkout needs `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_ENV`, and `TURNSTILE_SECRET_KEY`. Real AI generation needs `THOUSANDENGINE_API_KEY`, with optional ThousandEngine endpoint/model environment variables.
