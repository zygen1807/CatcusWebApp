import type { NextConfig } from "next";

const nextConfig: NextConfig = {
<<<<<<< HEAD
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
=======
  /* config options here */
};

export default nextConfig;
>>>>>>> bab7634c8c6e5fc1248e5e3d381abd8e455a92d7
