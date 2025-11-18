import React from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { wagmiAdapter, queryClient } from '@/lib/appkit'

interface AppKitProviderProps {
  children: React.ReactNode
}

/**
 * AppKitProvider wraps the application with Wagmi and Query providers
 * This enables wallet connection and contract interaction capabilities
 */
export const AppKitProvider: React.FC<AppKitProviderProps> = ({ children }) => {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default AppKitProvider
