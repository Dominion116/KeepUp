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
    '--w3m-color-mix': 'hsl(262 83% 58%)',
    '--w3m-color-mix-strength': '40%',
    
    // Button styling - Primary button colors
    '--w3m-color-fg-1': 'hsl(240 10% 3.9%)', // Foreground text
    '--w3m-color-fg-2': 'hsl(240 5.3% 26.1%)',
    '--w3m-color-bg-1': 'hsl(262 83% 58%)', // Primary purple background
    '--w3m-color-bg-2': 'hsl(262 83% 68%)', // Lighter purple for secondary
    '--w3m-color-bg-3': 'hsl(262 83% 50%)', // Darker purple for borders
    
    // Primary action button (matches your primary button style)
    '--w3m-color-success': 'hsl(262 83% 58%)', // Primary purple
    
    // Button hover effect
    '--w3m-color-overlay': 'rgba(133, 93, 205, 0.1)', // Purple with transparency
    
    // Text colors
    '--w3m-color-fg-secondary': 'hsl(240 3.8% 46.1%)',
    
    // Border
    '--w3m-color-border': 'hsl(240 5.9% 90%)',
  }
})

export { wagmiAdapter, queryClient }
