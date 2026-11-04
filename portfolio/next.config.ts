import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [new URL("https://raw.githubusercontent.com/meetkapadia1710-tech/**")],
  },
};
export default nextConfig;
