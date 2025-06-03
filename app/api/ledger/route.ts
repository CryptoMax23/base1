import { NextResponse } from 'next/server'
import Bottleneck from 'bottleneck'

export const runtime = 'edge'

const API = 'https://api.exchange.coinbase.com'
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
const limiter = new Bottleneck({
  reservoir: 30,
  reservoirRefreshAmount: 30,
  reservoirRefreshInterval: 2000,
  maxConcurrent: 5
})
async function sign(
  path: string,
  method: 'GET' | 'POST' | 'HEAD' = 'GET',
  body = ''
) {
  const ts = Math.floor(Date.now() / 1e3).toString()
  const pre = ts + method + path + body
  const keyData = Uint8Array.from(atob(process.env['CBE_SECRET']!), c => c.charCodeAt(0))
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sigBuf = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(pre))
  return { ts, sig: btoa(String.fromCharCode(...new Uint8Array(sigBuf))) }
}
async function apiRequest(
  path: string,
  method: 'GET' | 'POST' | 'HEAD' = 'GET',
  body = '',
  tries = 5
): Promise<Response> {
  for (let i = 0; i < tries; i++) {
    const { ts, sig } = await sign(path, method, body)
    const headers = {
      'CB-ACCESS-KEY':        process.env['CBE_KEY']!,
      'CB-ACCESS-SIGN':       sig,
      'CB-ACCESS-TIMESTAMP':  ts,
      'CB-ACCESS-PASSPHRASE': process.env['CBE_PASSPHRASE']!,
      Accept:                 'application/json',
      'Content-Type':         'application/json'
    }
    const init: RequestInit = { method, headers }
    if (method === 'POST' && body) init.body = body
    const res = await limiter.schedule(() => fetch(API + path, init))
    if (res.status === 429) {
      await sleep((2 ** i) * 100 + Math.random() * 100)
      continue
    }
    return res
  }
  throw new Error('Rate limit: retries exhausted')
}
async function apiFetch<T>(
  path: string,
  method: 'GET' | 'POST' = 'GET',
  body = ''
): Promise<T> {
  const res = await apiRequest(path, method, body)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
interface ExchangeAccount {
  id: string
  currency: string
  available: string
}
interface LedgerRaw {
  id: string
  amount: string
  created_at: string
  type: string
  details: { transfer_id?: string; transfer_type: string }
}
interface TransferDetail {
  details: Record<string, unknown>
  completed_at: string
}
interface LedgerItem {
  amount: number
  action: [string, string]
  network: string
  hash: string | null
  timestamp: string
}
async function fetchLedger(accountId: string, cutoff: Date): Promise<LedgerRaw[]> {
  const out: LedgerRaw[] = []
  let after: string | null = null
  do {
    const qs = `start_date=${cutoff.toISOString()}&limit=1000${after ? `&after=${after}` : ''}`
    const path = `/accounts/${accountId}/ledger?${qs}`
    const page = await apiFetch<LedgerRaw[]>(path)
    out.push(...page)
    const head = await apiRequest(path, 'HEAD')
    after = head.headers.get('CB-AFTER')
    if (!page.length || new Date(page.at(-1)!.created_at) < cutoff) break
  } while (after)
  return out
}
export async function GET(req: Request) {
  const accept = req.headers.get('accept') ?? ''
  const accounts = await apiFetch<ExchangeAccount[]>('/accounts')
  const active = accounts.filter(a => parseFloat(a.available) > 0)
  const cutoff = new Date()
  cutoff.setFullYear(cutoff.getFullYear() - 3)
  const rawLedgers = await Promise.all(active.map(a => fetchLedger(a.id, cutoff)))
  const allEntries = rawLedgers.flat()
  const transferIds = Array.from(
    new Set(
      allEntries
        .map(e => e.details.transfer_id)
        .filter((id): id is string => Boolean(id))
    )
  )
  const transfers: Record<string, TransferDetail> = {}
  for (const tid of transferIds) {
    transfers[tid] = await apiFetch<TransferDetail>(`/transfers/${tid}`)
  }
  const results = active.map((acct, i) => {
    const ledger = rawLedgers[i].map(e => {
      const d = e.details.transfer_id ? transfers[e.details.transfer_id]! : null
      return {
        amount: +e.amount,
        action: [e.type, e.details.transfer_type] as [string, string],
        network: 'base',
        hash:
          typeof d?.details['crypto_transaction_hash'] === 'string'
            ? (d.details['crypto_transaction_hash'] as string)
            : null,
        timestamp: d?.completed_at || e.created_at
      }
    })
    return {
      token: acct.currency,
      balance: acct.available,
      route_id: acct.id,
      ledger
    }
  })
  if (accept.includes('text/html')) {
    const esc = (s: string) => s.replace(/</g, '&lt;').replace(/>/g, '&gt;')
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Ledger</title>
      <style>
        body{margin:0 auto;padding:1rem;max-width:960px;font-family:sans-serif}
        table{width:100%;border-collapse:collapse;font-size:.85rem}
        th,td{padding:4px 6px;border-bottom:1px solid #999;text-align:left}
        a{color:#06c;word-break:break-all}
      </style></head><body>${
      results
        .map(r => {
          const byDay = r.ledger.reduce((g, e) => {
            const d = new Date(e.timestamp).toLocaleDateString('en-US')
            ;(g[d] ||= []).push(e)
            return g
          }, {} as Record<string, LedgerItem[]>)
          return `<h2>${r.token} (${r.balance})</h2>` +
            Object.entries(byDay)
              .sort(([a], [b]) => +new Date(a) - +new Date(b))
              .map(([d, entries], idx) => `
                <h4>${d}${idx ? ` (${r.token}, cont.)` : ''}</h4>
                <table><thead><tr><th>Amt</th><th>Act</th><th>Net</th><th>Hash</th></tr></thead>
                  <tbody>${entries
                    .map(e => `<tr><td>${e.amount}</td><td>${e.action[1]}</td><td>${e.network}</td>
                      <td>${
                        e.hash
                          ? `<a href="https://basescan.org/tx/${esc(e.hash)}">${esc(e.hash)}</a>`
                          : 'Interest Paid'
                      }</td></tr>`)
                    .join('')}
                  </tbody>
                </table>`
              )
              .join('') +
            `<div style="font-size:.75rem;margin-top:.5rem;color:#555">
               Route ID: ${r.route_id}
             </div>`
        })
        .join('')
    }</body></html>`
    return new Response(html, { headers: { 'Content-Type': 'text/html' } })
  }
  return NextResponse.json(results)
}
