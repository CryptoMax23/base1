const liveTokens: { [fid: string]: { token: string; url: string } } = {}
export const runtime = 'edge'
export async function POST(req: Request) {
  const body = await req.json()
  const event = body['event']
  const fid = body['fid']?.toString() || 'unknown'
  const origin = process.env['NEXT_PUBLIC_URL']?.replace(/\/$/, '')
  if (!origin) throw new Error('Missing NEXT_PUBLIC_URL')
  if (event === 'notifications_enabled' && body['notificationDetails']) {
    const token = body['notificationDetails']['token']
    const url = body['notificationDetails']['url']
    liveTokens[fid] = { token, url }
    fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', },
      body: JSON.stringify({
        notificationId: `notif-onboard-${fid}`,
        title: '💜 Notifications are now enabled.',
        body: 'Thanks for caring- we appreciate you!',
        targetUrl: origin,
      }), }).catch((e) => console.error(e))
  }
  if (event === 'notifications_disabled' || event === 'frame_removed') delete liveTokens[fid]
  return new Response('ok')
}
