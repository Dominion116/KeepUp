import { useReadContract, useWriteContract, useAccount, useBalance } from 'wagmi'
import type { Abi } from 'viem'

/**
 * Hook to read data from a smart contract
 */
export function useContractRead({
  abi,
  address,
  functionName,
  args,
  enabled = true,
}: {
  abi: Abi
  address: `0x${string}`
  functionName: string
  args?: unknown[]
  enabled?: boolean
}) {
  return useReadContract({
    abi,
    address,
    functionName,
    args,
    query: {
      enabled,
    },
  })
}

/**
 * Hook to write to a smart contract
 */
export function useContractWrite({
  abi,
  address,
  functionName,
}: {
  abi: Abi
  address: `0x${string}`
  functionName: string
}) {
  const { writeContract, isPending, error } = useWriteContract()

  const write = (args?: unknown[]) => {
    writeContract({
      abi,
      address,
      functionName,
      args,
    })
  }

  return { write, isPending, error }
}

/**
 * Hook to get the connected wallet account and balance
 */
export function useWalletInfo() {
  const { address, isConnected, isConnecting } = useAccount()
  const { data: balance, isLoading: isLoadingBalance } = useBalance({
    address,
  })

  return {
    address,
    isConnected,
    isConnecting,
    balance: balance?.formatted || '0',
    balanceSymbol: balance?.symbol || 'ETH',
    isLoadingBalance,
  }
}

export { useAccount, useBalance, useReadContract, useWriteContract }
