import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  async rewrites() {
    const defaultBackend =
      process.env.NODE_ENV === 'production'
        ? 'https://storyforge-backend.onrender.com/api'
        : 'http://localhost:5000/api';
    const targetApi = process.env.NEXT_PUBLIC_API_URL || defaultBackend;
    return [
      {
        source: '/api/:path*',
        destination: `${targetApi}/:path*`,
      },
    ];
  },
};

export default nextConfig;
