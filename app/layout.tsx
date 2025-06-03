import type { ReactNode } from 'react'
import { Context } from './settings/config'
import { siteMeta, frameConfig } from '../lib/site'
import '@coinbase/onchainkit/styles.css'
import '../styles/globals.css'
import '../styles/theme.css'

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>{siteMeta.title}</title>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-title" content={siteMeta.name} />
        <meta name="fc:frame" content={JSON.stringify(frameConfig)} />
        <link rel="webmanifest" href="/manifest" />
        <link rel="apple-touch-icon" href={siteMeta.appleIcon} sizes="180x180" />
      </head>
      <body className="bg-background">
        <Context>{children}</Context>
      </body>
    </html>
  )
}
