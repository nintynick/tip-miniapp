'use client'

import { useState } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther, isAddress } from 'viem'
import Link from 'next/link'
import { TIP_TOKEN_ADDRESS } from '@/lib/wagmi'
import { TIP_TOKEN_ABI } from '@/lib/tip-abi'

export default function ManagePage() {
  const { address, isConnected } = useAccount()
  const [recipient, setRecipient] = useState('')
  const [allowanceAmount, setAllowanceAmount] = useState('')
  const [lookupAddress, setLookupAddress] = useState('')

  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  // Read contract owner
  const { data: owner } = useReadContract({
    address: TIP_TOKEN_ADDRESS,
    abi: TIP_TOKEN_ABI,
    functionName: 'owner',
  })

  // Read tip allowance for lookup address
  const { data: queriedAllowance } = useReadContract({
    address: TIP_TOKEN_ADDRESS,
    abi: TIP_TOKEN_ABI,
    functionName: 'tipAllowance',
    args: lookupAddress && isAddress(lookupAddress) ? [lookupAddress as `0x${string}`] : undefined,
  })

  const isOwner = address && owner && address.toLowerCase() === owner.toLowerCase()

  const handleSetAllowance = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAddress(recipient)) {
      alert('Invalid recipient address')
      return
    }

    try {
      const amountWei = parseEther(allowanceAmount)

      writeContract({
        address: TIP_TOKEN_ADDRESS,
        abi: TIP_TOKEN_ABI,
        functionName: 'updateTipAllowances',
        args: [[recipient as `0x${string}`], [amountWei]],
      })
    } catch (error) {
      console.error('Error setting allowance:', error)
      alert('Error: ' + (error as Error).message)
    }
  }

  if (!isConnected) {
    return (
      <main className="min-h-screen p-6 max-w-2xl mx-auto">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please connect your wallet</h1>
          <Link href="/" className="text-blue-600 hover:underline">Go back home</Link>
        </div>
      </main>
    )
  }

  if (!isOwner) {
    return (
      <main className="min-h-screen p-6 max-w-2xl mx-auto">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">👑 Owner Only</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You must be the contract owner to manage allowances
          </p>
          <Link href="/" className="text-blue-600 hover:underline">Go back home</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto">
      <div className="space-y-6">
        <header>
          <Link href="/" className="text-blue-600 hover:underline text-sm">← Back</Link>
          <h1 className="text-3xl font-bold mt-2">👑 Manage Tip Allowances</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Set tip allowances for individual addresses
          </p>
        </header>

        {/* Lookup Allowance */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg space-y-4">
          <h2 className="text-lg font-semibold">🔍 Lookup Allowance</h2>
          <div>
            <label className="block text-sm font-medium mb-2">Address</label>
            <input
              type="text"
              value={lookupAddress}
              onChange={(e) => setLookupAddress(e.target.value)}
              placeholder="0x..."
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {lookupAddress && isAddress(lookupAddress) && (
            <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
              <p className="text-sm font-medium">Current Allowance</p>
              <p className="text-2xl font-bold">
                {queriedAllowance ? formatEther(queriedAllowance) : '0'} TIP
              </p>
            </div>
          )}
        </div>

        {/* Set Allowance */}
        <form onSubmit={handleSetAllowance} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg space-y-4">
          <h2 className="text-lg font-semibold">✏️ Set Allowance</h2>

          <div>
            <label className="block text-sm font-medium mb-2">Recipient Address</label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x..."
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Allowance Amount (TIP)
            </label>
            <input
              type="number"
              value={allowanceAmount}
              onChange={(e) => setAllowanceAmount(e.target.value)}
              placeholder="0.0"
              step="0.000001"
              min="0"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-purple-500"
              required
            />
            <div className="flex gap-2 mt-2">
              {['100', '1000', '10000', '100000'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAllowanceAmount(preset)}
                  className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending || isConfirming}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition"
          >
            {isPending ? 'Confirming...' : isConfirming ? 'Processing...' : 'Set Allowance'}
          </button>

          {hash && (
            <div className="text-sm space-y-2">
              <p className="text-green-600 font-medium">
                {isSuccess ? '✅ Allowance updated!' : '⏳ Transaction pending...'}
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
        </form>

        <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 text-sm">
          <h3 className="font-semibold mb-2">ℹ️ About Tip Allowances</h3>
          <ul className="space-y-1 text-gray-600 dark:text-gray-400">
            <li>• Tip allowance controls how many TIP tokens a user can mint</li>
            <li>• Setting an allowance <strong>replaces</strong> the previous value</li>
            <li>• To remove allowance, set it to 0</li>
            <li>• Users can tip to any address, not just their own</li>
            <li>• For bulk distribution, use the <Link href="/batch" className="text-blue-600 hover:underline">Batch page</Link></li>
          </ul>
        </div>
      </div>
    </main>
  )
}
