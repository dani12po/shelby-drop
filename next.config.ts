import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  trailingSlash: false,
  generateBuildId: async () => "build",
  eslint:     { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  // Tell Vercel's file tracer to include the WASM binary
  // in the serverless function bundle for /api/upload
  outputFileTracingIncludes: {
    "/api/upload": [
      "./node_modules/@shelby-protocol/clay-codes/dist/clay.wasm",
      "./node_modules/@shelby-protocol/clay-codes/dist/**",
    ],
  },

  webpack: (config, { isServer }) => {
    // Path alias
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "app"),
    };

    // Enable WebAssembly support
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    // For server bundles: treat .wasm as asset/resource
    // so webpack doesn't try to inline it
    if (isServer) {
      config.module.rules.push({
        test: /\.wasm$/,
        type: "asset/resource",
      });
    }

    return config;
  },
};

export default nextConfig;
