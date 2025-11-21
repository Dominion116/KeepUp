import type { Abi } from 'viem'

import keepUpFactoryAbi from '@/abi/KeepUpFactory.json'
import { KEEPUP_FACTORY_ADDRESS } from '@/lib/config'

export const KEEPUP_FACTORY_ABI = keepUpFactoryAbi as Abi

export const KEEPUP_FACTORY_CONTRACT = {
  address: KEEPUP_FACTORY_ADDRESS,
  abi: KEEPUP_FACTORY_ABI,
} as const
