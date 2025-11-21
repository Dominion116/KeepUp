import './polyfills.ts';
import './index.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppKitProvider } from './components/providers/AppKitProvider';
import { ThemeProvider } from './components/providers/ThemeProvider';
import App from './App.tsx';
// Initialize AppKit configuration
import './lib/appkit';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

createRoot(rootElement).render(
    <StrictMode>
        <ThemeProvider>
            <AppKitProvider>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </AppKitProvider>
        </ThemeProvider>
    </StrictMode>
); 