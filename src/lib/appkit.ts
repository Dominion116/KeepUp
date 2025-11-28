import { createAppKit } from '@reown/appkit/react'
import { mainnet, arbitrum, base, polygon, sepolia } from '@reown/appkit/networks'
import { QueryClient } from '@tanstack/react-query'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'


const queryClient = new QueryClient()

const projectId = import.meta.env.VITE_REOWN_PROJECT_ID

if (!projectId) {
  throw new Error('VITE_REOWN_PROJECT_ID is not set in environment variables')
}

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
  networks: networks as [typeof mainnet, ...typeof networks],
  projectId,
  ssr: false
})

// Create the AppKit modal
createAppKit({
  adapters: [wagmiAdapter],
  networks: networks as [typeof mainnet, ...typeof networks],
  projectId,
  metadata,
  features: {
    analytics: true
  },
  themeMode: 'light',
  themeVariables: {
    // Typography - Match your app fonts
    '--w3m-font-family': "'Inter', system-ui, sans-serif",
    '--w3m-font-size-master': '12px',
    
    // Border Radius - Match your app's 0.75rem
    '--w3m-border-radius-master': '0.75rem',
    
    // Colors - Match your design system
    '--w3m-accent': 'hsl(262 83% 58%)', // Primary purple
  }
})

export { wagmiAdapter, queryClient }
