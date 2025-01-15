import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // 生成独立部署包
  poweredByHeader: false, // 移除 X-Powered-By 头
  compress: true, // 启用 gzip 压缩
  reactStrictMode: true, // 启用严格模式
  env: {
    // 添加环境变量
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://10.11.230.83:8000/api'
  }
};

export default nextConfig;
