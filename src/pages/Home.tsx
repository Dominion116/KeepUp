import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle, Calendar, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

const Home: React.FC = () => {
    // Mock data for demonstration
    const tasks = [
        { id: 1, name: 'Morning Meditation', completed: true },
        { id: 2, name: '30min Exercise', completed: true },
        { id: 3, name: 'Read 20 pages', completed: false },
    ];

    const progress = (tasks.filter(t => t.completed).length / tasks.length) * 100;
    const streak = 7;
    const pendingReward = '0.05 CELO';

    return (
        <div className="container mx-auto px-4 py-6 max-w-4xl">
            <div className="grid gap-6">
                {/* Daily Summary */}
                <Card className="bg-gradient-subtle border-0">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-2xl">Today's Progress</CardTitle>
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
                                    {tasks.filter(t => t.completed).length} of {tasks.length} tasks completed
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tasks List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Today's Tasks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {tasks.map((task) => (
                                <div
                                    key={task.id}
                                    className={cn(
                                        'flex items-center space-x-3 p-3 rounded-lg border',
                                        task.completed ? 'bg-muted border-border' : 'bg-background border-border'
                                    )}
                                >
                                    <Checkbox
                                        checked={task.completed}
                                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                    />
                                    <span className={cn('flex-1', task.completed && 'line-through text-muted-foreground')}>
                                        {task.name}
                                    </span>
                                    {task.completed && <CheckCircle className="w-4 h-4 text-green-500" />}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Stats and Rewards */}
                <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center space-x-2">
                                <Trophy className="w-5 h-5" />
                                <span>Streak</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-primary">{streak}</div>
                                <p className="text-sm text-muted-foreground">days in a row</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Pending Reward</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center space-y-3">
                                <div className="text-2xl font-bold text-primary">{pendingReward}</div>
                                <Button className="w-full bg-primary hover:bg-primary/90">
                                    Claim Reward
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Home;
