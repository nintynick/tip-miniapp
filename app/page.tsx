'use client'

import { useAccount, useConnect, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { formatEther } from 'viem'
import Link from 'next/link'
import { TIP_TOKEN_ADDRESS } from '@/lib/wagmi'
import { TIP_TOKEN_ABI } from '@/lib/tip-abi'

export default function Home() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()

  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  // Read user's TIP balance
  const { data: balance } = useReadContract({
    address: TIP_TOKEN_ADDRESS,
    abi: TIP_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  })

  // Read user's tip allowance
  const { data: tipAllowance } = useReadContract({
    address: TIP_TOKEN_ADDRESS,
    abi: TIP_TOKEN_ABI,
    functionName: 'tipAllowance',
    args: address ? [address] : undefined,
  })

  // Read total tips sent
  const { data: totalTipsSent } = useReadContract({
    address: TIP_TOKEN_ADDRESS,
    abi: TIP_TOKEN_ABI,
    functionName: 'totalTipsSent',
    args: address ? [address] : undefined,
  })

  // Read total tips received
  const { data: totalTipsReceived } = useReadContract({
    address: TIP_TOKEN_ADDRESS,
    abi: TIP_TOKEN_ABI,
    functionName: 'totalTipsReceived',
    args: address ? [address] : undefined,
  })

  // Read last allowance update
  const { data: lastAllowanceUpdate } = useReadContract({
    address: TIP_TOKEN_ADDRESS,
    abi: TIP_TOKEN_ABI,
    functionName: 'lastAllowanceUpdate',
    args: address ? [address] : undefined,
  })

  // Calculate daily allowance
  const { data: dailyAllowance } = useReadContract({
    address: TIP_TOKEN_ADDRESS,
    abi: TIP_TOKEN_ABI,
    functionName: 'calculateDailyAllowance',
    args: address ? [address] : undefined,
  })

  // Read contract owner
  const { data: owner } = useReadContract({
    address: TIP_TOKEN_ADDRESS,
    abi: TIP_TOKEN_ABI,
    functionName: 'owner',
  })

  // Check if user can claim daily allowance (24 hours have passed)
  const canClaim = lastAllowanceUpdate
    ? (Date.now() / 1000) >= (Number(lastAllowanceUpdate) + 86400)
    : true // Can claim if never claimed before

  const handleClaimDailyAllowance = () => {
    if (!address) return

    writeContract({
      address: TIP_TOKEN_ADDRESS,
      abi: TIP_TOKEN_ABI,
      functionName: 'updateDailyAllowance',
      args: [address],
    })
  }

  // SDK is already initialized in providers.tsx
  // No need to call ready() again here

  const isOwner = address && owner && address.toLowerCase() === owner.toLowerCase()

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto">
      <div className="space-y-6">
        <header className="text-center">
          <h1 className="text-4xl font-bold mb-2">💡 TIP Token</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Tip, trade, and manage TIP tokens on Base
          </p>
        </header>

        {!isConnected ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Connect Wallet</h2>
            <button
              onClick={() => connect({ connector: connectors[0] })}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition"
            >
              Connect with Farcaster
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Your Address</p>
                <p className="font-mono text-sm">{address}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">TIP Balance</p>
                  <p className="text-2xl font-bold">
                    {balance ? formatEther(balance) : '0'} TIP
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Tip Allowance</p>
                  <p className="text-2xl font-bold">
                    {tipAllowance ? formatEther(tipAllowance) : '0'} TIP
                  </p>
                </div>
              </div>
            </div>

            {/* Daily Allowance Claim Section */}
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-lg p-6 shadow-lg space-y-4">
              <h2 className="text-lg font-semibold">🎁 Daily Tip Allowance</h2>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Tips Sent</p>
                  <p className="text-lg font-bold">
                    {totalTipsSent ? formatEther(totalTipsSent) : '0'}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Tips Received</p>
                  <p className="text-lg font-bold">
                    {totalTipsReceived ? formatEther(totalTipsReceived) : '0'}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Daily Claim</p>
                  <p className="text-lg font-bold">
                    {dailyAllowance ? formatEther(dailyAllowance) : '0'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleClaimDailyAllowance}
                disabled={!canClaim || isPending || isConfirming}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition"
              >
                {!canClaim
                  ? '⏳ Next claim available in 24h'
                  : isPending
                  ? 'Confirming...'
                  : isConfirming
                  ? 'Processing...'
                  : '🎁 Claim Daily Allowance'}
              </button>

              {hash && (
                <div className="text-sm space-y-2">
                  <p className="text-green-600 font-medium">
                    {isSuccess ? '✅ Daily allowance claimed!' : '⏳ Transaction pending...'}
                  </p>
                  <a
                    href={`https://basescan.org/tx/${hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline block"
                  >
                    View on BaseScan →
                  </a>
                </div>
              )}

              <p className="text-xs text-gray-600 dark:text-gray-400">
                Your daily allowance is calculated based on your TIP balance and tipping activity.
                Claim once every 24 hours to increase your tip allowance!
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/tip"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg text-center transition"
              >
                💸 Tip Someone
              </Link>

              <Link
                href="/swap"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg text-center transition"
              >
                🔄 Swap TIP/ETH
              </Link>
            </div>

            {isOwner && (
              <div className="bg-purple-100 dark:bg-purple-900 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">👑 Owner Actions</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Link
                    href="/manage"
                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg text-center transition text-sm"
                  >
                    Manage Allowances
                  </Link>
                  <Link
                    href="/batch"
                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg text-center transition text-sm"
                  >
                    Batch Distribution
                  </Link>
                </div>
              </div>
            )}

            <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 text-sm">
              <p className="font-semibold mb-2">Contract Info</p>
              <p className="text-gray-600 dark:text-gray-400 font-mono text-xs break-all">
                {TIP_TOKEN_ADDRESS}
              </p>
              <a
                href={`https://basescan.org/address/${TIP_TOKEN_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-xs"
              >
                View on BaseScan →
              </a>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
