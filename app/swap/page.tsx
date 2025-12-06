'use client'

import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import Link from 'next/link'
import { TIP_TOKEN_ADDRESS, UNISWAP_V2_ROUTER, TIP_ETH_PAIR } from '@/lib/wagmi'
import { TIP_TOKEN_ABI } from '@/lib/tip-abi'

const UNISWAP_ROUTER_ABI = [
  {
    "inputs": [{"internalType": "uint256","name": "amountOutMin","type": "uint256"},{"internalType": "address[]","name": "path","type": "address[]"},{"internalType": "address","name": "to","type": "address"},{"internalType": "uint256","name": "deadline","type": "uint256"}],
    "name": "swapExactETHForTokens",
    "outputs": [{"internalType": "uint256[]","name": "amounts","type": "uint256[]"}],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256","name": "amountIn","type": "uint256"},{"internalType": "uint256","name": "amountOutMin","type": "uint256"},{"internalType": "address[]","name": "path","type": "address[]"},{"internalType": "address","name": "to","type": "address"},{"internalType": "uint256","name": "deadline","type": "uint256"}],
    "name": "swapExactTokensForETH",
    "outputs": [{"internalType": "uint256[]","name": "amounts","type": "uint256[]"}],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const

const WETH_ADDRESS = '0x4200000000000000000000000000000000000006' // Base WETH

export default function SwapPage() {
  const { address, isConnected } = useAccount()
  const [swapDirection, setSwapDirection] = useState<'ETH_TO_TIP' | 'TIP_TO_ETH'>('ETH_TO_TIP')
  const [amount, setAmount] = useState('')
  const [slippage, setSlippage] = useState('0.5') // Default 0.5% slippage

  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  // Read user's TIP balance
  const { data: tipBalance } = useReadContract({
    address: TIP_TOKEN_ADDRESS,
    abi: TIP_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  })

  // Read allowance for router
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: TIP_TOKEN_ADDRESS,
    abi: TIP_TOKEN_ABI,
    functionName: 'allowance',
    args: address ? [address, UNISWAP_V2_ROUTER] : undefined,
  })

  // Refetch allowance after successful approval
  useEffect(() => {
    if (isSuccess && hash) {
      refetchAllowance()
    }
  }, [isSuccess, hash, refetchAllowance])

  const handleApprove = async () => {
    try {
      writeContract({
        address: TIP_TOKEN_ADDRESS,
        abi: TIP_TOKEN_ABI,
        functionName: 'approve',
        args: [UNISWAP_V2_ROUTER, parseEther('1000000')], // Approve 1M TIP
      })
    } catch (error) {
      console.error('Error approving:', error)
      alert('Error: ' + (error as Error).message)
    }
  }

  const handleSwap = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200) // 20 minutes
      const slippageBps = Math.floor(parseFloat(slippage) * 100) // Convert to basis points

      if (swapDirection === 'ETH_TO_TIP') {
        // Swap ETH for TIP
        // For simplicity, we use a basic slippage calculation
        // In production, you'd fetch pool reserves to calculate expected output
        const amountIn = parseEther(amount)
        const minOutput = (amountIn * BigInt(10000 - slippageBps)) / 10000n

        writeContract({
          address: UNISWAP_V2_ROUTER,
          abi: UNISWAP_ROUTER_ABI,
          functionName: 'swapExactETHForTokens',
          args: [
            minOutput,
            [WETH_ADDRESS, TIP_TOKEN_ADDRESS],
            address!,
            deadline,
          ],
          value: parseEther(amount),
        })
      } else {
        // Swap TIP for ETH
        const amountIn = parseEther(amount)
        const minOutput = (amountIn * BigInt(10000 - slippageBps)) / 10000n

        writeContract({
          address: UNISWAP_V2_ROUTER,
          abi: UNISWAP_ROUTER_ABI,
          functionName: 'swapExactTokensForETH',
          args: [
            amountIn,
            minOutput,
            [TIP_TOKEN_ADDRESS, WETH_ADDRESS],
            address!,
            deadline,
          ],
        })
      }
    } catch (error) {
      console.error('Error swapping:', error)
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

  const needsApproval = swapDirection === 'TIP_TO_ETH' && (!allowance || allowance < parseEther(amount || '0'))

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto">
      <div className="space-y-6">
        <header>
          <Link href="/" className="text-blue-600 hover:underline text-sm">← Back</Link>
          <h1 className="text-3xl font-bold mt-2">🔄 Swap TIP/ETH</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Trade on Uniswap V2</p>
        </header>

        <div className="bg-green-100 dark:bg-green-900 rounded-lg p-4">
          <p className="text-sm">
            <span className="font-semibold">Your TIP Balance:</span>{' '}
            {tipBalance ? formatEther(tipBalance) : '0'} TIP
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => setSwapDirection('ETH_TO_TIP')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                swapDirection === 'ETH_TO_TIP'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              Buy TIP
            </button>
            <button
              onClick={() => setSwapDirection('TIP_TO_ETH')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                swapDirection === 'TIP_TO_ETH'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              Sell TIP
            </button>
          </div>

          <form onSubmit={handleSwap} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Amount ({swapDirection === 'ETH_TO_TIP' ? 'ETH' : 'TIP'})
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                step="0.000001"
                min="0"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500"
                required
              />
              <div className="flex gap-2 mt-2">
                {swapDirection === 'ETH_TO_TIP'
                  ? ['0.001', '0.01', '0.1'].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setAmount(preset)}
                        className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-600"
                      >
                        {preset} ETH
                      </button>
                    ))
                  : ['100', '1000', '10000'].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setAmount(preset)}
                        className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-600"
                      >
                        {preset} TIP
                      </button>
                    ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Slippage Tolerance (%)
              </label>
              <input
                type="number"
                value={slippage}
                onChange={(e) => setSlippage(e.target.value)}
                placeholder="0.5"
                step="0.1"
                min="0"
                max="50"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-2 mt-2">
                {['0.1', '0.5', '1.0', '3.0'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setSlippage(preset)}
                    className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    {preset}%
                  </button>
                ))}
              </div>
            </div>

            {needsApproval ? (
              <button
                type="button"
                onClick={handleApprove}
                disabled={isPending || isConfirming}
                className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition"
              >
                {isPending ? 'Approving...' : 'Approve TIP'}
              </button>
            ) : (
              <button
                type="submit"
                disabled={isPending || isConfirming}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition"
              >
                {isPending ? 'Confirming...' : isConfirming ? 'Processing...' : 'Swap'}
              </button>
            )}

            {hash && (
              <div className="text-sm space-y-2">
                <p className="text-green-600 font-medium">
                  {isSuccess ? '✅ Swap completed!' : '⏳ Transaction pending...'}
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
        </div>

        <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 text-sm">
          <h3 className="font-semibold mb-2">📊 Pool Info</h3>
          <p className="text-gray-600 dark:text-gray-400 text-xs">
            Pair: <span className="font-mono">{TIP_ETH_PAIR}</span>
          </p>
          <a
            href={`https://basescan.org/address/${TIP_ETH_PAIR}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-xs"
          >
            View Pool on BaseScan →
          </a>
        </div>
      </div>
    </main>
  )
}
