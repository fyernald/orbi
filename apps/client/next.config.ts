import path from "node:path";
import type { NextConfig } from "next";

// In development the browser talks to Next.js only, and /api/* is forwarded to the Fastify server.
// In production the reverse proxy (Caddy) sends /api/* to the server directly.
const apiUrl = process.env.API_URL ?? "http://localhost:3001";

const nextConfig: NextConfig = {
  output: "standalone",
  // Needed so the standalone build can find files from the packages in this monorepo.
  outputFileTracingRoot: path.join(process.cwd(), "../../"),
  // These workspace packages are shipped as TypeScript source.
  transpilePackages: ["@orbi/shared", "@orbi/core"],
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${apiUrl}/api/:path*` }];
  },
};

export default nextConfig;
