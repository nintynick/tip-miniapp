import type { Metadata } from "next";
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from '@/lib/wagmi'
import "./globals.css";

const queryClient = new QueryClient()

export const metadata: Metadata = {
  title: "TIP Token | Farcaster Mini App",
  description: "Tip, trade, and manage TIP tokens on Base",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
