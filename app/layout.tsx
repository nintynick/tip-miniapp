import type { Metadata } from "next";
import { Providers } from './providers'
import "./globals.css";

export const metadata: Metadata = {
  title: "TIP Token | Farcaster Mini App",
  description: "Tip, trade, and manage TIP tokens on Base",
  manifest: "/manifest.json",
  openGraph: {
    title: "TIP Token | Farcaster Mini App",
    description: "Tip, trade, and manage TIP tokens on Base",
    images: [
      {
        url: "https://tip-miniapp-mu.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "TIP Token - Tip, trade, and manage TIP tokens on Base",
      },
    ],
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  other: {
    'fc:miniapp': JSON.stringify({
      version: "1",
      imageUrl: "https://tip-miniapp-mu.vercel.app/feed-image.png",
      button: {
        title: "TIP Token",
        action: {
          type: "launch_frame",
          name: "TIP Token",
          url: "https://tip-miniapp-mu.vercel.app",
          splashImageUrl: "https://tip-miniapp-mu.vercel.app/splash-200.png",
          splashBackgroundColor: "#9333ea"
        }
      }
    })
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
