'use client'

import { useAccount, useConnect, useReadContract } from 'wagmi'
import { formatEther } from 'viem'
import Link from 'next/link'
import { TIP_TOKEN_ADDRESS } from '@/lib/wagmi'
import { TIP_TOKEN_ABI } from '@/lib/tip-abi'

export default function Home() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()

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

  // Read contract owner
  const { data: owner } = useReadContract({
    address: TIP_TOKEN_ADDRESS,
    abi: TIP_TOKEN_ABI,
    functionName: 'owner',
  })

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
