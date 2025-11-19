import React from 'react';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
    className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
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
                    {/* AppKit web component - handles connect/disconnect and wallet info */}
                    <appkit-button />
                </div>
            </div>
        </header>
    );
};

export default Header;