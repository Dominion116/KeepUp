export const CHAIN_IDS = {
  baseMainnet: 8453,
  baseTestnet: 84532,
};

export const RPC_URLS = {
  [CHAIN_IDS.baseMainnet]: 'https://mainnet.base.org',
  [CHAIN_IDS.baseTestnet]: 'https://sepolia.base.org',
};

export const BLOCK_EXPLORERS = {
  [CHAIN_IDS.baseMainnet]: 'https://basescan.org',
  [CHAIN_IDS.baseTestnet]: 'https://sepolia.basescan.org',
};

export const BASE_MAINNET_CONFIG = {
  chainId: CHAIN_IDS.baseMainnet,
  name: 'Base',
  ticker: 'ETH',
  atomicUnit: 'wei',
  decimals: 18,
  rpcUrl: RPC_URLS[CHAIN_IDS.baseMainnet],
  explorerUrl: BLOCK_EXPLORERS[CHAIN_IDS.baseMainnet]
}

export const BASE_TESTNET_CONFIG = {
  chainId: CHAIN_IDS.baseTestnet,
  name: 'Base Sepolia',
  ticker: 'ETH',
  atomicUnit: 'wei',
  decimals: 18,
  rpcUrl: RPC_URLS[CHAIN_IDS.baseTestnet],
  explorerUrl: BLOCK_EXPLORERS[CHAIN_IDS.baseTestnet]
}

export type NetworkConfig = typeof BASE_MAINNET_CONFIG

export const getNetworkConfig = (): NetworkConfig => {
  return BASE_MAINNET_CONFIG
}

export const KEEPUP_FACTORY_ADDRESS = '0x6bc42F70639cC7B64501dCF7Ee69B06628AAf1BA' as `0x${string}`