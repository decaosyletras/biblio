import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/contacto",
        destination: "/contact",
        permanent: true,
      },
      {
        source: "/contacto2",
        destination: "/contact",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;