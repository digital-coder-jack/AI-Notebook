/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [{ source: "/app/:path*", destination: "/" }];
  },
};
export default nextConfig;
