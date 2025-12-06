# TIP Token Farcaster Mini App

A Farcaster miniapp for interacting with the TIP token on Base mainnet.

## Features

- ✅ View TIP balance and tip allowance
- ✅ Tip TIP tokens to other users
- ✅ Manage tip allowances (owner only)
- ✅ Batch distribute tip allowances to multiple addresses
- ✅ Swap TIP/ETH on Uniswap V2
- ✅ Add liquidity to TIP/ETH pool

## Contract Addresses (Base Mainnet)

- **TIP Token**: `0x0E50aC29Ad2A5E1A22329C7797A429F094ceE84C`
- **Uniswap V2 Router**: `0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24`
- **TIP/ETH Pair**: `0xb4f6a33761dcd763ee19fda7f947d793f400c021`

## Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Dependencies

```json
{
  "@farcaster/miniapp-sdk": "latest",
  "@farcaster/miniapp-wagmi-connector": "latest",
  "wagmi": "^2.12.31",
  "viem": "^2.21.49",
  "next": "^14.2.33",
  "react": "^18.3.1"
}
```

## Key Files Structure

```
tip-miniapp/
├── app/
│   ├── layout.tsx         # Root layout with Wagmi provider
│   ├── page.tsx           # Home page with wallet status
│   ├── tip/
│   │   └── page.tsx       # Tip tokens to users
│   ├── manage/
│   │   └── page.tsx       # Manage tip allowances (owner)
│   ├── batch/
│   │   └── page.tsx       # Batch distribute allowances
│   └── swap/
│       └── page.tsx       # Uniswap trading interface
├── components/
│   ├── WalletConnect.tsx  # Wallet connection component
│   ├── TipForm.tsx        # Form to tip tokens
│   ├── AllowanceForm.tsx  # Manage allowances
│   └── SwapInterface.tsx  # Uniswap swap UI
├── lib/
│   ├── wagmi.ts           # Wagmi configuration
│   └── tip-abi.ts         # TIP token ABI
└── public/
    └── manifest.json      # Farcaster miniapp manifest
```

## Usage

### For Users

1. **View Balance**: See your TIP token balance and tip allowance
2. **Tip Tokens**: Send TIP tokens to other Farcaster users
3. **Swap**: Trade TIP for ETH or ETH for TIP on Uniswap

### For Owner

1. **Set Allowances**: Grant tip allowances to individual addresses
2. **Batch Distribution**: Upload a CSV to grant allowances to 1000+ addresses
3. **Manage Pool**: Add liquidity to the TIP/ETH Uniswap pool

## Batch Allowance Distribution

To distribute tip allowances to many users:

1. Prepare a CSV file with format:
   ```
   address,amount
   0x123...,100
   0x456...,50
   ```

2. Upload the CSV in the "Batch" tab
3. Review the addresses and amounts
4. The app will automatically batch them (100 per transaction)
5. Sign each batch transaction

## Development Notes

- Uses Farcaster SDK for wallet integration (no manual wallet connection needed)
- Supports EIP-5792 batch transactions for multi-step operations
- All transactions on Base mainnet
- Responsive UI works on mobile and desktop

## Resources

- [Farcaster Mini Apps Docs](https://miniapps.farcaster.xyz/docs)
- [TIP Token on BaseScan](https://basescan.org/address/0x0E50aC29Ad2A5E1A22329C7797A429F094ceE84C)
- [Uniswap V2 Pool](https://basescan.org/address/0xb4f6a33761dcd763ee19fda7f947d793f400c021)
