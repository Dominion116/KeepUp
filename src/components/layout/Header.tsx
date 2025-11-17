import React from 'react';
import { Wallet, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { WalletService, type WalletState } from '@/lib/walletService';
import { formatAddress, cn } from '@/lib/utils';

interface HeaderProps {
    walletState: WalletState;
    walletService: WalletService | null;
    className?: string;
}

const Header: React.FC<HeaderProps> = ({ walletState, walletService, className }) => {
    const { toast } = useToast();

    const connectWallet = () => {
        walletService?.connectWallet();
    };

    const disconnectWallet = () => {
        walletService?.disconnectWallet();
    };

    return (
        <header className={cn('bg-background border-b border-border', className)}>
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-xl font-bold text-foreground">KeepUp</h1>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    {walletState.account ? (
                        <div className="flex items-center space-x-3">
                            <div className="bg-muted px-3 py-1.5 rounded-full text-sm">
                                {formatAddress(walletState.account)}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={disconnectWallet}
                                disabled={walletState.isConnecting}
                            >
                                <Wallet className="w-4 h-4 mr-2" />
                                Disconnect
                            </Button>
                        </div>
                    ) : (
                        <Button
                            onClick={connectWallet}
                            disabled={walletState.isConnecting}
                            className="bg-primary hover:bg-primary/90"
                        >
                            <Wallet className="w-4 h-4 mr-2" />
                            {walletState.isConnecting ? 'Connecting...' : 'Connect Wallet'}
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;