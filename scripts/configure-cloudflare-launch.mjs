import { spawnSync } from 'node:child_process'

const domain = 'blackimg.online'
const canonicalHost = domain
const wwwHost = `www.${domain}`
const workerName = 'blackimg-online'
const statusOnly = process.argv.includes('--status-only')

function keychain(service, account = process.env.BLACKIMG_KEYCHAIN_ACCOUNT) {
  if (process.env[service]) return process.env[service].trim()
  if (!account) return ''

  const swift = `
import Foundation
import Security

let service = ${JSON.stringify(service)}
let account = ${JSON.stringify(account)}
let query: [String: Any] = [
  kSecClass as String: kSecClassGenericPassword,
  kSecAttrService as String: service,
  kSecAttrAccount as String: account,
  kSecReturnData as String: true,
  kSecMatchLimit as String: kSecMatchLimitOne
]
var result: CFTypeRef?
let status = SecItemCopyMatching(query as CFDictionary, &result)
if status == errSecSuccess, let data = result as? Data, let value = String(data: data, encoding: .utf8) {
  print(value)
}
`
  const result = spawnSync('/usr/bin/swift', ['-'], {
    input: swift,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'ignore'],
  })
  return (result.stdout || '').trim()
}

const cfGlobalKey = keychain('CLOUDFLARE_API_KEY')
const cfEmail = keychain('CLOUDFLARE_EMAIL')
const spaceshipKey = keychain('SPACESHIP_API_KEY')
const spaceshipSecret = keychain('SPACESHIP_API_SECRET')

function requireValue(value, label) {
  if (!value) throw new Error(`${label} is not configured`)
  return value
}

async function requestJson(url, options, provider) {
  const response = await fetch(url, options)
  const text = await response.text()
  let data
  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    data = { raw: text }
  }
  if (!response.ok || data.success === false) {
    const messages = Array.isArray(data.errors)
      ? data.errors.map((error) => error.message || error.code).join('; ')
      : text.slice(0, 300)
    throw new Error(`${provider} request failed (${response.status}): ${messages}`)
  }
  return data
}

async function cf(endpoint, options = {}) {
  return requestJson(`https://api.cloudflare.com/client/v4${endpoint}`, {
    ...options,
    headers: {
      'X-Auth-Key': requireValue(cfGlobalKey, 'CLOUDFLARE_API_KEY'),
      'X-Auth-Email': requireValue(cfEmail, 'CLOUDFLARE_EMAIL'),
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  }, 'Cloudflare')
}

async function spaceship(endpoint, options = {}) {
  return requestJson(`https://spaceship.dev/api/v1${endpoint}`, {
    ...options,
    headers: {
      'X-API-Key': requireValue(spaceshipKey, 'SPACESHIP_API_KEY'),
      'X-API-Secret': requireValue(spaceshipSecret, 'SPACESHIP_API_SECRET'),
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  }, 'Spaceship')
}

async function accountId() {
  if (process.env.CLOUDFLARE_ACCOUNT_ID) return process.env.CLOUDFLARE_ACCOUNT_ID
  const accounts = await cf('/accounts?per_page=20')
  const account = accounts.result?.[0]
  if (!account?.id) throw new Error('No Cloudflare account was returned')
  return account.id
}

async function ensureZone(id) {
  const existing = await cf(`/zones?name=${encodeURIComponent(domain)}&account.id=${id}`)
  if (existing.result?.[0]) return { zone: existing.result[0], created: false }
  const created = await cf('/zones', {
    method: 'POST',
    body: JSON.stringify({
      account: { id },
      name: domain,
      type: 'full',
      jump_start: false,
    }),
  })
  return { zone: created.result, created: true }
}

async function putZoneSetting(zoneId, id, value) {
  await cf(`/zones/${zoneId}/settings/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ value }),
  })
}

async function ensureDnsRecord(zoneId, host) {
  const name = host === canonicalHost ? domain : host
  const records = await cf(`/zones/${zoneId}/dns_records?name=${encodeURIComponent(name)}&per_page=100`)
  const compatible = records.result?.filter((record) => record.type === 'A' && record.content === '192.0.2.1') || []
  const conflicts = records.result?.filter((record) => !(record.type === 'A' && record.content === '192.0.2.1')) || []
  if (conflicts.length) {
    return { host: name, action: 'blocked_conflict', types: conflicts.map((record) => record.type) }
  }
  if (compatible[0]) {
    if (!compatible[0].proxied) {
      await cf(`/zones/${zoneId}/dns_records/${compatible[0].id}`, {
        method: 'PATCH',
        body: JSON.stringify({ proxied: true }),
      })
      return { host: name, action: 'proxied-existing' }
    }
    return { host: name, action: 'existing' }
  }
  await cf(`/zones/${zoneId}/dns_records`, {
    method: 'POST',
    body: JSON.stringify({
      type: 'A',
      name,
      content: '192.0.2.1',
      ttl: 1,
      proxied: true,
    }),
  })
  return { host: name, action: 'created' }
}

async function ensureWorkerRoute(zoneId, pattern) {
  const routes = await cf(`/zones/${zoneId}/workers/routes?per_page=100`)
  const existing = routes.result?.find((route) => route.pattern === pattern)
  const body = JSON.stringify({ pattern, script: workerName })
  if (existing) {
    if (existing.script === workerName) return { pattern, action: 'existing' }
    await cf(`/zones/${zoneId}/workers/routes/${existing.id}`, { method: 'PUT', body })
    return { pattern, action: 'updated' }
  }
  await cf(`/zones/${zoneId}/workers/routes`, { method: 'POST', body })
  return { pattern, action: 'created' }
}

async function updateRegistrarNameservers(zone) {
  const hosts = zone.name_servers || []
  if (hosts.length < 2) return { action: 'skipped', reason: 'Cloudflare nameservers are not available yet' }
  let current
  try {
    current = await spaceship(`/domains/${domain}`)
  } catch (error) {
    return { action: 'blocked_domain_lookup', reason: error.message }
  }
  const payload = current.nameservers || current.result?.nameservers || []
  const currentHosts = Array.isArray(payload) ? payload : payload.hosts || []
  const normalizedCurrent = currentHosts.map((item) => String(item).toLowerCase()).sort()
  const normalizedTarget = hosts.map((item) => String(item).toLowerCase()).sort()
  if (JSON.stringify(normalizedCurrent) === JSON.stringify(normalizedTarget)) return { action: 'existing', hosts }
  await spaceship(`/domains/${domain}/nameservers`, {
    method: 'PUT',
    body: JSON.stringify({ provider: 'custom', hosts }),
  })
  return { action: 'updated', hosts }
}

async function registrarNameserverStatus() {
  try {
    const current = await spaceship(`/domains/${domain}`)
    const payload = current.nameservers || current.result?.nameservers || []
    const hosts = Array.isArray(payload) ? payload : payload.hosts || []
    return { status: 'read', hosts }
  } catch (error) {
    return { status: 'blocked_domain_lookup', reason: error.message }
  }
}

async function zoneStatus(zone, created) {
  const zoneId = zone.id
  const [dnsRows, routes, ssl, alwaysHttps, rewrites, universalSsl, certificatePacks, registrar] = await Promise.all([
    cf(`/zones/${zoneId}/dns_records?per_page=100`),
    cf(`/zones/${zoneId}/workers/routes?per_page=100`),
    cf(`/zones/${zoneId}/settings/ssl`),
    cf(`/zones/${zoneId}/settings/always_use_https`),
    cf(`/zones/${zoneId}/settings/automatic_https_rewrites`),
    cf(`/zones/${zoneId}/ssl/universal/settings`),
    cf(`/zones/${zoneId}/ssl/certificate_packs?per_page=20`),
    registrarNameserverStatus(),
  ])
  return {
    domain,
    workerName,
    zoneCreated: created,
    zoneStatus: zone.status,
    nameservers: zone.name_servers || [],
    ssl: ssl.result?.value || '',
    alwaysUseHttps: alwaysHttps.result?.value || '',
    automaticHttpsRewrites: rewrites.result?.value || '',
    universalSsl: universalSsl.result?.enabled ?? '',
    certificatePacks: (certificatePacks.result || []).map((pack) => ({
      type: pack.type,
      status: pack.status,
      validationMethod: pack.validation_method,
      hosts: pack.hosts || [],
    })),
    registrar,
    dns: (dnsRows.result || []).filter((record) => [canonicalHost, wwwHost].includes(record.name)).map((record) => ({
      name: record.name,
      type: record.type,
      content: record.content,
      proxied: record.proxied,
    })),
    routes: (routes.result || []).filter((route) => route.pattern.includes(domain)).map((route) => ({
      pattern: route.pattern,
      script: route.script,
    })),
  }
}

async function main() {
  const id = await accountId()
  const { zone, created } = await ensureZone(id)
  if (statusOnly) {
    console.log(JSON.stringify(await zoneStatus(zone, created), null, 2))
    return
  }
  const zoneId = zone.id
  await Promise.all([
    putZoneSetting(zoneId, 'ssl', 'full'),
    putZoneSetting(zoneId, 'always_use_https', 'on'),
    putZoneSetting(zoneId, 'automatic_https_rewrites', 'on'),
  ])
  const dnsActions = [
    await ensureDnsRecord(zoneId, canonicalHost),
    await ensureDnsRecord(zoneId, wwwHost),
  ]
  const routeActions = [
    await ensureWorkerRoute(zoneId, `${canonicalHost}/*`),
    await ensureWorkerRoute(zoneId, `${wwwHost}/*`),
  ]
  const registrar = await updateRegistrarNameservers(zone)
  console.log(JSON.stringify({
    ...(await zoneStatus(zone, created)),
    dnsActions,
    routeActions,
    registrar,
  }, null, 2))
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
