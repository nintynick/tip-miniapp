import { http, createConfig } from 'wagmi'
import { base } from 'wagmi/chains'
import { farcasterMiniApp as miniAppConnector } from '@farcaster/miniapp-wagmi-connector'

export const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
  connectors: [miniAppConnector()],
  ssr: true,
})

// TIP Token contract address on Base (with daily allowance features)
export const TIP_TOKEN_ADDRESS = '0xcDE93F4AAE50B72797743B6101854bB376D8ABCD' as const

// Uniswap V2 Router on Base
export const UNISWAP_V2_ROUTER = '0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24' as const

// TIP/ETH Pair address
export const TIP_ETH_PAIR = '0xb4f6a33761dcd763ee19fda7f947d793f400c021' as const
