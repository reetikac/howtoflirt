/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Generate unique build ID to prevent caching issues
  generateBuildId: async () => {
    return `build-${Date.now()}`
  },
  // Add headers to prevent caching
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
