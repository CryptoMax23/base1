'use client';

import { useEffect, useMemo, type ReactNode } from 'react';
import { WagmiProvider, createConfig, cookieStorage, createStorage, http, useConnect } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { MiniKitProvider } from '@coinbase/onchainkit/minikit';
import { farcasterFrame } from '@farcaster/frame-wagmi-connector';
import { coinbaseWallet, injected } from 'wagmi/connectors';
import sdk from '@farcaster/frame-sdk';
import {
  base, mainnet, optimism, arbitrum, polygon,
  gnosis, zora, unichain, degen, monadTestnet
} from 'wagmi/chains';

const s = (v?: string) => (v ?? '').replace(/[^\x00-\xFF]/g, '')
const env = {
  name: s(process.env['NEXT_PUBLIC_NAME']) || 'Districs',
  logo: s(process.env['NEXT_PUBLIC_ICON']),
  ockId: s(process.env['NEXT_PUBLIC_OCK_ID']),
  apiKey: s(process.env['OCK_KEY']),
  rpc: process.env['BASE_RPC'] || 'https://mainnet.base.org'
}

const appearance = { name: env.name, logo: env.logo, mode: 'auto' as const, theme: 'snake' as const }

const connectors = [
  farcasterFrame(),
  coinbaseWallet({ appName: env.name, ...(env.logo ? { appLogoUrl: env.logo } : {}) }),
  injected()
]

const transports = {
  [base.id]: http(env.rpc),
  [mainnet.id]: http(),
  [optimism.id]: http(),
  [arbitrum.id]: http(),
  [polygon.id]: http(),
  [gnosis.id]: http(),
  [zora.id]: http(),
  [unichain.id]: http(),
  [degen.id]: http(),
  [monadTestnet.id]: http(),
}

function AutoConnect() {
  const { connect, connectors, status } = useConnect()
  useEffect(() => {
    (async () => {
      try { const ctx = await sdk.context; if (ctx?.user?.fid) return } catch {}
      const id = navigator.userAgent.includes('Farcaster') ? 'farcasterFrame' :
                 navigator.userAgent.includes('CoinbaseWallet') ? 'coinbaseWallet' : 'injected'
      const connector = connectors.find(c => c.id === id)
      if (connector && status === 'idle') connect({ connector })
    })()
  }, [connect, connectors, status])
  return null
}

export function Context({ children }: { children: ReactNode }) {
  const queryClient = useMemo(() => new QueryClient(), [])
  const config = useMemo(() => createConfig({
    chains: [base, mainnet, optimism, arbitrum, polygon, gnosis, zora, unichain, degen, monadTestnet],
    connectors, transports,
    storage: createStorage({ storage: cookieStorage }),
    ssr: true,
  }), [])
  
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider apiKey={env.apiKey} chain={base} config={{ appearance }}>
          <MiniKitProvider projectId={env.ockId} apiKey={env.apiKey} chain={base} config={{ appearance }}>
            <AutoConnect />
            {children}
          </MiniKitProvider>
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
