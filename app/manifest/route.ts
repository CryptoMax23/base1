import { NextResponse } from 'next/server'
import type { MetadataRoute } from 'next'
import { siteMeta } from '@/lib/site'
export const runtime = 'edge'
export function GET() {
  const origin =
    process.env['NEXT_PUBLIC_URL']?.replace(/\/$/, '') ||
    (typeof siteMeta.origin === 'string' ? siteMeta.origin.replace(/\/$/, '') : '')
  const manifest: MetadataRoute.Manifest = {
    id: '/',
    name: siteMeta.name,
    short_name: 'District',
    description: siteMeta.description,
    start_url: '/?source=pwa',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    dir: 'ltr',
    lang: 'en-US',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    prefer_related_applications: false,
    categories: [
      'arts',
      'charity',
      'community',
      'education',
      'literature',
      'nonprofit',
      'performing-arts',
      'theater',
      'visual-art'
    ],
    icons: [
      {
        src: `${origin}/branding/logo/logo.svg`,
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any'
      },
      {
        src: `${origin}/branding/logo/logo-192.png`,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: `${origin}/branding/logo/logo-512.png`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      }
    ],
    screenshots: [
      {
        src: `${origin}/app/1284x2778_1.png`,
        sizes: '1284x2778',
        type: 'image/png'
      },
      {
        src: `${origin}/app/1284x2778_2.png`,
        sizes: '1284x2778',
        type: 'image/png'
      },
      {
        src: `${origin}/app/1284x2778_3.png`,
        sizes: '1284x2778',
        type: 'image/png'
      }
    ],
    shortcuts: [
      {
        name: siteMeta.name,
        short_name: 'District',
        description: siteMeta.description,
        url: '/'
      }
    ]
  }
  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json; charset=utf-8'
    }
  })
}
