import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/project-budget',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
