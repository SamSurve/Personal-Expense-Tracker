/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ['172.20.10.2', 'localhost'],
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
  },
}

export default nextConfig
