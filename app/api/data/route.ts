import { Database } from '@cloudflare/d1';
export const runtime = 'edge';
export interface Env {
  DATA: Database | undefined;
  AUTH: Database | undefined;
}
export async function GET(req: Request, env: Env) {
  if (!env.DATA) {
    return new Response('Database connection not available (DATA)', { status: 500 });
  }
  const url = new URL(req.url);
  const r = url.searchParams.get('r');
  if (!r || !['map_spaces', 'map_parcels', 'map_zones', 'map_views', 'map_routes', 'map_points'].includes(r)) {
    return new Response('Invalid or missing table identifier!', { status: 400 });
  }
  try {
    const result = await env.DATA.prepare(`SELECT data FROM ${r} WHERE id = ?`).bind('DATA').first();
    if (result && Array.isArray(result) && result.length > 0) {
      const data = result[0].data;
      return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response('Data not found.', { status: 404 });
    }
  } catch {
    return new Response('Database query failed.', { status: 500 });
  }
}
