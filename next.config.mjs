/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma', '@react-pdf/renderer'],
  },
  images: {
    remotePatterns: [],
  },
}

export default nextConfig
