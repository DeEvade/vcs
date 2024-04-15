// next.config.mjs
// Contains configuration for e.g. building a production version of the app
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // basePath: '/vcs', // required for some nginx production build
    // You can uncomment these if static exporting and serving from a sub-directory
    // basePath: '/vcs',
    // assetPrefix: '/vcs',
}

export default nextConfig
