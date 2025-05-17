import type { Metadata, Viewport } from 'next'

const base = process.env['NEXT_PUBLIC_URL']?.replace(/\/$/, '')
if (!base) throw new Error('NEXT_PUBLIC_URL must be defined.')

const get = (k: string) => process.env[k]?.trim() || ''

export const siteMeta = {
  origin: base,
  name: get('NEXT_PUBLIC_NAME'),
  title: get('NEXT_PUBLIC_TITLE'),
  tagline: get('NEXT_PUBLIC_TAGLINE'),
  description: get('NEXT_PUBLIC_DESC'),
  subtitle: get('FARCASTER_BUTTON'),
  category: get('FARCASTER_CATEGORY'),
  tags: get('FARCASTER_TAGS'),
  twitter: get('NEXT_PUBLIC_TWITTER'),
  manifest: `${base}/manifest`,
  icon: `${base}/branding/logo/logo_flat.png`,
  favicon: `${base}/favicon.ico`,
  appleIcon: `${base}/apple-touch-icon.png`,
  svgIcon: `${base}/branding/logo/logo.svg`,
  image: `${base}/branding/banners/540x360.png`,
  splash: `${base}/branding/app/200x200.gif`,
  splashBg: `#${get('NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR')}`,
  screenshots: Array.from({ length: 3 }, (_, i) => `${base}/branding/app/1284x2778_${i + 1}.png`),
}

export const frameConfig = {
  version: 'next',
  imageUrl: siteMeta.image,
  button: {
    title: siteMeta.subtitle,
    action: {
      type: 'launch_frame',
      url: siteMeta.origin,
      name: siteMeta.name,
      splashImageUrl: siteMeta.splash,
      splashBackgroundColor: siteMeta.splashBg,
    },
  },
}

export const farcasterConfig = {
  version: '1',
  name: siteMeta.name,
  iconUrl: siteMeta.icon,
  splashImageUrl: siteMeta.splash,
  splashBackgroundColor: siteMeta.splashBg,
  homeUrl: siteMeta.origin,
  subtitle: siteMeta.subtitle,
  description: siteMeta.description,
  screenshotUrls: siteMeta.screenshots.map((i) => i),
  primaryCategory: siteMeta.category,
  tags: typeof siteMeta.tags === 'string' ? JSON.parse(siteMeta.tags) : siteMeta.tags,
  heroImageUrl: siteMeta.image,
  tagline: siteMeta.tagline,
  ogTitle: siteMeta.name,
  ogDescription: siteMeta.description,
  ogImageUrl: siteMeta.image,
  noindex: false
}

export const ogConfig = {
  openGraph: {
    type: 'website',
    siteName: siteMeta.name,
    locale: 'en_US',
    title: siteMeta.title,
    description: siteMeta.description,
    url: siteMeta.origin,
    images: [{ url: `${base}/branding/banners/1200x630.png`, width: 1200, height: 630, alt: siteMeta.name }],
  },
  twitter: {
    card: 'summary_large_image',
    site: siteMeta.twitter,
    title: siteMeta.title,
    description: siteMeta.description,
    images: [`${base}/branding/banners/1200x630.png`],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL(siteMeta.origin),
    title: siteMeta.title,
    description: siteMeta.description,
    referrer: 'strict-origin-when-cross-origin',
    manifest: siteMeta.manifest,
    icons: {
      icon: [
        { url: siteMeta.favicon },
        { url: siteMeta.svgIcon, type: 'image/svg+xml' },
      ],
      apple: [{ url: siteMeta.appleIcon, sizes: '180x180' }],
    },
    ...ogConfig,
  }
}
