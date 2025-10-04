import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static export for Netlify
  output: 'export',
  
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
  
  // Trailing slash for better routing
  trailingSlash: true,
  
  // Ensure proper base path
  basePath: '',
  
  // Disable server-side features
  reactStrictMode: true,
  
  // Cross-platform compatibility
  webpack: (config, { isServer }) => {
    // Fix for Windows
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;
