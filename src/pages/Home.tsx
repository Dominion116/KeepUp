import React, { useMemo } from 'react'
import { formatEther } from 'viem'
import { usePublicClient, useReadContract, useReadContracts, useWriteContract } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar, CheckCircle, Loader2, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { useUserKeepUpContract } from '@/hooks/useUserKeepUpContract'
import { KEEPUP_ABI } from '@/lib/keepUp'
import { ZERO_ADDRESS, getCurrentUnixDay } from '@/lib/constants'

type ChainTask = {
  id: bigint
  name: string
  active: boolean
  createdAt: bigint
}

const Home: React.FC = () => {
  const { toast } = useToast()
  const publicClient = usePublicClient()
  const { writeContractAsync, isPending: isClaiming } = useWriteContract()
  const { address, isConnected, isConnecting, contractAddress, hasDeployment, isLoadingContracts } =
    useUserKeepUpContract()

  const keepUpAddress = contractAddress ?? ZERO_ADDRESS

  const tasksQuery = useReadContract({
    abi: KEEPUP_ABI,
    address: keepUpAddress,
    functionName: 'getUserTasks',
    args: [address ?? ZERO_ADDRESS],
    query: {
      enabled: Boolean(address && contractAddress),
    },
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

  const chainTasks: ChainTask[] = useMemo(() => {
    if (!tasksQuery.data || !Array.isArray(tasksQuery.data)) return []
    return (tasksQuery.data as any[]).map((task) => ({
      id: BigInt(task.id ?? task[0] ?? 0n),
      name: (task.name ?? task[1] ?? '') as string,
      active: Boolean(task.active ?? task[2]),
      createdAt: BigInt(task.createdAt ?? task[3] ?? 0n),
    }))
  }, [tasksQuery.data])

  const activeTasks = useMemo(() => chainTasks.filter((task) => task.active), [chainTasks])

  const statusContracts = useMemo(() => {
    if (!address || !contractAddress) return []
    return activeTasks.map((task) => ({
      abi: KEEPUP_ABI,
      address: contractAddress,
      functionName: 'getTaskStatus',
      args: [address, task.id],
    }))
  }, [activeTasks, address, contractAddress])

  const statusesQuery = useReadContracts({
    contracts: statusContracts,
    query: {
      enabled: statusContracts.length > 0,
    },
  })

  const currentDay = getCurrentUnixDay()

  const completedTaskIds = useMemo(() => {
    if (!statusesQuery.data) return new Set<bigint>()
    const completed = new Set<bigint>()
    statusesQuery.data.forEach((entry, index) => {
      const result = entry?.result as bigint | undefined
      const task = activeTasks[index]
      if (result !== undefined && task && result === currentDay) {
        completed.add(task.id)
      }
    })
    return completed
  }, [statusesQuery.data, activeTasks, currentDay])

  const completedCount = completedTaskIds.size
  const progress = activeTasks.length > 0 ? (completedCount / activeTasks.length) * 100 : 0

  const streak = Number(streakValue)
  const bonusPercent = Number(bonusPercentQuery.data ?? 0n)
  const dailyRewardWei = (dailyRewardQuery.data ?? 0n) as bigint
  const lastClaimDay = (lastClaimDayQuery.data ?? 0n) as bigint

  const pendingRewardWei =
    lastClaimDay === currentDay ? 0n : (dailyRewardWei * (100n + BigInt(bonusPercent))) / 100n

  const pendingRewardDisplay = formatEther(pendingRewardWei)

  const isLoading =
    isLoadingContracts ||
    tasksQuery.isFetching ||
    statusesQuery.isFetching ||
    streakQuery.isFetching ||
    bonusPercentQuery.isFetching ||
    dailyRewardQuery.isFetching ||
    lastClaimDayQuery.isFetching

  const hasTasks = activeTasks.length > 0

  const disableClaim = !isConnected || !hasDeployment || pendingRewardWei === 0n || isClaiming

  const handleClaimReward = async () => {
    if (!contractAddress) return

    try {
      const hash = await writeContractAsync({
        abi: KEEPUP_ABI,
        address: contractAddress,
        functionName: 'claimReward',
      })
      toast({
        title: 'Reward claim submitted',
        description: hash,
      })
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash })
      }
      await Promise.all([
        lastClaimDayQuery.refetch(),
        streakQuery.refetch(),
        bonusPercentQuery.refetch(),
      ])
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      toast({
        title: 'Failed to claim reward',
        description: message,
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="grid gap-6">
        {/* Daily Summary */}
        <Card className="bg-gradient-subtle border-0">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Today&apos;s Progress</CardTitle>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Calendar size={18} />
                <span>{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={progress} className="h-3" />
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {!isConnected
                    ? 'Connect your wallet to view progress.'
                    : !hasDeployment
                      ? 'Deploy a KeepUp contract to start tracking.'
                      : hasTasks
                        ? `${completedCount} of ${activeTasks.length} tasks completed today`
                        : isLoading
                          ? 'Loading tasks…'
                          : 'No active tasks yet.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks List */}
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            {!isConnected && (
              <p className="text-sm text-muted-foreground">Connect your wallet to load today&apos;s tasks.</p>
            )}
            {isConnected && !hasDeployment && (
              <p className="text-sm text-muted-foreground">
                Deploy a KeepUp contract from the Admin page to start syncing tasks.
              </p>
            )}
            {isConnected && hasDeployment && !hasTasks && !isLoading && (
              <p className="text-sm text-muted-foreground">You haven&apos;t created any tasks yet.</p>
            )}
            <div className="space-y-3">
              {activeTasks.map((task) => {
                const isCompleted = completedTaskIds.has(task.id)
                return (
                  <div
                    key={task.id.toString()}
                    className={cn(
                      'flex items-center space-x-3 p-3 rounded-lg border',
                      isCompleted ? 'bg-muted border-border' : 'bg-background border-border'
                    )}
                  >
                    <Checkbox
                      checked={isCompleted}
                      disabled
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <span className={cn('flex-1', isCompleted && 'line-through text-muted-foreground')}>
                      {task.name}
                    </span>
                    {isCompleted && <CheckCircle className="w-4 h-4 text-green-500" />}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Stats and Rewards */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Trophy className="w-5 h-5" />
                <span>Current Streak</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{isLoading ? '—' : streak}</div>
                <p className="text-sm text-muted-foreground">{isLoading ? 'Loading…' : 'days in a row'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Pending Reward</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-3">
                <div className="text-2xl font-bold text-primary">
                  {isLoading ? 'Loading…' : `${pendingRewardDisplay} ETH`}
                </div>
                <Button
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={handleClaimReward}
                  disabled={disableClaim}
                >
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
        </div>
      </div>
    </div>
  )
}

export default Home

