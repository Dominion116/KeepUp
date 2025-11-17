import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gift, History, Coins } from 'lucide-react';

const Rewards: React.FC = () => {
    // Mock data
    const tokenBalance = '2.45 CELO';
    const pendingReward = '0.05 CELO';
    const rewardHistory = [
        { date: '2024-01-15', amount: '0.05 CELO', streak: 5 },
        { date: '2024-01-14', amount: '0.05 CELO', streak: 4 },
        { date: '2024-01-13', amount: '0.05 CELO', streak: 3 },
    ];

    return (
        <div className="container mx-auto px-4 py-6 max-w-4xl">
            <div className="grid gap-6">
                {/* Balance Card */}
                <Card className="bg-gradient-subtle border-0">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Coins size={20} />
                            <span>Token Balance</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-primary">{tokenBalance}</div>
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
                            <div className="text-2xl font-bold text-primary">{pendingReward}</div>
                            <Button className="w-full bg-primary hover:bg-primary/90">
                                Claim Reward
                            </Button>
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
                        <div className="space-y-3">
                            {rewardHistory.map((reward, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 rounded-lg border border-border"
                                >
                                    <div>
                                        <div className="font-medium">{reward.date}</div>
                                        <div className="text-sm text-muted-foreground">Streak: {reward.streak}</div>
                                    </div>
                                    <div className="text-primary font-semibold">{reward.amount}</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Rewards;
