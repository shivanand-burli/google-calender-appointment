/** @type {import('next').NextConfig} */
const nextConfig = {
    // CORS CONFIG
    async headers() {
        if (process.env.CORS_ENABLE === 'true') {
            return [
                {
                    // matching all API routes
                    source: "/api/:path*",
                    headers: [
                        { key: "Access-Control-Allow-Credentials", value: "true" },
                        { key: "Access-Control-Allow-Origin", value: process.env.CORS_ALLOWED_ORIGINS },
                        { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
                        { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
                    ]
                }
            ]
        } else {
            return [];
        }
    }
};

export default nextConfig;
