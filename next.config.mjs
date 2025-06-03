/** @type {import('next').NextConfig} */
export default {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "astagereborn.com",
        pathname: "/**",
      },
    ],
  },
};
