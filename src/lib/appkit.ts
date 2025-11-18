import { createAppKit } from '@reown/appkit/react'
import { WagmiProvider } from 'wagmi'
import { mainnet, arbitrum, base, polygon, sepolia } from '@reown/appkit/networks'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'


const queryClient = new QueryClient()

const projectId = '3a0cf5425c16c97c478ab0aea10aff36'

// Create metadata object
const metadata = {
  name: 'KeepUp',
  description: 'A blockchain-based task management and rewards platform',
  url: 'https://keepup.app',
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}

// Set the networks - supports EVM chains
const networks = [mainnet, arbitrum, base, polygon, sepolia]

// Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: false
})

// Create the AppKit modal
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
  features: {
    analytics: true
  }
})

export { wagmiAdapter, queryClient }
