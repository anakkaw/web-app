import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/web-app',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
