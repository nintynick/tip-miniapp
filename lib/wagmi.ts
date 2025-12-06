import { http, createConfig } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { farcasterMiniApp as miniAppConnector } from '@farcaster/miniapp-wagmi-connector'

export const config = createConfig({
  chains: [sepolia],
  transports: {
    [sepolia.id]: http('https://rpc.sepolia.org'),
  },
  connectors: [miniAppConnector()],
  ssr: true,
})

// TIP Token contract address on Sepolia (with daily allowance features)
export const TIP_TOKEN_ADDRESS = '0x11aD1E7fc9809155E9e915b28C255645833E6Bdc' as const

// Uniswap V2 Router on Base
export const UNISWAP_V2_ROUTER = '0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24' as const

// TIP/ETH Pair address
export const TIP_ETH_PAIR = '0xb4f6a33761dcd763ee19fda7f947d793f400c021' as const
