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
    eslint: {
        // Warning: This will allow production builds to complete even if there are lint errors.
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;
