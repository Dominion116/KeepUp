import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Trophy, Award, /* Calendar */ User } from 'lucide-react';

const Profile: React.FC = () => {
    // Mock data
    const userStats = {
        totalStreak: 7,
        longestStreak: 12,
        totalRewards: '2.45 ETH',
        tasksCompleted: 42,
    };

    const badges = [
        { name: '7-Day Streak', icon: Trophy, earned: true },
        { name: '30 Tasks', icon: Award, earned: true },
        { name: 'First Reward', icon: Award, earned: true },
        { name: '30-Day Streak', icon: Trophy, earned: false },
    ];

    return (
        <div className="container mx-auto px-4 py-6 max-w-4xl">
            <div className="grid gap-6">
                {/* User Stats */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <User size={20} />
                            <span>Your Statistics</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Current Streak</span>
                                    <span className="font-semibold">{userStats.totalStreak} days</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Longest Streak</span>
                                    <span className="font-semibold">{userStats.longestStreak} days</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Total Rewards</span>
                                    <span className="font-semibold">{userStats.totalRewards}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Tasks Completed</span>
                                    <span className="font-semibold">{userStats.tasksCompleted}</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-muted-foreground">Weekly Progress</span>
                                        <span className="font-semibold">71%</span>
                                    </div>
                                    <Progress value={71} className="h-2" />
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-muted-foreground">Monthly Progress</span>
                                        <span className="font-semibold">85%</span>
                                    </div>
                                    <Progress value={85} className="h-2" />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Badges */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Award size={20} />
                            <span>Your Badges</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {badges.map((badge, index) => {
                                const Icon = badge.icon;
                                return (
                                    <div
                                        key={index}
                                        className={`flex flex-col items-center p-4 rounded-lg border text-center ${badge.earned
                                                ? 'bg-primary/10 border-primary text-primary'
                                                : 'bg-muted border-border text-muted-foreground opacity-50'
                                            }`}
                                    >
                                        <Icon size={24} className="mb-2" />
                                        <span className="text-sm font-medium">{badge.name}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Profile;
