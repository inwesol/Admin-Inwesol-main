import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  eslint: {
    // This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: false,
  },
  typescript: {
    // This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: false,
  },
}

export default nextConfig
