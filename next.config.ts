import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { getServerApiUrl } from "./src/lib/api-url";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${getServerApiUrl()}/:path*`,
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
