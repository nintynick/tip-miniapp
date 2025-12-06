/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/.well-known/farcaster.json',
        destination: 'https://api.farcaster.xyz/miniapps/hosted-manifest/019af573-75ac-1b3b-2ef0-bd88714720f5',
        permanent: false, // 307 temporary redirect
      },
    ]
  },
}

module.exports = nextConfig
