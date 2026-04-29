import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  trailingSlash: false,
  generateBuildId: async () => "build",
  eslint:     { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  // Include clay.wasm and all Shelby SDK files in the serverless bundle
  outputFileTracingIncludes: {
    "/api/upload": [
      "./node_modules/@shelby-protocol/clay-codes/dist/**",
      "./node_modules/@shelby-protocol/sdk/**",
      "./public/clay.wasm",
    ],
  },

  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "app"),
    };

    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    if (isServer) {
      // Output wasm to a predictable static path so patch script can find it
      config.module.rules.push({
        test: /\.wasm$/,
        type: "asset/resource",
        generator: {
          filename: "static/wasm/[name][ext]",
        },
      });
    }

    return config;
  },
};

export default nextConfig;
