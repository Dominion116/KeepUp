import { useEffect, useMemo, useState } from 'react'
import { parseAbiItem } from 'viem'
import { usePublicClient } from 'wagmi'

export type RewardHistoryEntry = {
  amount: bigint
  dayNumber: bigint
  streak: bigint
  txHash: `0x${string}`
}

const rewardClaimedEvent = parseAbiItem(
  'event RewardClaimed(address indexed user, uint256 amount, uint256 dayNumber, uint256 newStreak)'
)

export const useRewardHistory = (contractAddress?: `0x${string}`, userAddress?: `0x${string}`) => {
  const publicClient = usePublicClient()
  const [history, setHistory] = useState<RewardHistoryEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [refreshIndex, setRefreshIndex] = useState(0)

  useEffect(() => {
    if (!publicClient || !contractAddress || !userAddress) return

    let cancelled = false
    const fetchLogs = async () => {
      setIsLoading(true)
      try {
        const logs = await publicClient.getLogs({
          address: contractAddress,
          event: rewardClaimedEvent,
          args: { user: userAddress },
          fromBlock: 0n,
          toBlock: 'latest',
        })

        if (cancelled) return

        const parsed = logs
          .map((log) => ({
            amount: (log.args?.amount ?? 0n) as bigint,
            dayNumber: (log.args?.dayNumber ?? 0n) as bigint,
            streak: (log.args?.newStreak ?? 0n) as bigint,
            txHash: log.transactionHash,
          }))
          .sort((a, b) => Number(b.dayNumber - a.dayNumber))

        setHistory(parsed)
        setError(null)
      } catch (err) {
        if (!cancelled) {
          setError(err as Error)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchLogs()

    return () => {
      cancelled = true
    }
  }, [publicClient, contractAddress, userAddress, refreshIndex])

  const refetch = () => setRefreshIndex((index) => index + 1)

  const totalRewardsClaimed = useMemo(() => {
    return history.reduce((total, entry) => total + entry.amount, 0n)
  }, [history])

  return { history, isLoading, error, refetch, totalRewardsClaimed }
}

