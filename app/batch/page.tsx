'use client'

import { useState } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, isAddress } from 'viem'
import Link from 'next/link'
import { TIP_TOKEN_ADDRESS } from '@/lib/wagmi'
import { TIP_TOKEN_ABI } from '@/lib/tip-abi'

interface AddressAllowance {
  address: string
  amount: string
}

const BATCH_SIZE = 100 // Number of addresses per transaction

export default function BatchPage() {
  const { address, isConnected } = useAccount()
  const [csvText, setCsvText] = useState('')
  const [parsedData, setParsedData] = useState<AddressAllowance[]>([])
  const [currentBatch, setCurrentBatch] = useState(0)
  const [completedBatches, setCompletedBatches] = useState(0)

  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
    onSuccess: () => {
      setCompletedBatches((prev) => prev + 1)
      if (currentBatch < totalBatches - 1) {
        // Auto-submit next batch
        setTimeout(() => submitBatch(currentBatch + 1), 1000)
      }
    },
  })

  // Read contract owner
  const { data: owner } = useReadContract({
    address: TIP_TOKEN_ADDRESS,
    abi: TIP_TOKEN_ABI,
    functionName: 'owner',
  })

  const isOwner = address && owner && address.toLowerCase() === owner.toLowerCase()

  const parseCSV = () => {
    const lines = csvText.trim().split('\n')
    const data: AddressAllowance[] = []
    const errors: string[] = []

    // Skip header if present
    const startIndex = lines[0].toLowerCase().includes('address') ? 1 : 0

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      const [addr, amt] = line.split(',').map(s => s.trim())

      if (!isAddress(addr)) {
        errors.push(`Line ${i + 1}: Invalid address "${addr}"`)
        continue
      }

      const amount = parseFloat(amt)
      if (isNaN(amount) || amount < 0) {
        errors.push(`Line ${i + 1}: Invalid amount "${amt}"`)
        continue
      }

      data.push({ address: addr, amount: amt })
    }

    if (errors.length > 0) {
      alert('Errors found:\n' + errors.join('\n'))
      return
    }

    setParsedData(data)
    setCurrentBatch(0)
    setCompletedBatches(0)
  }

  const totalBatches = Math.ceil(parsedData.length / BATCH_SIZE)

  const submitBatch = async (batchIndex: number) => {
    const start = batchIndex * BATCH_SIZE
    const end = Math.min(start + BATCH_SIZE, parsedData.length)
    const batch = parsedData.slice(start, end)

    const addresses = batch.map(item => item.address as `0x${string}`)
    const amounts = batch.map(item => parseEther(item.amount))

    setCurrentBatch(batchIndex)

    try {
      writeContract({
        address: TIP_TOKEN_ADDRESS,
        abi: TIP_TOKEN_ABI,
        functionName: 'updateTipAllowances',
        args: [addresses, amounts],
      })
    } catch (error) {
      console.error('Error submitting batch:', error)
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
            You must be the contract owner to batch distribute allowances
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
          <h1 className="text-3xl font-bold mt-2">📦 Batch Distribution</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Distribute tip allowances to 1000+ addresses
          </p>
        </header>

        <div className="bg-yellow-100 dark:bg-yellow-900 rounded-lg p-4 text-sm">
          <p className="font-semibold mb-2">⚠️ CSV Format</p>
          <pre className="bg-white dark:bg-gray-800 p-3 rounded text-xs overflow-x-auto">
{`address,amount
0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb,100
0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045,50`}
          </pre>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Header row optional. Each line: address,amount
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg space-y-4">
          <h2 className="text-lg font-semibold">📝 Input CSV Data</h2>
          <textarea
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder="Paste CSV data here..."
            rows={10}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 font-mono text-sm focus:ring-2 focus:ring-purple-500"
          />

          <button
            onClick={parseCSV}
            disabled={!csvText.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition"
          >
            Parse CSV ({csvText.trim().split('\n').length} lines)
          </button>
        </div>

        {parsedData.length > 0 && (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg space-y-4">
              <h2 className="text-lg font-semibold">📊 Batch Summary</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Addresses</p>
                  <p className="text-2xl font-bold">{parsedData.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Batches</p>
                  <p className="text-2xl font-bold">{totalBatches}</p>
                </div>
              </div>

              <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded-lg">
                <p className="text-sm font-medium">
                  Progress: {completedBatches} / {totalBatches} batches
                </p>
                <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2 mt-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all"
                    style={{ width: `${(completedBatches / totalBatches) * 100}%` }}
                  />
                </div>
              </div>

              {completedBatches < totalBatches && (
                <button
                  onClick={() => submitBatch(currentBatch)}
                  disabled={isPending || isConfirming}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition"
                >
                  {isPending || isConfirming
                    ? `Processing Batch ${currentBatch + 1}/${totalBatches}...`
                    : completedBatches === 0
                    ? 'Start Distribution'
                    : `Continue (Batch ${currentBatch + 1}/${totalBatches})`}
                </button>
              )}

              {completedBatches === totalBatches && (
                <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg text-center">
                  <p className="text-lg font-bold text-green-700 dark:text-green-300">
                    ✅ All batches completed!
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {parsedData.length} addresses updated
                  </p>
                </div>
              )}

              {hash && (
                <div className="text-sm">
                  <a
                    href={`https://basescan.org/tx/${hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline block"
                  >
                    View Latest Transaction on BaseScan →
                  </a>
                </div>
              )}
            </div>

            <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 max-h-64 overflow-y-auto">
              <h3 className="font-semibold mb-2 text-sm">Preview (First 10)</h3>
              <div className="space-y-1 text-xs font-mono">
                {parsedData.slice(0, 10).map((item, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{item.address}</span>
                    <span className="font-semibold">{item.amount} TIP</span>
                  </div>
                ))}
                {parsedData.length > 10 && (
                  <p className="text-gray-500 italic">
                    ... and {parsedData.length - 10} more
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 text-sm">
          <h3 className="font-semibold mb-2">ℹ️ How Batch Distribution Works</h3>
          <ul className="space-y-1 text-gray-600 dark:text-gray-400">
            <li>• Addresses are automatically split into batches of {BATCH_SIZE}</li>
            <li>• Each batch requires one transaction confirmation</li>
            <li>• Batches are submitted sequentially after confirmation</li>
            <li>• You can pause and resume at any time</li>
            <li>• Failed batches can be retried individually</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
