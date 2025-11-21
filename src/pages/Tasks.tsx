import React, { useMemo, useState } from 'react'
import { usePublicClient, useReadContract, useReadContracts, useWriteContract } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckCircle, Loader2, Plus, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useUserKeepUpContract } from '@/hooks/useUserKeepUpContract'
import { KEEPUP_ABI } from '@/lib/keepUp'
import { ZERO_ADDRESS, getCurrentUnixDay } from '@/lib/constants'
import { cn } from '@/lib/utils'

type ChainTask = {
  id: bigint
  name: string
  active: boolean
  createdAt: bigint
}

const Tasks: React.FC = () => {
  const [newTask, setNewTask] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [pendingTaskId, setPendingTaskId] = useState<bigint | null>(null)
  const [pendingAction, setPendingAction] = useState<'complete' | 'remove' | null>(null)
  const { toast } = useToast()
  const publicClient = usePublicClient()
  const { writeContractAsync } = useWriteContract()

  const { address, isConnected, contractAddress, hasDeployment, isLoadingContracts } = useUserKeepUpContract()
  const keepUpAddress = contractAddress ?? ZERO_ADDRESS

  const tasksQuery = useReadContract({
    abi: KEEPUP_ABI,
    address: keepUpAddress,
    functionName: 'getUserTasks',
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

  const actionableTasks = useMemo(() => chainTasks.filter((task) => task.active), [chainTasks])

  const statusConfigs = useMemo(() => {
    if (!address || !contractAddress) return []
    return actionableTasks.map((task) => ({
      abi: KEEPUP_ABI,
      address: contractAddress,
      functionName: 'getTaskStatus',
      args: [address, task.id],
    }))
  }, [actionableTasks, address, contractAddress])

  const statusesQuery = useReadContracts({
    contracts: statusConfigs,
    query: { enabled: statusConfigs.length > 0 },
  })

  const currentDay = getCurrentUnixDay()

  const completedTaskIds = useMemo(() => {
    if (!statusesQuery.data) return new Set<bigint>()
    const completed = new Set<bigint>()
    statusesQuery.data.forEach((entry, index) => {
      const result = entry?.result as bigint | undefined
      const task = actionableTasks[index]
      if (result !== undefined && task && result === currentDay) {
        completed.add(task.id)
      }
    })
    return completed
  }, [statusesQuery.data, actionableTasks, currentDay])

  const refreshTasks = async () => {
    await tasksQuery.refetch()
    if (statusesQuery.refetch) {
      await statusesQuery.refetch()
    }
  }

  const ensureReady = () => {
    if (!isConnected) {
      toast({
        title: 'Connect your wallet',
        description: 'You need to connect a wallet before managing tasks.',
      })
      return false
    }
    if (!hasDeployment || !contractAddress) {
      toast({
        title: 'No KeepUp contract found',
        description: 'Deploy a contract from the Admin page to start managing tasks.',
      })
      return false
    }
    return true
  }

  const handleAddTask = async () => {
    if (!newTask.trim()) return
    if (!ensureReady()) return

    try {
      setIsAdding(true)
      const hash = await writeContractAsync({
        abi: KEEPUP_ABI,
        address: contractAddress!,
        functionName: 'addTask',
        args: [newTask.trim()],
      })
      toast({ title: 'Task submitted', description: hash })
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash })
      }
      setNewTask('')
      await refreshTasks()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to add task.'
      toast({ title: 'Add task failed', description: message, variant: 'destructive' })
    } finally {
      setIsAdding(false)
    }
  }

  const handleCompleteTask = async (taskId: bigint) => {
    if (!ensureReady()) return

    try {
      setPendingTaskId(taskId)
      setPendingAction('complete')
      const hash = await writeContractAsync({
        abi: KEEPUP_ABI,
        address: contractAddress!,
        functionName: 'completeTask',
        args: [taskId],
      })
      toast({ title: 'Completion submitted', description: hash })
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash })
      }
      await refreshTasks()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to complete task.'
      toast({ title: 'Complete task failed', description: message, variant: 'destructive' })
    } finally {
      setPendingTaskId(null)
      setPendingAction(null)
    }
  }

  const handleRemoveTask = async (taskId: bigint) => {
    if (!ensureReady()) return

    try {
      setPendingTaskId(taskId)
      setPendingAction('remove')
      const hash = await writeContractAsync({
        abi: KEEPUP_ABI,
        address: contractAddress!,
        functionName: 'removeTask',
        args: [taskId],
      })
      toast({ title: 'Removal submitted', description: hash })
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash })
      }
      await refreshTasks()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to remove task.'
      toast({ title: 'Remove task failed', description: message, variant: 'destructive' })
    } finally {
      setPendingTaskId(null)
      setPendingAction(null)
    }
  }

  const isLoading = isLoadingContracts || tasksQuery.isFetching || statusesQuery.isFetching
  const disableAdd = !newTask.trim() || !isConnected || !hasDeployment || isAdding

  const formatDate = (value: bigint) => {
    if (!value) return '—'
    return new Date(Number(value) * 1000).toLocaleDateString()
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Your Habits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Add Task Form */}
            <div className="flex flex-col gap-2 md:flex-row">
              <Input
                placeholder="Add a new habit..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                disabled={!isConnected || !hasDeployment || isAdding}
              />
              <Button onClick={handleAddTask} className="bg-primary hover:bg-primary/90" disabled={disableAdd}>
                {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus size={16} />}
              </Button>
            </div>

            {!isConnected && (
              <p className="text-sm text-muted-foreground">Connect your wallet to sync your tasks.</p>
            )}
            {isConnected && !hasDeployment && (
              <p className="text-sm text-muted-foreground">
                Deploy a KeepUp contract from the Admin page to start tracking habits.
              </p>
            )}

            {/* Tasks List */}
            <div className="space-y-2">
              {chainTasks.map((task) => {
                const isCompleted = completedTaskIds.has(task.id)
                const isWorking = pendingTaskId === task.id
                const disableComplete = !task.active || isCompleted || isWorking
                return (
                  <div
                    key={task.id.toString()}
                    className={cn(
                      'flex flex-col gap-3 rounded-lg border border-border p-3 md:flex-row md:items-center md:justify-between',
                      !task.active && 'opacity-60'
                    )}
                  >
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {task.name}
                        {isCompleted && <CheckCircle className="h-4 w-4 text-green-500" />}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {task.active ? 'Active' : 'Inactive'} · Created {formatDate(task.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={disableComplete}
                        onClick={() => handleCompleteTask(task.id)}
                      >
                        {isWorking && pendingAction === 'complete' ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        {isCompleted ? 'Completed' : 'Complete today'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveTask(task.id)}
                        disabled={!task.active || isWorking || !hasDeployment}
                        className="text-destructive hover:text-destructive/90"
                      >
                        {isWorking && pendingAction === 'remove' ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>

            {chainTasks.length === 0 && isConnected && hasDeployment && !isLoading && (
              <div className="text-center text-muted-foreground py-8">
                <p>No habits yet. Add your first habit to get started!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Tasks

