'use client'

import { useState, useEffect } from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from '@/lib/wagmi'
import sdk from '@farcaster/miniapp-sdk'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 3,
      },
    },
  }))

  useEffect(() => {
    // Initialize Farcaster SDK as early as possible
    console.log('[Providers] Initializing Farcaster SDK...')
    try {
      sdk.actions.ready()
      console.log('[Providers] Farcaster SDK initialized successfully')
    } catch (error) {
      console.error('[Providers] Failed to initialize Farcaster SDK:', error)
    }
  }, [])

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
