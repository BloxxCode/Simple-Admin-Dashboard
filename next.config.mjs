/** @type {import('next').NextConfig} */
const nextConfig = {
    serverRuntimeConfig: {
        MONGODB_URI: process.env.MONGODB_URI,
    }
};

export default nextConfig;
