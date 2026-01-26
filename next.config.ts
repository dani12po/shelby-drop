import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Disable static generation for 404 page to avoid SSR issues
  trailingSlash: false,
  generateBuildId: async () => {
    return 'build'
  },
};

export default nextConfig;
