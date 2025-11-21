import React from 'react'
import { formatEther } from 'viem'
import { useBalance, usePublicClient, useReadContract, useWriteContract } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Gift, History, Coins, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useUserKeepUpContract } from '@/hooks/useUserKeepUpContract'
import { useRewardHistory } from '@/hooks/useRewardHistory'
import { KEEPUP_ABI } from '@/lib/keepUp'
import { ZERO_ADDRESS, getCurrentUnixDay } from '@/lib/constants'

const Rewards: React.FC = () => {
  const { toast } = useToast()
  const publicClient = usePublicClient()
  const { writeContractAsync, isPending: isClaiming } = useWriteContract()
  const { address, isConnected, contractAddress, hasDeployment, isLoadingContracts } = useUserKeepUpContract()
  const keepUpAddress = contractAddress ?? ZERO_ADDRESS

  const balanceQuery = useBalance({
    address,
    query: { enabled: Boolean(address) },
  })

  const streakQuery = useReadContract({
    abi: KEEPUP_ABI,
    address: keepUpAddress,
    functionName: 'streak',
    args: [address ?? ZERO_ADDRESS],
    query: { enabled: Boolean(address && contractAddress) },
  })

  const streakValue = (streakQuery.data ?? 0n) as bigint

  const bonusPercentQuery = useReadContract({
    abi: KEEPUP_ABI,
    address: keepUpAddress,
    functionName: 'getBonusPercent',
    args: [streakValue],
    query: { enabled: Boolean(contractAddress) },
  })

  const dailyRewardQuery = useReadContract({
    abi: KEEPUP_ABI,
    address: keepUpAddress,
    functionName: 'dailyReward',
    query: { enabled: Boolean(contractAddress) },
  })

  const lastClaimDayQuery = useReadContract({
    abi: KEEPUP_ABI,
    address: keepUpAddress,
    functionName: 'lastClaimDay',
    args: [address ?? ZERO_ADDRESS],
    query: { enabled: Boolean(address && contractAddress) },
  })

  const { history, isLoading: isLoadingHistory, error: historyError, refetch: refetchHistory, totalRewardsClaimed } =
    useRewardHistory(contractAddress, address)

  const currentDay = getCurrentUnixDay()
  const bonusPercent = Number(bonusPercentQuery.data ?? 0n)
  const dailyRewardWei = (dailyRewardQuery.data ?? 0n) as bigint
  const lastClaimDay = (lastClaimDayQuery.data ?? 0n) as bigint
  const pendingRewardWei =
    lastClaimDay === currentDay ? 0n : (dailyRewardWei * (100n + BigInt(bonusPercent))) / 100n
  const pendingRewardDisplay = formatEther(pendingRewardWei)
  const balanceDisplay = balanceQuery.data ? `${balanceQuery.data.formatted} ${balanceQuery.data.symbol}` : '0'
  const totalRewardsDisplay = formatEther(totalRewardsClaimed)

  const disableClaim = !isConnected || !hasDeployment || pendingRewardWei === 0n || isClaiming
  const isLoading =
    isLoadingContracts ||
    streakQuery.isFetching ||
    bonusPercentQuery.isFetching ||
    dailyRewardQuery.isFetching ||
    lastClaimDayQuery.isFetching

  const formatDay = (dayNumber: bigint) => {
    if (!dayNumber) return '—'
    const date = new Date(Number(dayNumber) * 86_400_000)
    return date.toLocaleDateString()
  }

  const handleClaimReward = async () => {
    if (!contractAddress) return

    try {
      const hash = await writeContractAsync({
        abi: KEEPUP_ABI,
        address: contractAddress,
        functionName: 'claimReward',
      })
      toast({ title: 'Reward claim submitted', description: hash })
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash })
      }
      await Promise.all([
        lastClaimDayQuery.refetch(),
        streakQuery.refetch(),
        bonusPercentQuery.refetch(),
        refetchHistory(),
      ])
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to claim reward.'
      toast({ title: 'Claim failed', description: message, variant: 'destructive' })
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="grid gap-6">
        {/* Balance Card */}
        <Card className="bg-gradient-subtle border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Coins size={20} />
              <span>Wallet Balance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {balanceQuery.isLoading ? 'Loading…' : balanceDisplay}
              </div>
              {!isConnected && <p className="text-sm text-muted-foreground mt-2">Connect a wallet to view balance.</p>}
            </div>
          </CardContent>
        </Card>

        {/* Pending Reward */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Gift size={20} />
              <span>Pending Reward</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="text-2xl font-bold text-primary">
                {isLoading ? 'Loading…' : `${pendingRewardDisplay} ETH`}
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90" onClick={handleClaimReward} disabled={disableClaim}>
                {isClaiming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Claim Reward
              </Button>
              {!isConnected && (
                <p className="text-xs text-muted-foreground">Connect your wallet to claim rewards.</p>
              )}
              {isConnected && hasDeployment && pendingRewardWei === 0n && (
                <p className="text-xs text-muted-foreground">You&apos;ve already claimed today&apos;s reward.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Reward History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <History size={20} />
              <span>Reward History</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!isConnected && (
              <p className="text-sm text-muted-foreground">Connect your wallet to load reward history.</p>
            )}
            {isConnected && !hasDeployment && (
              <p className="text-sm text-muted-foreground">
                Deploy a KeepUp contract to start earning and tracking rewards.
              </p>
            )}
            {historyError && (
              <p className="text-sm text-destructive">Failed to load reward history: {historyError.message}</p>
            )}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">Lifetime Rewards</span>
              <span className="text-base font-semibold">{totalRewardsDisplay} ETH</span>
            </div>
            {isLoadingHistory && (
              <div className="text-sm text-muted-foreground">Loading on-chain activity…</div>
            )}
            {!isLoadingHistory && history.length === 0 && hasDeployment && (
              <p className="text-sm text-muted-foreground">No rewards claimed yet.</p>
            )}
            <div className="space-y-3">
              {history.slice(0, 10).map((reward) => (
                <div
                  key={reward.txHash}
                  className="flex items-center justify-between p-3 rounded-lg border border-border"
                >
                  <div>
                    <div className="font-medium">{formatDay(reward.dayNumber)}</div>
                    <div className="text-sm text-muted-foreground">Streak: {Number(reward.streak)}</div>
                  </div>
                  <div className="text-primary font-semibold">{formatEther(reward.amount)} ETH</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Rewards

