'use client'

import { useState } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther, isAddress } from 'viem'
import Link from 'next/link'
import { TIP_TOKEN_ADDRESS } from '@/lib/wagmi'
import { TIP_TOKEN_ABI } from '@/lib/tip-abi'

export default function TipPage() {
  const { address, isConnected } = useAccount()
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')

  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  // Read user's tip allowance
  const { data: tipAllowance } = useReadContract({
    address: TIP_TOKEN_ADDRESS,
    abi: TIP_TOKEN_ABI,
    functionName: 'tipAllowance',
    args: address ? [address] : undefined,
  })

  const handleTip = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAddress(recipient)) {
      alert('Invalid recipient address')
      return
    }

    try {
      const amountWei = parseEther(amount)

      writeContract({
        address: TIP_TOKEN_ADDRESS,
        abi: TIP_TOKEN_ABI,
        functionName: 'tip',
        args: [recipient as `0x${string}`, amountWei],
      })
    } catch (error) {
      console.error('Error tipping:', error)
      alert('Error: ' + (error as Error).message)
    }
  }

  if (!isConnected) {
    return (
      <main className="min-h-screen p-6 max-w-2xl mx-auto">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please connect your wallet</h1>
          <Link href="/" className="text-blue-600 hover:underline">
            Go back home
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto">
      <div className="space-y-6">
        <header>
          <Link href="/" className="text-blue-600 hover:underline text-sm">
            ← Back
          </Link>
          <h1 className="text-3xl font-bold mt-2">💸 Tip TIP Tokens</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Send TIP tokens to any address
          </p>
        </header>

        <div className="bg-purple-100 dark:bg-purple-900 rounded-lg p-4">
          <p className="text-sm">
            <span className="font-semibold">Your Tip Allowance:</span>{' '}
            {tipAllowance ? formatEther(tipAllowance) : '0'} TIP
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            You can mint this many TIP tokens to send to others
          </p>
        </div>

        <form onSubmit={handleTip} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Recipient Address
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x..."
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Amount (TIP)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              step="0.000001"
              min="0"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <div className="flex gap-2 mt-2">
              {['1', '10', '100'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset)}
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
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition"
          >
            {isPending ? 'Confirming...' : isConfirming ? 'Processing...' : 'Send Tip'}
          </button>

          {hash && (
            <div className="text-sm space-y-2">
              <p className="text-green-600 font-medium">
                {isSuccess ? '✅ Tip sent successfully!' : '⏳ Transaction pending...'}
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
          <h3 className="font-semibold mb-2">ℹ️ How Tipping Works</h3>
          <ul className="space-y-1 text-gray-600 dark:text-gray-400">
            <li>• Tipping <strong>mints new tokens</strong> to the recipient</li>
            <li>• Uses your tip allowance (doesn't transfer your balance)</li>
            <li>• Recipient receives tokens instantly</li>
            <li>• Your allowance decreases by the amount tipped</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
