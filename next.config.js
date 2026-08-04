/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Temporarily skip ESLint during Vercel build
  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'source.unsplash.com' },
      { protocol: 'https', hostname: 'cf.bstatic.com' },
      { protocol: 'https', hostname: 'photos.hotelbeds.com' },
    ],
  },

  experimental: {
    serverComponentsExternalPackages: [],
  },
};

module.exports = nextConfig;
