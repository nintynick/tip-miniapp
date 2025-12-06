# TIP Token Miniapp - Deployment Guide

## ✅ What's Been Built

A complete Farcaster miniapp for the TIP token with the following features:

### Pages Created
1. **Home (`/`)** - Wallet connection, balance display, navigation
2. **Tip (`/tip`)** - Send TIP tokens to any address
3. **Swap (`/swap`)** - Trade TIP/ETH on Uniswap V2
4. **Manage (`/manage`)** - Set tip allowances (owner only)
5. **Batch (`/batch`)** - Bulk distribute allowances to 1000+ addresses (owner only)

### Features
- ✅ Farcaster wallet integration (no manual connection)
- ✅ View TIP balance and tip allowance
- ✅ Mint and send TIP tokens
- ✅ Swap TIP for ETH and vice versa
- ✅ Manage tip allowances with lookup
- ✅ CSV-based batch distribution with auto-batching
- ✅ Owner-only admin features
- ✅ Responsive design with dark mode
- ✅ Transaction tracking with BaseScan links
- ✅ Real-time updates with React Query

## 🚀 Deployment Steps

### 1. Install Dependencies

```bash
cd tip-miniapp
npm install
```

### 2. Test Locally

```bash
npm run dev
```

Visit `http://localhost:3000` to test the miniapp.

### 3. Build for Production

```bash
npm run build
```

### 4. Deploy to Vercel

The easiest way to deploy:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or use the Vercel dashboard:
1. Go to [vercel.com](https://vercel.com)
2. Import your Git repository
3. Vercel will auto-detect Next.js and deploy

### 5. Add Icons

Create these icon files in the `public/` directory:
- `icon-192.png` (192x192px)
- `icon-512.png` (512x512px)
- `splash.png` (for splash screen)

You can create simple icons with the 💡 emoji or TIP branding.

### 6. Register with Farcaster

Once deployed:

1. Go to the [Farcaster Mini Apps Developer Portal](https://miniapps.farcaster.xyz)
2. Register your miniapp with your deployment URL
3. Submit for review/approval
4. Once approved, users can discover it in Farcaster clients

## 📋 Environment Variables (Optional)

If you need analytics or additional features, create `.env.local`:

```bash
# Add any environment variables here
# NEXT_PUBLIC_ANALYTICS_ID=...
```

## 🔧 Customization

### Update Contract Addresses

If you deploy to a different network, update `/lib/wagmi.ts`:

```typescript
export const TIP_TOKEN_ADDRESS = '0x...' // Your contract
export const UNISWAP_V2_ROUTER = '0x...' // Uniswap router
export const TIP_ETH_PAIR = '0x...' // Your pool
```

### Change Theme Colors

Edit `/tailwind.config.ts` and `/public/manifest.json` to customize colors.

### Modify Batch Size

In `/app/batch/page.tsx`, change:

```typescript
const BATCH_SIZE = 100 // Adjust based on gas limits
```

## 📱 Testing in Farcaster

### During Development

1. Deploy to a public URL (Vercel, Netlify, etc.)
2. Use Farcaster's testing tools to preview
3. Share the miniapp URL in Farcaster to test with real users

### Production Testing

1. Use testnet contracts first (deploy on Base Sepolia)
2. Test all features thoroughly
3. Deploy to mainnet when ready

## 🔐 Security Considerations

- ✅ Contract addresses are hardcoded (no user input for contract addresses)
- ✅ Address validation on all inputs
- ✅ Owner-only functions protected with contract-level checks
- ✅ Batch size limits prevent gas issues
- ✅ Transaction confirmation before execution
- ⚠️ Slippage protection is set to 0 for simplicity - consider adding slippage input for swaps

## 📊 Monitoring

After deployment, monitor:

1. **BaseScan** - Track all transactions
2. **Vercel Analytics** - Monitor app performance
3. **User Feedback** - Via Farcaster channels

## 🐛 Troubleshooting

### "Failed to connect wallet"
- Ensure you're testing in a Farcaster client (Warpcast, etc.)
- Farcaster connector only works in Farcaster environment

### "Transaction failed"
- Check wallet has enough ETH for gas
- Verify user has sufficient allowance/balance
- Check BaseScan for error details

### "Owner only" errors
- Ensure the connected wallet matches the contract owner
- Verify contract owner address in `/lib/wagmi.ts`

## 📚 Resources

- [Farcaster Mini Apps Docs](https://miniapps.farcaster.xyz/docs)
- [Wagmi Documentation](https://wagmi.sh)
- [Next.js Documentation](https://nextjs.org/docs)
- [Base Network Docs](https://docs.base.org)
- [TIP Token Contract](https://basescan.org/address/0x0E50aC29Ad2A5E1A22329C7797A429F094ceE84C)

## 🎉 Success!

Your TIP Token miniapp is now ready for deployment. Users can:
- 💸 Tip TIP tokens to anyone
- 🔄 Swap TIP/ETH on Uniswap
- 📊 View their balance and allowances
- 👑 Manage allowances (if they're the owner)
- 📦 Bulk distribute to thousands of addresses

Happy deploying! 🚀
