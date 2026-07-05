const CONFIG = {
  brand: 'black img',
  domain: 'blackimg.online',
  canonicalOrigin: 'https://blackimg.online',
  support: 'support@aigeamy.com',
  defaultBilling: 'annual',
  defaultPlan: 'pro',
  defaultImageModel: 'gpt-image-2',
  defaultImageBaseUrl: 'https://thousandengine.com/v1',
  plans: {
    free: {
      id: 'free',
      name: 'Free',
      monthlyUsd: 0,
      annualMonthlyUsd: 0,
      annualDueUsd: 0,
      generationCredits: 6,
      downloadCredits: 3,
      templates: 'free templates',
      customPrompt: true,
      free: true,
      description: 'Free black img access with 6 generations, 3 downloads, custom prompt input, texture, light angle, brightness controls, and free templates.',
    },
    starter: {
      id: 'starter',
      name: 'Starter',
      monthlyUsd: 9,
      annualMonthlyUsd: 4.5,
      annualDueUsd: 54,
      generationCredits: 30,
      downloadCredits: 30,
      templates: 'all templates',
      customPrompt: true,
      description: '30 black img generations and 30 downloads with all templates, custom prompt input, texture, light angle, and brightness controls.',
    },
    pro: {
      id: 'pro',
      name: 'Pro',
      monthlyUsd: 49,
      annualMonthlyUsd: 24.5,
      annualDueUsd: 294,
      generationCredits: 500,
      downloadCredits: 500,
      templates: 'all templates',
      customPrompt: true,
      description: '500 black img generations and 500 downloads with all templates and custom prompt input.',
    },
    scale: {
      id: 'scale',
      name: 'Scale',
      monthlyUsd: 89,
      annualMonthlyUsd: 44.5,
      annualDueUsd: 534,
      generationCredits: 5000,
      downloadCredits: 5000,
      templates: 'all templates',
      customPrompt: true,
      description: '5000 black img generations and 5000 downloads with all templates and custom prompt input for large batches.',
    },
  },
}

const ALT_HOSTS = new Set(['www.' + CONFIG.domain])
const PAYPAL_ENV_VALUES = new Set(['sandbox', 'live'])

export default {
  async fetch(request, env, ctx) {
    return handleRequest(request, env, ctx)
  },
}

export async function handleRequest(request, env = {}, ctx = {}) {
  const url = new URL(request.url)

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: securityHeaders(request) })
  }

  if (url.pathname === '/robots.txt') {
    return serveAsset(request, env, '/robots.txt', 'text/plain; charset=utf-8')
  }

  if (url.pathname === '/sitemap.xml') {
    return serveAsset(request, env, '/sitemap.xml', 'application/xml; charset=utf-8')
  }

  if (url.pathname === '/llms.txt') {
    return serveAsset(request, env, '/llms.txt', 'text/plain; charset=utf-8')
  }
  if (url.pathname === '/premium-black-img.jpg') {
    return serveAsset(request, env, '/premium-black-img.jpg', 'image/jpeg')
  }
  if (url.pathname === '/site-icon.svg') {
    return serveAsset(request, env, '/site-icon.svg', 'image/svg+xml; charset=utf-8')
  }
  if (url.pathname === '/f9715da5fdfad6bf714ceeb6f4d3b1af.txt') {
    return serveAsset(request, env, '/f9715da5fdfad6bf714ceeb6f4d3b1af.txt', 'text/plain; charset=utf-8')
  }

  if (url.pathname === '/api/runtime') {
    return jsonResponse(runtimePayload(env), 200, request)
  }

  if (url.pathname === '/api/generate') {
    return handleGenerate(request, env)
  }

  if (url.pathname === '/api/checkout') {
    return handleCheckout(request, env)
  }

  if (url.pathname === '/api/analytics') {
    return handleAnalytics(request, env, ctx)
  }

  if (url.pathname === '/' || url.pathname === '/index.html' || url.pathname === '/checkout' || url.pathname === '/checkout/') {
    return serveIndex(request, env)
  }

  return jsonResponse({ ok: false, error: 'Not found.' }, 404, request)
}

function securityHeaders(request) {
  const headers = new Headers({
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    'Cache-Control': 'no-store',
  })
  const origin = request?.headers?.get?.('Origin')
  if (originAllowed(origin)) {
    headers.set('Access-Control-Allow-Origin', origin)
    headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    headers.set('Access-Control-Allow-Headers', 'Content-Type')
    headers.set('Vary', 'Origin')
  }
  return headers
}

function originAllowed(origin) {
  if (!origin) return false
  try {
    const url = new URL(origin)
    return url.hostname === CONFIG.domain ||
      ALT_HOSTS.has(url.hostname) ||
      url.hostname === 'localhost' ||
      url.hostname === '127.0.0.1' ||
      url.hostname.endsWith('.workers.dev') ||
      url.hostname.endsWith('.pages.dev')
  } catch {
    return false
  }
}

function jsonResponse(data, status = 200, request = null) {
  const headers = securityHeaders(request)
  headers.set('Content-Type', 'application/json; charset=utf-8')
  return new Response(JSON.stringify(data), { status, headers })
}

function textResponse(body, contentType, request = null) {
  const headers = securityHeaders(request)
  headers.set('Content-Type', contentType)
  headers.set('Cache-Control', 'public, max-age=180')
  return new Response(body, { status: 200, headers })
}

async function serveIndex(request, env) {
  if (env?.SITE_ASSETS?.fetch) {
    const assetUrl = new URL(request.url)
    assetUrl.pathname = '/'
    const response = await env.SITE_ASSETS.fetch(new Request(assetUrl, request))
    const headers = new Headers(response.headers)
    for (const [key, value] of securityHeaders(request)) headers.set(key, value)
    headers.set('Content-Type', 'text/html; charset=utf-8')
    headers.set('Cache-Control', 'public, max-age=180')
    return new Response(response.body, { status: response.status, headers })
  }
  return textResponse('black img Worker is running. Bind SITE_ASSETS or serve index.html separately.', 'text/plain; charset=utf-8', request)
}

async function serveAsset(request, env, pathname, contentType) {
  if (env?.SITE_ASSETS?.fetch) {
    const assetUrl = new URL(request.url)
    assetUrl.pathname = pathname
    const response = await env.SITE_ASSETS.fetch(new Request(assetUrl, request))
    const headers = new Headers(response.headers)
    for (const [key, value] of securityHeaders(request)) headers.set(key, value)
    headers.set('Content-Type', contentType)
    headers.set('Cache-Control', 'public, max-age=300')
    return new Response(response.body, { status: response.status, headers })
  }

  const fallback = {
    '/robots.txt': 'User-agent: *\nAllow: /\nSitemap: https://blackimg.online/sitemap.xml\n',
    '/f9715da5fdfad6bf714ceeb6f4d3b1af.txt': 'f9715da5fdfad6bf714ceeb6f4d3b1af',
    '/sitemap.xml': '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>https://blackimg.online/</loc>\n    <lastmod>2026-07-05</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>\n  <url>\n    <loc>https://blackimg.online/llms.txt</loc>\n    <lastmod>2026-07-05</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.4</priority>\n  </url>\n</urlset>\n',
    '/llms.txt': '# black img\n\nCanonical URL: https://blackimg.online/\nUpdated: 2026-07-05\nSupport: support@aigeamy.com\n\nPrimary purpose:\n- Create a beautiful black img from a sample image and custom prompt.\n- Tune texture, light angle, brightness, and aspect ratio.\n- Route AI generation through ThousandEngine and checkout through the same-domain Cloudflare Worker when configured.\n\nCore endpoints:\n- Homepage: https://blackimg.online/\n- Runtime: https://blackimg.online/api/runtime\n- Generate: https://blackimg.online/api/generate\n- Checkout: https://blackimg.online/api/checkout\n\nCurrent boundaries:\n- Local Compose works in the browser without a paid provider.\n- Production AI generation requires THOUSANDENGINE_API_KEY, with optional ThousandEngine edit endpoint/model vars.\n- The frontend sends the custom prompt; the Worker adds the black-image beauty prompt layer before provider generation.\n- Paid checkout requires PayPal credentials and Turnstile secret configuration.\n',
  }
  return textResponse(fallback[pathname] || '', contentType, request)
}

function runtimePayload(env) {
  return {
    ok: true,
    brand: CONFIG.brand,
    canonicalOrigin: CONFIG.canonicalOrigin,
    paymentProvider: 'paypal',
    paymentConfigured: paypalConfigured(env),
    turnstileConfigured: Boolean(env?.TURNSTILE_SECRET_KEY),
    aiProvider: 'thousandengine',
    aiConfigured: aiConfigured(env),
    aiModel: imageModel(env),
    defaultPlan: CONFIG.defaultPlan,
    defaultBilling: CONFIG.defaultBilling,
    plans: publicPlans(),
    endpoints: {
      generate: '/api/generate',
      checkout: '/api/checkout',
      analytics: '/api/analytics',
    },
  }
}

function publicPlans() {
  return Object.fromEntries(Object.values(CONFIG.plans).map((plan) => [plan.id, {
    id: plan.id,
    name: plan.name,
    generationCredits: plan.generationCredits,
    downloadCredits: plan.downloadCredits,
    templates: plan.templates,
    customPrompt: plan.customPrompt,
    free: Boolean(plan.free),
    description: plan.description,
    monthly: {
      displayMonthlyUsd: plan.monthlyUsd,
      dueTodayUsd: plan.monthlyUsd,
    },
    annual: {
      displayMonthlyUsd: plan.annualMonthlyUsd,
      dueTodayUsd: plan.annualDueUsd,
      discount: '50%',
    },
  }]))
}

function paypalConfigured(env) {
  return Boolean(env?.PAYPAL_CLIENT_ID && env?.PAYPAL_CLIENT_SECRET)
}

function aiConfigured(env) {
  return Boolean(thousandEngineKey(env) || (env?.AI_IMAGE_ENDPOINT && env?.AI_IMAGE_API_KEY))
}

function thousandEngineKey(env) {
  return env?.THOUSANDENGINE_API_KEY || env?.AI_IMAGE_API_KEY || ''
}

function thousandEngineImageEndpoint(env) {
  if (env?.THOUSANDENGINE_IMAGE_ENDPOINT) return String(env.THOUSANDENGINE_IMAGE_ENDPOINT)
  if (env?.AI_IMAGE_ENDPOINT) return String(env.AI_IMAGE_ENDPOINT)
  const base = String(env?.THOUSANDENGINE_BASE_URL || CONFIG.defaultImageBaseUrl).replace(/\/+$/, '')
  return base + '/images/generations'
}

function thousandEngineImageEditEndpoint(env) {
  if (env?.THOUSANDENGINE_IMAGE_EDIT_ENDPOINT) return String(env.THOUSANDENGINE_IMAGE_EDIT_ENDPOINT)
  if (env?.AI_IMAGE_EDIT_ENDPOINT) return String(env.AI_IMAGE_EDIT_ENDPOINT)
  const base = String(env?.THOUSANDENGINE_BASE_URL || CONFIG.defaultImageBaseUrl).replace(/\/+$/, '')
  return base + '/images/edits'
}

function imageModel(env) {
  return String(env?.THOUSANDENGINE_IMAGE_MODEL || CONFIG.defaultImageModel)
}

function normalizePlan(body = {}) {
  const planId = Object.prototype.hasOwnProperty.call(CONFIG.plans, body.plan) ? body.plan : CONFIG.defaultPlan
  const billing = body.billing === 'monthly' ? 'monthly' : 'annual'
  const plan = CONFIG.plans[planId]
  const dueTodayUsd = billing === 'annual' ? plan.annualDueUsd : plan.monthlyUsd
  const displayMonthlyUsd = billing === 'annual' ? plan.annualMonthlyUsd : plan.monthlyUsd
  return { plan, planId, billing, dueTodayUsd, displayMonthlyUsd }
}

async function readJson(request, maxBytes = 12000) {
  const contentType = request.headers.get('Content-Type') || ''
  if (!contentType.toLowerCase().includes('application/json')) {
    throw new Response(JSON.stringify({ ok: false, error: 'Content-Type must be application/json.' }), {
      status: 415,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    })
  }
  const text = await request.text()
  if (text.length > maxBytes) {
    throw new Response(JSON.stringify({ ok: false, error: 'Request body is too large.' }), {
      status: 413,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    })
  }
  try {
    return JSON.parse(text)
  } catch {
    throw new Response(JSON.stringify({ ok: false, error: 'Invalid JSON body.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    })
  }
}

function cleanText(value, maxLength = 900) {
  return String(value || '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
}

function buildBeautifulBlackPrompt(body) {
  const customPrompt = cleanText(body.customPrompt || body.userPrompt || body.prompt, 900)
  const overlayText = cleanText(body.overlayText, 80)
  const texture = cleanText(body.texture, 40) || 'silk'
  const angle = Number.isFinite(Number(body.angle)) ? Number(body.angle) : 315
  const brightness = Math.max(0, Math.min(100, Number(body.brightness) || 48))
  const aspect = ['wide', 'square', 'story'].includes(body.aspect) ? body.aspect : 'wide'

  return {
    prompt: [
      customPrompt ? 'User custom prompt: ' + customPrompt : 'A refined black image with visible form and elegant shadow.',
      'Use the uploaded image as the foreground subject. Preserve the foreground subject identity, silhouette, product shape, and important details while removing any cheap or cluttered background feeling.',
      'Blend the foreground subject into a premium black textured background. The background should be black dominant with refined material texture, cinematic low-key lighting, soft gray light falloff, elegant shadows, and high-end editorial composition.',
      'Make the fused image look as beautiful, luxurious, polished, and premium as possible: advanced black aesthetics, subtle rim light, clean depth, tasteful contrast, visible detail in the blacks, and a refined gallery-quality mood.',
      'Texture preset: ' + texture + '. Light angle: ' + angle + ' degrees. Brightness target: ' + brightness + '/100. Aspect: ' + aspect + '.',
      overlayText ? 'Reserve clean negative space for this copy line: "' + overlayText + '".' : 'Reserve clean negative space without text overlay.',
      'Avoid muddy black, crushed details, flat gray, noisy artifacts, harsh glare, pasted-on subject edges, cheap stock-photo styling, cartoon look, and random background objects.',
    ].join(' '),
    texture,
    angle,
    brightness,
    aspect,
    overlayText,
    customPrompt,
  }
}

function imageSizeForAspect(aspect, env) {
  if (env?.THOUSANDENGINE_IMAGE_SIZE) return String(env.THOUSANDENGINE_IMAGE_SIZE)
  if (aspect === 'square') return '1024x1024'
  if (aspect === 'story') return '1024x1536'
  return '1536x1024'
}

function buildImageRequest(promptPack, env) {
  const model = imageModel(env)
  const body = {
    model,
    prompt: promptPack.prompt,
    n: 1,
    size: imageSizeForAspect(promptPack.aspect, env),
  }
  if (!model.startsWith('gpt-image')) body.response_format = 'b64_json'
  return body
}

function buildImageEditRequest(promptPack, sampleImage, env) {
  const form = new FormData()
  form.append('model', imageModel(env))
  form.append('prompt', promptPack.prompt)
  form.append('n', '1')
  form.append('size', imageSizeForAspect(promptPack.aspect, env))
  form.append('image', sampleImage.blob, sampleImage.filename)
  return form
}

function parseDataUrlImage(value, name = 'sample-image') {
  if (typeof value !== 'string') return null
  const match = value.match(/^data:(image\/(?:png|jpe?g|webp));base64,([a-z0-9+/=\s]+)$/i)
  if (!match) return null
  const mimeType = match[1].toLowerCase().replace('image/jpg', 'image/jpeg')
  const base64 = match[2].replace(/\s+/g, '')
  const maxBytes = 6 * 1024 * 1024
  if (base64.length > Math.ceil(maxBytes * 4 / 3)) {
    throw new Error('The uploaded image is too large for AI generation.')
  }
  const binary = atob(base64)
  if (binary.length > maxBytes) {
    throw new Error('The uploaded image is too large for AI generation.')
  }
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  const extension = mimeType === 'image/jpeg' ? 'jpg' : mimeType.split('/')[1]
  const safeName = cleanText(name, 80).replace(/[^a-z0-9._-]+/gi, '-') || 'sample-image'
  return {
    blob: new Blob([bytes], { type: mimeType }),
    filename: safeName.includes('.') ? safeName : safeName + '.' + extension,
    mimeType,
  }
}

function extractImagePayload(providerJson) {
  const first = Array.isArray(providerJson?.data) ? providerJson.data[0] : providerJson?.data
  const candidate = first || providerJson || {}
  const b64 = candidate.b64_json || candidate.image_base64 || candidate.base64 || candidate.image
  const url = candidate.url || candidate.image_url || candidate.imageUrl
  if (typeof b64 === 'string' && b64) {
    const imageDataUrl = b64.startsWith('data:image/') ? b64 : 'data:image/png;base64,' + b64
    return { imageDataUrl }
  }
  if (typeof url === 'string' && url) return { imageUrl: url }
  return {}
}

function normalizeGenerationEntitlement(body = {}) {
  const selection = normalizePlan(body)
  const limit = selection.plan.generationCredits
  const clientId = cleanText(body.clientId, 120)
  const localUsageCount = Math.max(0, Number(body.localUsageCount) || 0)
  return {
    ...selection,
    clientId,
    limit,
    localUsageCount,
  }
}

async function readGenerationUsage(env, entitlement) {
  if (!env?.ANALYTICS_DB?.prepare || !entitlement.clientId) {
    return { configured: false, used: entitlement.localUsageCount }
  }
  await ensureGenerationUsageTable(env)
  const row = await env.ANALYTICS_DB.prepare(
    'SELECT used FROM generation_usage WHERE client_id = ? AND plan = ?'
  ).bind(entitlement.clientId, entitlement.planId).first()
  return { configured: true, used: Math.max(0, Number(row?.used) || 0) }
}

async function recordGenerationUsage(env, entitlement, fallbackUsed) {
  if (!env?.ANALYTICS_DB?.prepare || !entitlement.clientId) {
    return { configured: false, used: fallbackUsed + 1 }
  }
  await ensureGenerationUsageTable(env)
  await env.ANALYTICS_DB.prepare(`INSERT INTO generation_usage
    (client_id, plan, used, updated_at)
    VALUES (?, ?, 1, ?)
    ON CONFLICT(client_id, plan) DO UPDATE SET
      used = used + 1,
      updated_at = excluded.updated_at`)
    .bind(entitlement.clientId, entitlement.planId, new Date().toISOString())
    .run()
  const row = await env.ANALYTICS_DB.prepare(
    'SELECT used FROM generation_usage WHERE client_id = ? AND plan = ?'
  ).bind(entitlement.clientId, entitlement.planId).first()
  return { configured: true, used: Math.max(0, Number(row?.used) || fallbackUsed + 1) }
}

async function ensureGenerationUsageTable(env) {
  await env.ANALYTICS_DB.prepare(`CREATE TABLE IF NOT EXISTS generation_usage (
    client_id TEXT NOT NULL,
    plan TEXT NOT NULL,
    used INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL,
    PRIMARY KEY (client_id, plan)
  )`).run()
}

function quotaPayload(entitlement, used, persisted) {
  return {
    plan: entitlement.planId,
    limit: entitlement.limit,
    used,
    remaining: Math.max(0, entitlement.limit - used),
    persisted: Boolean(persisted),
  }
}

async function handleGenerate(request, env) {
  if (request.method !== 'POST') {
    return jsonResponse({ ok: false, error: 'Method not allowed.' }, 405, request)
  }
  let body
  try {
    body = await readJson(request, 8500000)
  } catch (response) {
    return withSecurity(response, request)
  }

  const promptPack = buildBeautifulBlackPrompt(body)
  if (!promptPack.customPrompt) {
    return jsonResponse({ ok: false, error: 'AI Generate needs a prompt.' }, 400, request)
  }

  let sampleImage = null
  try {
    sampleImage = parseDataUrlImage(body.sampleImage, body.sampleName)
  } catch (error) {
    return jsonResponse({ ok: false, error: error.message }, 400, request)
  }
  if (!sampleImage) {
    return jsonResponse({ ok: false, error: 'AI Generate needs an uploaded image and prompt.' }, 400, request)
  }

  const entitlement = normalizeGenerationEntitlement(body)
  const usage = await readGenerationUsage(env, entitlement)
  if (usage.used >= entitlement.limit) {
    return jsonResponse({
      ok: false,
      quotaExceeded: true,
      quota: quotaPayload(entitlement, usage.used, usage.configured),
      error: 'The selected plan has no remaining AI generation credits.',
    }, 429, request)
  }

  if (!aiConfigured(env)) {
    return jsonResponse({
      ok: false,
      previewOnly: true,
      aiConfigured: false,
      provider: 'thousandengine',
      quota: quotaPayload(entitlement, usage.used, usage.configured),
      prompt: promptPack.prompt,
      error: 'AI image provider is not configured. Set THOUSANDENGINE_API_KEY in the Worker environment.',
    }, 503, request)
  }

  const turnstile = await verifyTurnstile(body.turnstileToken, request, env)
  if (!turnstile.ok) {
    return jsonResponse({ ok: false, error: turnstile.error, turnstileConfigured: turnstile.configured }, turnstile.status, request)
  }

  const providerResponse = await fetch(thousandEngineImageEditEndpoint(env), {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + thousandEngineKey(env),
    },
    body: buildImageEditRequest(promptPack, sampleImage, env),
  })

  const raw = await providerResponse.text()
  let providerJson = null
  try { providerJson = JSON.parse(raw) } catch {}

  if (!providerResponse.ok) {
    return jsonResponse({
      ok: false,
      aiConfigured: true,
      provider: 'thousandengine',
      quota: quotaPayload(entitlement, usage.used, usage.configured),
      error: 'AI provider returned an error.',
      providerStatus: providerResponse.status,
    }, 502, request)
  }

  const recorded = await recordGenerationUsage(env, entitlement, usage.used)
  const imagePayload = extractImagePayload(providerJson)
  return jsonResponse({
    ok: true,
    provider: 'thousandengine',
    model: imageModel(env),
    quota: quotaPayload(entitlement, recorded.used, recorded.configured),
    prompt: promptPack.prompt,
    ...imagePayload,
    providerResponse: providerJson || { raw },
  }, 200, request)
}

async function handleCheckout(request, env) {
  if (request.method !== 'POST') {
    return jsonResponse({ ok: false, error: 'Method not allowed.' }, 405, request)
  }
  let body
  try {
    body = await readJson(request, 4000)
  } catch (response) {
    return withSecurity(response, request)
  }

  const selection = normalizePlan(body)
  if (selection.plan.free) {
    return jsonResponse({
      ok: false,
      paymentConfigured: paypalConfigured(env),
      provider: 'paypal',
      plan: selection.planId,
      billing: selection.billing,
      error: 'The Free plan does not require PayPal checkout. Use the black img studio preview directly.',
    }, 400, request)
  }
  if (!paypalConfigured(env)) {
    return jsonResponse({
      ok: false,
      paymentConfigured: false,
      provider: 'paypal',
      plan: selection.planId,
      billing: selection.billing,
      error: 'PayPal checkout is not configured. Set PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, and PAYPAL_ENV in the Worker environment.',
    }, 503, request)
  }

  const turnstile = await verifyTurnstile(body.turnstileToken, request, env)
  if (!turnstile.ok) {
    return jsonResponse({ ok: false, error: turnstile.error, turnstileConfigured: turnstile.configured }, turnstile.status, request)
  }

  const base = paypalBase(env)
  const accessToken = await createPayPalAccessToken(base, env)
  if (!accessToken) {
    return jsonResponse({ ok: false, paymentConfigured: true, error: 'PayPal access token could not be created.' }, 502, request)
  }

  const origin = safeOrigin(request)
  const order = await createPayPalOrder(base, accessToken, origin, selection)
  if (!order.ok) {
    return jsonResponse({ ok: false, paymentConfigured: true, error: 'PayPal order could not be created.', providerStatus: order.status }, 502, request)
  }

  return jsonResponse({
    ok: true,
    provider: 'paypal',
    paymentConfigured: true,
    plan: selection.planId,
    billing: selection.billing,
    dueTodayUsd: selection.dueTodayUsd,
    orderId: order.data.id,
    approvalUrl: order.approvalUrl,
  }, 200, request)
}

async function verifyTurnstile(token, request, env) {
  if (!env?.TURNSTILE_SECRET_KEY) {
    return {
      ok: false,
      configured: false,
      status: 503,
      error: 'Turnstile is not configured. Set TURNSTILE_SECRET_KEY before enabling paid or server-side generation.',
    }
  }
  if (!token || typeof token !== 'string' || token.length > 4096) {
    return { ok: false, configured: true, status: 403, error: 'Turnstile token is missing.' }
  }

  const form = new FormData()
  form.append('secret', env.TURNSTILE_SECRET_KEY)
  form.append('response', token)
  const ip = request.headers.get('CF-Connecting-IP')
  if (ip) form.append('remoteip', ip)

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: form,
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok || data.success !== true) {
    return { ok: false, configured: true, status: 403, error: 'Turnstile verification failed.' }
  }
  return { ok: true, configured: true }
}

function paypalBase(env) {
  const mode = String(env?.PAYPAL_ENV || 'sandbox').toLowerCase()
  const normalized = PAYPAL_ENV_VALUES.has(mode) ? mode : 'sandbox'
  return normalized === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com'
}

async function createPayPalAccessToken(base, env) {
  const credentials = btoa(env.PAYPAL_CLIENT_ID + ':' + env.PAYPAL_CLIENT_SECRET)
  const response = await fetch(base + '/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + credentials,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })
  if (!response.ok) return ''
  const data = await response.json().catch(() => ({}))
  return typeof data.access_token === 'string' ? data.access_token : ''
}

async function createPayPalOrder(base, accessToken, origin, selection) {
  const response = await fetch(base + '/v2/checkout/orders', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + accessToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        description: CONFIG.plans[selection.planId].description,
        custom_id: 'blackimg:' + selection.planId + ':' + selection.billing,
        amount: {
          currency_code: 'USD',
          value: selection.dueTodayUsd.toFixed(2),
        },
      }],
      application_context: {
        brand_name: CONFIG.brand,
        user_action: 'PAY_NOW',
        return_url: origin + '/?checkout=success&plan=' + encodeURIComponent(selection.planId),
        cancel_url: origin + '/?checkout=cancel&plan=' + encodeURIComponent(selection.planId),
      },
    }),
  })
  const data = await response.json().catch(() => ({}))
  const approval = Array.isArray(data.links)
    ? data.links.find((link) => link.rel === 'approve' && typeof link.href === 'string')
    : null
  return { ok: response.ok && Boolean(approval), status: response.status, data, approvalUrl: approval?.href || '' }
}

function safeOrigin(request) {
  try {
    const url = new URL(request.url)
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') return url.origin
  } catch {}
  return CONFIG.canonicalOrigin
}

async function handleAnalytics(request, env, ctx) {
  if (request.method !== 'POST') {
    return jsonResponse({ ok: false, error: 'Method not allowed.' }, 405, request)
  }
  let body
  try {
    body = await readJson(request, 3000)
  } catch (response) {
    return withSecurity(response, request)
  }

  const event = {
    id: crypto.randomUUID(),
    site: CONFIG.domain,
    event: cleanText(body.event, 60) || 'event',
    path: cleanText(body.path, 160) || '/',
    plan: cleanText(body.plan, 40),
    billing: cleanText(body.billing, 20),
    createdAt: new Date().toISOString(),
  }

  if (!env?.ANALYTICS_DB?.prepare) {
    return jsonResponse({ ok: true, stored: false, reason: 'ANALYTICS_DB is not configured.', eventId: event.id }, 200, request)
  }

  ctx?.waitUntil?.(writeAnalytics(env, event))
  return jsonResponse({ ok: true, stored: true, eventId: event.id }, 200, request)
}

async function writeAnalytics(env, event) {
  await env.ANALYTICS_DB.prepare(`CREATE TABLE IF NOT EXISTS analytics_events (
    id TEXT PRIMARY KEY,
    site TEXT NOT NULL,
    event TEXT NOT NULL,
    path TEXT NOT NULL,
    plan TEXT,
    billing TEXT,
    created_at TEXT NOT NULL
  )`).run()
  await env.ANALYTICS_DB.prepare(`INSERT INTO analytics_events
    (id, site, event, path, plan, billing, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .bind(event.id, event.site, event.event, event.path, event.plan, event.billing, event.createdAt)
    .run()
}

function withSecurity(response, request) {
  const headers = new Headers(response.headers)
  for (const [key, value] of securityHeaders(request)) headers.set(key, value)
  return new Response(response.body, { status: response.status, headers })
}
