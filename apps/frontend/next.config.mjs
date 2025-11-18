/** @type {import('next').NextConfig} */
const backendOrigin = (() => {
  const fromPublic = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  const fromEnv = process.env.BACKEND_ORIGIN || '';
  const pick = fromEnv || fromPublic;
  if (pick) {
    // Strip trailing '/api' if provided
    return pick.replace(/\/?api\/?$/, '');
  }
  return 'http://localhost:4000';
})();

const nextConfig = {
  typedRoutes: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendOrigin}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
