// Browser polyfills for Solana and wallet compatibility
import { Buffer } from 'buffer';
import process from 'process';

// Ethereum provider type
interface EthereumProvider {
  isMetaMask?: boolean;
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (eventName: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (eventName: string, handler: (...args: unknown[]) => void) => void;
  selectedAddress?: string | null;
  chainId?: string;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
    Buffer: typeof Buffer;
    process: typeof process;
  }
  
  // eslint-disable-next-line no-var
  var Buffer: typeof Buffer;
  // eslint-disable-next-line no-var
  var process: typeof process;
  // eslint-disable-next-line no-var
  var global: typeof globalThis;
}

// Global Buffer polyfill
if (!window.Buffer) {
  window.Buffer = Buffer;
  window.process = process;
}

// Global polyfill
if (typeof globalThis !== 'undefined') {
  globalThis.Buffer = Buffer;
  globalThis.process = process;
  if (!globalThis.global) {
    globalThis.global = globalThis;
  }
}

// Polyfill for BigInt (for older browsers)
if (typeof BigInt === 'undefined') {
  window.BigInt = Object.assign(
    function(value: string | number | bigint | boolean) {
      return parseInt(value as string, 10);
    },
    {
      asIntN: (bits: number, int: bigint) => int,
      asUintN: (bits: number, int: bigint) => int,
    }
  ) as unknown as BigIntConstructor;
}

export default {};