import type { Abi } from 'viem'

import keepUpAbi from '@/abi/KeepUp.json'

export const KEEPUP_ABI = keepUpAbi as Abi

export const getKeepUpContractConfig = (address: `0x${string}`) => ({
  address,
  abi: KEEPUP_ABI,
}) as const

