# KeepUp

Blockchain-powered habit tracking and rewards. KeepUp lets users deploy their own habit contracts, manage tasks on-chain, and claim rewards secured by smart contracts—all from a polished React UI with wallet connectivity and dark-mode support.

---

## Table of Contents

1. [Architecture](#architecture)
2. [Key Features](#key-features)
3. [Prerequisites](#prerequisites)
4. [Getting Started](#getting-started)
5. [Environment & Config](#environment--config)
6. [Available Scripts](#available-scripts)
7. [App Walkthrough](#app-walkthrough)
8. [Smart Contracts](#smart-contracts)
9. [Design System & Theming](#design-system--theming)
10. [Development Tips](#development-tips)
11. [Troubleshooting](#troubleshooting)

---

## Architecture

- **Frontend**: Vite + React 18 + TypeScript + TailwindCSS (shadcn/ui primitives) with AppKit for wallet connectivity.
- **State & Data**:
  - `wagmi` + `viem` for smart-contract reads/writes.
  - React Query (via AppKit) for request caching.
  - Custom hooks (`useUserKeepUpContract`, `useRewardHistory`, etc.) abstract blockchain reads.
- **Contracts**:
  - `KeepUpFactory` deploys individual `KeepUp` habit contracts.
  - The UI treats the first contract deployed by a user as their active instance.
- **Theming**: CSS variable system with class-based dark mode.

Directory highlights:

```
src/
├─ abi/                # Contract ABIs
├─ components/
│  ├─ layout/          # Header + bottom navigation
│  ├─ providers/       # AppKit + Theme providers
│  └─ ui/              # shadcn/ui components
├─ hooks/              # Reusable hooks (theme, blockchain)
├─ lib/                # Config, contract helpers, wallet services
├─ pages/              # Route-based views
└─ main.tsx            # App bootstrap (AppKit + Theme providers)
```

---

## Key Features

- **Wallet Connectivity**: AppKit modal handles Base / EVM chains, including account switching and balance display.
- **On-Chain Task Management**:
  - Load tasks from the connected KeepUp contract.
  - Add, complete (per-day), and remove tasks directly via contract calls.
- **Reward Tracking**:
  - Compute pending rewards (daily reward + streak bonus) in real time.
  - Claim rewards on-chain and stream historical `RewardClaimed` events for history.
- **Factory Administration**:
  - Update factory defaults, deploy custom or default-funded KeepUp contracts, and inspect user deployments.
- **Dark Mode**: Persistent light/dark toggle with system preference fallback.

---

## Prerequisites

- **Node.js**: v18+ (Vite + wagmi require modern runtimes).
- **Package Manager**: npm 9+ (lockfile committed), though pnpm/yarn can be used with minor adjustments.
- **Wallet**: MetaMask, Coinbase Wallet, or any EVM-compatible wallet for testing.
- **RPC Access**: Base mainnet/testnet endpoints are embedded, but you may want your own API key (e.g., Alchemy, Infura) for heavier use.

---

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server (http://localhost:5173 by default)
npm run dev

# Build for production
npm run build

# Preview the production build
npm run preview
```

When the dev server launches, the AppKit modal appears via the `appkit-button` web component inside the header. Connect a wallet on Base Sepolia (recommended for testing) or Base Mainnet to see live data.

---

## Environment & Config

The project currently embeds Base RPC URLs and the KeepUp factory address (`src/lib/config.ts`). If you need to override these, add environment variables and read them in `config.ts`, or swap the constants directly.

Suggested `.env` additions:

```
VITE_BASE_MAINNET_RPC=https://...
VITE_BASE_TESTNET_RPC=https://...
VITE_KEEPUP_FACTORY=0xYourNewFactory
```

Then update `src/lib/config.ts` to read from `import.meta.env`.

---

## Available Scripts

| Script        | Description                                  |
|---------------|----------------------------------------------|
| `npm run dev` | Start Vite dev server with hot reloading.    |
| `npm run build` | Production build (outputs to `dist/`).     |
| `npm run preview` | Preview the production build locally.    |
| `npm run lint` | ESLint (if you add rules beyond defaults).  |

---

## App Walkthrough

### Home
- Shows today’s task completion progress, streak, and pending reward.
- Claim button executes `claimReward` and refreshes related queries.

### Tasks
- Add new tasks (`addTask`) and complete/remove existing ones (`completeTask`, `removeTask`).
- Task completion state is derived from `getTaskStatus` vs. current day.

### Rewards
- Displays wallet ETH balance (via `useBalance`), pending reward, and history of claims (parsed from `RewardClaimed` logs).
- Lifetime rewards sum is computed client-side from event logs.

### Profile
- Aggregates streak stats, task counts, and derived progress indicators.
- Shows badge cards based on streak milestones and reward history.

### Admin
- Reads factory defaults & totals.
- Enables updating default reward, deploying new KeepUp contracts (custom or default), and listing user deployments.

---

## Smart Contracts

- **ABIs**: Stored under `src/abi/`.
- **Factory Address**: Defined in `src/lib/config.ts` (`KEEPUP_FACTORY_ADDRESS`).
- **Contract Helpers**:
  - `src/lib/keepUpFactory.ts` – shared wagmi config for factory calls.
  - `src/lib/keepUp.ts` – helper for per-user KeepUp contract config.
- **Hooks**:
  - `useUserKeepUpContract` – finds the connected wallet’s first KeepUp deployment via `getUserContracts`.
  - `useRewardHistory` – fetches `RewardClaimed` logs through the public client.

For contract upgrades, update the ABIs and redeploy addresses, then invalidate caches if necessary.

---

## Design System & Theming

- Tailwind + CSS variables defined in `src/index.css`.
- `darkMode: ["class"]` in `tailwind.config.js`.
- `ThemeProvider` syncs the `dark`/`light` class on `<html>` and persists preference.
- Header includes a toggle button with icon swap and accessible labels.

To customize colors, edit the CSS variable definitions; components consume them through Tailwind’s `hsl(var(--color))` mappings.

---

## Development Tips

- **Wallet Connections**: AppKit auto-handles reconnection, but you can listen to `useAccount` for state.
- **Refetch Patterns**: After writes, await `waitForTransactionReceipt` via `publicClient` and then trigger relevant `refetch()` calls to keep UI synced.
- **Error Handling**: UI toasts (`useToast`) provide feedback on writes; extend for additional UX needs.
- **Code Style**: Follow the existing TypeScript + ESLint defaults. Keep ASCII-compatible files unless already using other encodings.

---

## Troubleshooting

| Issue | Possible Fix |
|-------|--------------|
| Contracts return empty data | Ensure wallet is connected to Base and has at least one KeepUp deployment. |
| Pending reward stays at 0 | Rewards can be claimed only once per day; verify `lastClaimDay` vs current day. |
| Tasks never mark as complete | `completeTask` must be called per task per day; check that `getTaskStatus` equals today’s Unix day. |
| Dark mode doesn’t persist | Local storage key `keepup-theme` controls persistence—clear storage or inspect dev tools. |
| AppKit button missing | Make sure `createAppKit` runs (import `./lib/appkit`) and that the web component `<appkit-button />` remains in the header. |

For deeper issues, inspect the console/network logs and verify RPC responses from Base endpoints.

---

Happy hacking! 🎯

