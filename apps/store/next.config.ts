import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Permite o build mesmo com erros de TypeScript
    // Remova quando estabilizar o projeto
    ignoreBuildErrors: true,
  },
  eslint: {
    // Permite o build mesmo com warnings de ESLint
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
