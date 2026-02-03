import './lib/dns-patch';
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/products',
        destination: '/products/all',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
