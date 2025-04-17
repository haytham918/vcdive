import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    async rewrites() {
        return [
            {
                source: "/backend/:path*",
                destination: "http://127.0.0.1:5000/backend/:path*",
            },
        ];
    },
};

export default nextConfig;
