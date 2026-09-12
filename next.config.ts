import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["opencascade.js"],

  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.wasm$/,
      type: "javascript/auto",
      loader: "file-loader",
      options: {
        name: "static/wasm/[name].[contenthash:8].[ext]",
        publicPath: "/_next/",
      },
    });

    return config;
  },
};

export default nextConfig;
