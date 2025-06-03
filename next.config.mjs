/** @type {import('next').NextConfig} */
const nextConfig = { 
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
