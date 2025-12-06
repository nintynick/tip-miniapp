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
  const [balanceMultiplier, setBalanceMultiplier] = useState('')
  const [tippingSentMultiplier, setTippingSentMultiplier] = useState('')
  const [tippingReceivedMultiplier, setTippingReceivedMultiplier] = useState('')

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

  // Read current multipliers
  const { data: currentBalanceMultiplier } = useReadContract({
    address: TIP_TOKEN_ADDRESS,
    abi: TIP_TOKEN_ABI,
    functionName: 'balanceMultiplier',
  })

  const { data: currentTippingSentMultiplier } = useReadContract({
    address: TIP_TOKEN_ADDRESS,
    abi: TIP_TOKEN_ABI,
    functionName: 'tippingSentMultiplier',
  })

  const { data: currentTippingReceivedMultiplier } = useReadContract({
    address: TIP_TOKEN_ADDRESS,
    abi: TIP_TOKEN_ABI,
    functionName: 'tippingReceivedMultiplier',
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

  const handleUpdateBalanceMultiplier = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Multiplier is scaled by 1e18 (e.g., 1 = 1e18, 2 = 2e18)
      const multiplierWei = parseEther(balanceMultiplier)

      writeContract({
        address: TIP_TOKEN_ADDRESS,
        abi: TIP_TOKEN_ABI,
        functionName: 'updateBalanceMultiplier',
        args: [multiplierWei],
      })
    } catch (error) {
      console.error('Error updating balance multiplier:', error)
      alert('Error: ' + (error as Error).message)
    }
  }

  const handleUpdateTippingSentMultiplier = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Multiplier is scaled by 1e18 (e.g., 1 = 1e18, 2 = 2e18)
      const multiplierWei = parseEther(tippingSentMultiplier)

      writeContract({
        address: TIP_TOKEN_ADDRESS,
        abi: TIP_TOKEN_ABI,
        functionName: 'updateTippingSentMultiplier',
        args: [multiplierWei],
      })
    } catch (error) {
      console.error('Error updating tipping sent multiplier:', error)
      alert('Error: ' + (error as Error).message)
    }
  }

  const handleUpdateTippingReceivedMultiplier = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Multiplier is scaled by 1e18 (e.g., 1 = 1e18, 2 = 2e18)
      const multiplierWei = parseEther(tippingReceivedMultiplier)

      writeContract({
        address: TIP_TOKEN_ADDRESS,
        abi: TIP_TOKEN_ABI,
        functionName: 'updateTippingReceivedMultiplier',
        args: [multiplierWei],
      })
    } catch (error) {
      console.error('Error updating tipping received multiplier:', error)
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
            Set tip allowances and configure daily allowance parameters
          </p>
        </header>

        {/* Daily Allowance Multipliers */}
        <div className="bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 rounded-lg p-6 shadow-lg space-y-4">
          <h2 className="text-lg font-semibold">⚙️ Daily Allowance Parameters</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Configure the multipliers that determine how much daily tip allowance users receive.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Current Values Display */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Balance Multiplier</p>
              <p className="text-2xl font-bold">
                {currentBalanceMultiplier ? formatEther(currentBalanceMultiplier) : '1'}x
              </p>
              <p className="text-xs text-gray-500 mt-1">Rewards holders</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tipping Sent</p>
              <p className="text-2xl font-bold">
                {currentTippingSentMultiplier ? formatEther(currentTippingSentMultiplier) : '1'}x
              </p>
              <p className="text-xs text-gray-500 mt-1">Rewards tippers</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tipping Received</p>
              <p className="text-2xl font-bold">
                {currentTippingReceivedMultiplier ? formatEther(currentTippingReceivedMultiplier) : '1'}x
              </p>
              <p className="text-xs text-gray-500 mt-1">Rewards recipients</p>
            </div>
          </div>

          {/* Formula Explanation */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <p className="text-sm font-semibold mb-2">Daily Allowance Formula:</p>
            <code className="text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded block">
              (Balance × Balance Mult.) + (Tips Sent × Sent Mult.) + (Tips Received × Received Mult.)
            </code>
          </div>

          {/* Update Balance Multiplier */}
          <form onSubmit={handleUpdateBalanceMultiplier} className="space-y-3">
            <label className="block text-sm font-medium">Update Balance Multiplier</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={balanceMultiplier}
                onChange={(e) => setBalanceMultiplier(e.target.value)}
                placeholder="1.0"
                step="0.1"
                min="0"
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="submit"
                disabled={isPending || isConfirming || !balanceMultiplier}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition"
              >
                Update
              </button>
            </div>
            <div className="flex gap-2">
              {['0.5', '1', '2', '5'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setBalanceMultiplier(preset)}
                  className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  {preset}x
                </button>
              ))}
            </div>
          </form>

          {/* Update Tipping Sent Multiplier */}
          <form onSubmit={handleUpdateTippingSentMultiplier} className="space-y-3">
            <label className="block text-sm font-medium">Update Tipping Sent Multiplier</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={tippingSentMultiplier}
                onChange={(e) => setTippingSentMultiplier(e.target.value)}
                placeholder="1.0"
                step="0.1"
                min="0"
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="submit"
                disabled={isPending || isConfirming || !tippingSentMultiplier}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition"
              >
                Update
              </button>
            </div>
            <div className="flex gap-2">
              {['0.5', '1', '2', '5'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setTippingSentMultiplier(preset)}
                  className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  {preset}x
                </button>
              ))}
            </div>
          </form>

          {/* Update Tipping Received Multiplier */}
          <form onSubmit={handleUpdateTippingReceivedMultiplier} className="space-y-3">
            <label className="block text-sm font-medium">Update Tipping Received Multiplier</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={tippingReceivedMultiplier}
                onChange={(e) => setTippingReceivedMultiplier(e.target.value)}
                placeholder="1.0"
                step="0.1"
                min="0"
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="submit"
                disabled={isPending || isConfirming || !tippingReceivedMultiplier}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition"
              >
                Update
              </button>
            </div>
            <div className="flex gap-2">
              {['0.5', '1', '2', '5'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setTippingReceivedMultiplier(preset)}
                  className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  {preset}x
                </button>
              ))}
            </div>
          </form>
        </div>

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
