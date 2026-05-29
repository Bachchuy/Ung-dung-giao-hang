/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // ESLint warnings/errors won't block production builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // TypeScript errors won't block production builds
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
