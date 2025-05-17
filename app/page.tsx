'use client'

import { useEffect, useState } from 'react'
import Render from './components/map'
import Windows from './components/windows'
import Overlay from './components/overlay'
import Notices from './components/notices'
import { useMiniKit } from '@coinbase/onchainkit/minikit'
import { sdk } from '@farcaster/frame-sdk'

export default function App() {
  const [mounted, setMounted] = useState(false)
  const { setFrameReady, isFrameReady } = useMiniKit()
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault()
    setMounted(true)
    document.addEventListener('contextmenu', handleContextMenu)
    return () => { document.removeEventListener('contextmenu', handleContextMenu) }
  }, [])
  useEffect(() => {
    if (!isFrameReady) setFrameReady()
    sdk.actions.ready({ disableNativeGestures: true })
  }, [isFrameReady, setFrameReady])
  if (!mounted) return null
  return (<>
      <Render />
      <Windows />
      <Overlay />
      <Notices />
</>)}
