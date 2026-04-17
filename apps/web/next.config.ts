import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gw8hy3fdcv.ufs.sh',
      },
    ],
  },
  reactCompiler: true,
};

export default nextConfig;
