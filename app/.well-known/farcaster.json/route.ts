import { farcasterConfig, siteMeta } from '../../../lib/site'
export const runtime = 'edge'
export async function GET() {
  const {
    FARCASTER_HEADER: header,
    FARCASTER_PAYLOAD: payload,
    FARCASTER_SIGNATURE: signature,
  } = process.env
  return Response.json({
    accountAssociation: { header, payload, signature },
    frame: {
      ...farcasterConfig,
      tags: typeof siteMeta.tags === 'string' ? JSON.parse(siteMeta.tags) : siteMeta.tags
    }
  })
}
