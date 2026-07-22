import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* 如果你原本有設定其他東西（如 experimental 裡的其他欄位），請保留 */

  experimental: {
    turbo: {
      rules: {
        // 這裡可以保持空白，或放你原本的規則
      },
    },
  },

  // 💡 Turbopack 專用的忽略監聽設定
  watchOptions: {
    ignored: [
      '**/node_modules/**',
      '**/.next/**',
      '**/potatoes-vector-pipeline/**', // 排除你的向量流水線資料夾
    ],
  },
};

export default nextConfig;