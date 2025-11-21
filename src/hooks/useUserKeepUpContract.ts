import { useMemo } from 'react'
import { useAccount, useReadContract } from 'wagmi'

import { ZERO_ADDRESS } from '@/lib/constants'
import { KEEPUP_FACTORY_CONTRACT } from '@/lib/keepUpFactory'

export const useUserKeepUpContract = () => {
  const account = useAccount()

  const contractsQuery = useReadContract({
    ...KEEPUP_FACTORY_CONTRACT,
    functionName: 'getUserContracts',
    args: [account.address ?? ZERO_ADDRESS],
    query: {
      enabled: Boolean(account.address),
    },
  })

  const contractAddress = useMemo(() => {
    if (!contractsQuery.data || !Array.isArray(contractsQuery.data)) return undefined
    const [firstContract] = contractsQuery.data as `0x${string}`[]
    return firstContract
  }, [contractsQuery.data])

  return {
    ...account,
    contractAddress,
    hasDeployment: Boolean(contractAddress),
    isLoadingContracts: contractsQuery.isFetching,
    refetchContracts: contractsQuery.refetch,
  }
}

