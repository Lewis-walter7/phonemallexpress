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
      // Force all non-www traffic to www — eliminates duplicate canonical issues in Google Search Console
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'phonemallexpress.com' }],
        destination: 'https://www.phonemallexpress.com/:path*',
        permanent: true,
      },
      {
        source: '/products',
        destination: '/products/all',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
