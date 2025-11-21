import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Coins, Settings, Download } from 'lucide-react';

const Admin: React.FC = () => {
    return (
        <div className="container mx-auto px-4 py-6 max-w-4xl">
            <div className="grid gap-6">
                {/* Contract Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Settings size={20} />
                            <span>Contract Settings</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="daily-reward">Daily Base Reward (ETH)</Label>
                            <Input
                                id="daily-reward"
                                type="number"
                                placeholder="0.05"
                                defaultValue="0.05"
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch id="rewards-paused" />
                            <Label htmlFor="rewards-paused">Pause Rewards</Label>
                        </div>

                        <Button className="bg-primary hover:bg-primary/90">
                            Update Settings
                        </Button>
                    </CardContent>
                </Card>

                {/* Streak Bonuses */}
                <Card>
                    <CardHeader>
                        <CardTitle>Streak Bonus Rules</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Days Required</Label>
                                <Input type="number" placeholder="7" />
                            </div>
                            <div className="space-y-2">
                                <Label>Bonus Percentage</Label>
                                <Input type="number" placeholder="10" />
                            </div>
                            <div className="flex items-end">
                                <Button variant="outline" className="w-full">
                                    Add Bonus
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Contract Balance */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Coins size={20} />
                            <span>Contract Balance</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div className="text-2xl font-bold text-primary">12.75 ETH</div>
                            <Button variant="outline">
                                <Download size={16} className="mr-2" />
                                Withdraw Funds
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Admin;
