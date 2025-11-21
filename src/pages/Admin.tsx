import React, { useEffect, useMemo, useState } from 'react';
import { formatEther, parseEther } from 'viem';
import { useAccount, usePublicClient, useReadContract, useWriteContract } from 'wagmi';
import { Coins, Database, ExternalLink, Loader2, RefreshCcw, Settings, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { KEEPUP_FACTORY_CONTRACT } from '@/lib/keepUpFactory';
import { getNetworkConfig } from '@/lib/config';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as const;

type Deployment = {
    contractAddress: `0x${string}`;
    owner: `0x${string}`;
    deployedAt: bigint;
    dailyReward: bigint;
};

const Admin: React.FC = () => {
    const { toast } = useToast();
    const { address, isConnected } = useAccount();
    const publicClient = usePublicClient();

    const [defaultRewardInput, setDefaultRewardInput] = useState('0.05');
    const [deployRewardInput, setDeployRewardInput] = useState('0.05');
    const [deployFundingInput, setDeployFundingInput] = useState('0');
    const [isUpdatingReward, setIsUpdatingReward] = useState(false);
    const [isDeployingCustom, setIsDeployingCustom] = useState(false);
    const [isDeployingDefault, setIsDeployingDefault] = useState(false);

    const {
        data: defaultRewardData,
        isFetching: isFetchingDefaultReward,
        refetch: refetchDefaultReward,
    } = useReadContract({
        ...KEEPUP_FACTORY_CONTRACT,
        functionName: 'defaultDailyReward',
    });

    const {
        data: totalDeploymentsData,
        isFetching: isFetchingTotalDeployments,
        refetch: refetchTotalDeployments,
    } = useReadContract({
        ...KEEPUP_FACTORY_CONTRACT,
        functionName: 'getTotalDeployments',
    });

    const {
        data: userDeploymentsData,
        isFetching: isFetchingUserDeployments,
        refetch: refetchUserDeployments,
    } = useReadContract({
        ...KEEPUP_FACTORY_CONTRACT,
        functionName: 'getUserDeployments',
        args: [address ?? ZERO_ADDRESS],
        query: {
            enabled: Boolean(address),
        },
    });

    const { writeContractAsync } = useWriteContract();

    const defaultDailyReward = defaultRewardData ? formatEther(defaultRewardData as bigint) : undefined;
    const totalDeployments = totalDeploymentsData ? Number(totalDeploymentsData) : 0;
    const explorerUrl = getNetworkConfig().explorerUrl;

    useEffect(() => {
        if (defaultDailyReward) {
            setDefaultRewardInput(defaultDailyReward);
        }
    }, [defaultDailyReward]);

    const userDeployments: Deployment[] = useMemo(() => {
        if (!userDeploymentsData || !Array.isArray(userDeploymentsData)) {
            return [];
        }

        return userDeploymentsData.map((deployment: any) => ({
            contractAddress: (deployment.contractAddress ?? deployment[0]) as `0x${string}`,
            owner: (deployment.owner ?? deployment[1]) as `0x${string}`,
            deployedAt: (deployment.deployedAt ?? deployment[2]) as bigint,
            dailyReward: (deployment.dailyReward ?? deployment[3]) as bigint,
        }));
    }, [userDeploymentsData]);

    const truncate = (value: string) => `${value.slice(0, 6)}...${value.slice(-4)}`;
    const formatDate = (value: bigint) => {
        if (!value) return '—';
        return new Date(Number(value) * 1000).toLocaleDateString();
    };

    const safeParseEther = (value: string) => {
        try {
            return parseEther(value || '0');
        } catch {
            return undefined;
        }
    };

    const notifyError = (message: string) =>
        toast({
            title: 'Transaction failed',
            description: message,
            variant: 'destructive',
        });

    const waitForReceipt = async (hash: `0x${string}`) => {
        if (!publicClient) return;
        await publicClient.waitForTransactionReceipt({ hash });
    };

    const handleUpdateDefaultReward = async () => {
        const rewardWei = safeParseEther(defaultRewardInput);
        if (!rewardWei || rewardWei <= 0n) {
            notifyError('Enter a valid positive amount for the default reward.');
            return;
        }

        try {
            setIsUpdatingReward(true);
            const hash = await writeContractAsync({
                ...KEEPUP_FACTORY_CONTRACT,
                functionName: 'setDefaultDailyReward',
                args: [rewardWei],
            });
            toast({ title: 'Update submitted', description: hash });
            await waitForReceipt(hash);
            await refetchDefaultReward();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            notifyError(message);
        } finally {
            setIsUpdatingReward(false);
        }
    };

    const handleDeployCustom = async () => {
        const rewardWei = safeParseEther(deployRewardInput);
        const fundingWei = safeParseEther(deployFundingInput) ?? 0n;

        if (!rewardWei || rewardWei <= 0n) {
            notifyError('Enter a valid positive reward for the new KeepUp contract.');
            return;
        }

        try {
            setIsDeployingCustom(true);
            const hash = await writeContractAsync({
                ...KEEPUP_FACTORY_CONTRACT,
                functionName: 'deployKeepUp',
                args: [rewardWei],
                value: fundingWei,
            });
            toast({ title: 'Deployment submitted', description: hash });
            await waitForReceipt(hash);
            await Promise.all([
                refetchTotalDeployments(),
                address ? refetchUserDeployments() : Promise.resolve(),
            ]);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            notifyError(message);
        } finally {
            setIsDeployingCustom(false);
        }
    };

    const handleDeployWithDefaults = async () => {
        const fundingWei = safeParseEther(deployFundingInput) ?? 0n;

        try {
            setIsDeployingDefault(true);
            const hash = await writeContractAsync({
                ...KEEPUP_FACTORY_CONTRACT,
                functionName: 'deployKeepUpWithDefaults',
                value: fundingWei,
            });
            toast({ title: 'Deployment submitted', description: hash });
            await waitForReceipt(hash);
            await Promise.all([
                refetchTotalDeployments(),
                address ? refetchUserDeployments() : Promise.resolve(),
            ]);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            notifyError(message);
        } finally {
            setIsDeployingDefault(false);
        }
    };

    const handleRefresh = () => {
        refetchDefaultReward();
        refetchTotalDeployments();
        if (address) {
            refetchUserDeployments();
        }
    };

    const disableWrites = !isConnected || !address;

    return (
        <div className="container mx-auto px-4 py-6 max-w-5xl">
            <div className="grid gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Settings size={20} />
                            <CardTitle>Factory Defaults</CardTitle>
                        </div>
                        <Button variant="ghost" size="icon" onClick={handleRefresh} aria-label="Refresh data">
                            {isFetchingDefaultReward || isFetchingTotalDeployments ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <RefreshCcw className="h-4 w-4" />
                            )}
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="default-reward">Default Daily Reward (ETH)</Label>
                            <div className="flex gap-3">
                                <Input
                                    id="default-reward"
                                    type="number"
                                    step="0.0001"
                                    min="0"
                                    value={defaultRewardInput}
                                    onChange={(event) => setDefaultRewardInput(event.target.value)}
                                />
                                <Button
                                    onClick={handleUpdateDefaultReward}
                                    disabled={disableWrites || isUpdatingReward}
                                    className="min-w-[140px]"
                                >
                                    {isUpdatingReward ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Update
                                </Button>
                            </div>
                            {!isConnected && (
                                <p className="text-sm text-muted-foreground">
                                    Connect your wallet to update the default reward.
                                </p>
                            )}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-lg border bg-muted/30 p-4">
                                <p className="text-sm text-muted-foreground">Current Default Reward</p>
                                <p className="text-2xl font-semibold">
                                    {isFetchingDefaultReward && !defaultDailyReward ? 'Loading…' : `${defaultDailyReward ?? '—'} ETH`}
                                </p>
                            </div>
                            <div className="rounded-lg border bg-muted/30 p-4">
                                <p className="text-sm text-muted-foreground">Total Deployments</p>
                                <p className="text-2xl font-semibold">
                                    {isFetchingTotalDeployments && totalDeployments === 0 ? 'Loading…' : totalDeployments}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Coins size={20} />
                            <span>Deploy New KeepUp Contract</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="custom-reward">Daily Reward (ETH)</Label>
                                <Input
                                    id="custom-reward"
                                    type="number"
                                    step="0.0001"
                                    min="0"
                                    value={deployRewardInput}
                                    onChange={(event) => setDeployRewardInput(event.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="funding">Initial Funding (ETH)</Label>
                                <Input
                                    id="funding"
                                    type="number"
                                    step="0.0001"
                                    min="0"
                                    value={deployFundingInput}
                                    onChange={(event) => setDeployFundingInput(event.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Actions</Label>
                                <div className="flex flex-col gap-2">
                                    <Button disabled={disableWrites || isDeployingCustom} onClick={handleDeployCustom}>
                                        {isDeployingCustom ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        Deploy Custom Reward
                                    </Button>
                                    <Button
                                        variant="outline"
                                        disabled={disableWrites || isDeployingDefault}
                                        onClick={handleDeployWithDefaults}
                                    >
                                        {isDeployingDefault ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        Use Factory Default
                                    </Button>
                                </div>
                            </div>
                        </div>
                        {!isConnected && (
                            <p className="text-sm text-muted-foreground">
                                Connect your wallet to deploy a new KeepUp contract.
                            </p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Database size={20} />
                            <span>Deployment Stats</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-lg border bg-muted/40 p-4">
                            <p className="text-sm text-muted-foreground">Total Deployments</p>
                            <p className="text-2xl font-semibold">{totalDeployments}</p>
                        </div>
                        <div className="rounded-lg border bg-muted/40 p-4">
                            <p className="text-sm text-muted-foreground">My Contracts</p>
                            <p className="text-2xl font-semibold">
                                {isFetchingUserDeployments && isConnected ? 'Loading…' : userDeployments.length}
                            </p>
                        </div>
                        <div className="rounded-lg border bg-muted/40 p-4">
                            <p className="text-sm text-muted-foreground">Current Wallet</p>
                            <p className="text-lg font-semibold">
                                {address ? truncate(address) : 'Not connected'}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <User size={20} />
                            <span>My Deployments</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {!isConnected && (
                            <p className="text-sm text-muted-foreground">
                                Connect your wallet to view the contracts you have deployed.
                            </p>
                        )}

                        {isConnected && userDeployments.length === 0 && !isFetchingUserDeployments ? (
                            <p className="text-sm text-muted-foreground">You have not deployed any KeepUp contracts yet.</p>
                        ) : null}

                        {isFetchingUserDeployments && isConnected ? (
                            <div className="flex items-center space-x-2 text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Fetching deployments…</span>
                            </div>
                        ) : null}

                        {userDeployments.length > 0 && (
                            <div className="space-y-3">
                                {userDeployments.map((deployment) => (
                                    <div key={deployment.contractAddress} className="rounded-lg border p-4">
                                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Contract Address</p>
                                                <p className="font-mono text-sm">
                                                    {truncate(deployment.contractAddress)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Daily Reward</p>
                                                <p className="font-semibold">{formatEther(deployment.dailyReward)} ETH</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Deployed</p>
                                                <p className="font-semibold">{formatDate(deployment.deployedAt)}</p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="mt-2 md:mt-0"
                                                onClick={() =>
                                                    window.open(
                                                        `${explorerUrl}/address/${deployment.contractAddress}`,
                                                        '_blank',
                                                        'noopener'
                                                    )
                                                }
                                            >
                                                View on Explorer
                                                <ExternalLink className="ml-2 h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Admin;
