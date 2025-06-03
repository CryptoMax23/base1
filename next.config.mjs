/** @type {import('next').NextConfig} */
const nextConfig = { 
    turbopack: {},
    images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'astagereborn.com',
        pathname: '/**',
      },
    ],
  },
};
export default nextConfig;
