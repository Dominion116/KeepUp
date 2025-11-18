import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import { WalletService, type WalletState } from './lib/walletService';
import { useToast } from './hooks/use-toast';
import Navigation from './components/layout/Navigation';
import Header from './components/layout/Header';
import Home from './pages/Home';
import Tasks from './pages/Tasks';
import Rewards from './pages/Rewards';
import Profile from './pages/Profile';
import Admin from './pages/Admin';

const App = () => {
  const { toast } = useToast();
  const walletServiceRef = useRef<WalletService | null>(null);
  const [walletState, setWalletState] = useState<WalletState>({
    account: '',
    currentNetwork: '',
    isConnecting: false,
    balance: '',
    isLoadingBalance: false
  });

  useEffect(() => {
    const walletService = new WalletService({
      onToast: (title: string, description: string) => {
        toast({ title, description });
      }
    });

    walletService.onStateUpdate(setWalletState);
    walletServiceRef.current = walletService;

    return () => {
      walletService.destroy();
    };
  }, [toast]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header 
        walletState={walletState} 
        walletService={walletServiceRef.current} 
      />
      
      <main className="flex-1 pb-16 md:pb-0 overflow-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>

      <Navigation />
      <Toaster />
    </div>
  );
};

export default App;
