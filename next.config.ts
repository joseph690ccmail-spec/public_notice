import type { NextConfig } from "next";
import { helmetHeadersForNextConfig } from "./lib/security/helmet-headers";

const pageSecurityHeaders = helmetHeadersForNextConfig("page");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: pageSecurityHeaders,
      },
    ];
  },
};

export default nextConfig;