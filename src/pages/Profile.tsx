import React, { useMemo } from 'react'
import { formatEther } from 'viem'
import { useReadContract, useReadContracts } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Trophy, Award, User as UserIcon } from 'lucide-react'
import { useUserKeepUpContract } from '@/hooks/useUserKeepUpContract'
import { useRewardHistory } from '@/hooks/useRewardHistory'
import { KEEPUP_ABI } from '@/lib/keepUp'
import { ZERO_ADDRESS, getCurrentUnixDay } from '@/lib/constants'
import { cn } from '@/lib/utils'

type ChainTask = {
  id: bigint
  name: string
  active: boolean
  createdAt: bigint
}

const Profile: React.FC = () => {
  const { address, isConnected, contractAddress, hasDeployment, isLoadingContracts } = useUserKeepUpContract()
  const keepUpAddress = contractAddress ?? ZERO_ADDRESS

  const tasksQuery = useReadContract({
    abi: KEEPUP_ABI,
    address: keepUpAddress,
    functionName: 'getUserTasks',
    args: [address ?? ZERO_ADDRESS],
    query: { enabled: Boolean(address && contractAddress) },
  })

  const streakQuery = useReadContract({
    abi: KEEPUP_ABI,
    address: keepUpAddress,
    functionName: 'streak',
    args: [address ?? ZERO_ADDRESS],
    query: { enabled: Boolean(address && contractAddress) },
  })

  const longestStreakQuery = useReadContract({
    abi: KEEPUP_ABI,
    address: keepUpAddress,
    functionName: 'longestStreak',
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

  const statusConfigs = useMemo(() => {
    if (!address || !contractAddress) return []
    return activeTasks.map((task) => ({
      abi: KEEPUP_ABI,
      address: contractAddress,
      functionName: 'getTaskStatus',
      args: [address, task.id],
    }))
  }, [activeTasks, address, contractAddress])

  const statusesQuery = useReadContracts({
    contracts: statusConfigs,
    query: { enabled: statusConfigs.length > 0 },
  })

  const currentDay = getCurrentUnixDay()
  const completedToday = useMemo(() => {
    if (!statusesQuery.data) return 0
    let count = 0
    statusesQuery.data.forEach((entry, index) => {
      const result = entry?.result as bigint | undefined
      const task = activeTasks[index]
      if (result !== undefined && task && result === currentDay) {
        count += 1
      }
    })
    return count
  }, [statusesQuery.data, activeTasks, currentDay])

  const {
    history,
    totalRewardsClaimed,
    isLoading: isLoadingHistory,
  } = useRewardHistory(contractAddress, address)

  const currentStreak = Number((streakQuery.data ?? 0n) as bigint)
  const longestStreak = Number((longestStreakQuery.data ?? 0n) as bigint)
  const lifetimeRewards = formatEther(totalRewardsClaimed)

  const weeklyProgress = Math.min((currentStreak % 7) / 7, 1) * 100
  const monthlyProgress = Math.min(currentStreak / 30, 1) * 100
  const completionRate = activeTasks.length > 0 ? (completedToday / activeTasks.length) * 100 : 0

  const badgeDefinitions = [
    { name: '3-Day Streak', icon: Trophy, earned: currentStreak >= 3 },
    { name: '7-Day Streak', icon: Trophy, earned: currentStreak >= 7 },
    { name: '30-Day Streak', icon: Trophy, earned: currentStreak >= 30 },
    { name: 'First Reward', icon: Award, earned: history.length > 0 },
  ]

  const isLoading =
    isLoadingContracts ||
    tasksQuery.isFetching ||
    streakQuery.isFetching ||
    longestStreakQuery.isFetching ||
    statusesQuery.isFetching ||
    isLoadingHistory

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserIcon size={20} />
              <span>Your Statistics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!isConnected && (
              <p className="text-sm text-muted-foreground">Connect your wallet to view on-chain statistics.</p>
            )}
            {isConnected && !hasDeployment && (
              <p className="text-sm text-muted-foreground">
                Deploy a KeepUp contract from the Admin page to start tracking your progress.
              </p>
            )}

            <div className="grid gap-6 md:grid-cols-2 mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Current Streak</span>
                  <span className="font-semibold">{isLoading ? '—' : `${currentStreak} days`}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Longest Streak</span>
                  <span className="font-semibold">{isLoading ? '—' : `${longestStreak} days`}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Active Tasks</span>
                  <span className="font-semibold">{isLoading ? '—' : activeTasks.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Completed Today</span>
                  <span className="font-semibold">
                    {isLoading ? '—' : `${completedToday}/${activeTasks.length || '—'}`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Lifetime Rewards</span>
                  <span className="font-semibold">{isLoading ? '—' : `${lifetimeRewards} ETH`}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground">Weekly Progress</span>
                    <span className="font-semibold">{isLoading ? '—' : `${weeklyProgress.toFixed(0)}%`}</span>
                  </div>
                  <Progress value={weeklyProgress} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground">Monthly Progress</span>
                    <span className="font-semibold">{isLoading ? '—' : `${monthlyProgress.toFixed(0)}%`}</span>
                  </div>
                  <Progress value={monthlyProgress} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground">Daily Completion</span>
                    <span className="font-semibold">{isLoading ? '—' : `${completionRate.toFixed(0)}%`}</span>
                  </div>
                  <Progress value={completionRate} className="h-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award size={20} />
              <span>Your Badges</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {badgeDefinitions.map((badge, index) => {
                const Icon = badge.icon
                return (
                  <div
                    key={index}
                    className={cn(
                      'flex flex-col items-center p-4 rounded-lg border text-center',
                      badge.earned
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'bg-muted border-border text-muted-foreground opacity-60'
                    )}
                  >
                    <Icon size={24} className={cn('mb-2', isLoading && 'animate-pulse')} />
                    <span className="text-sm font-medium">{badge.name}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Profile

