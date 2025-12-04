/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: true,
  async rewrites() {
    const backendOrigin = (() => {
      const fromEnv = process.env.BACKEND_ORIGIN;
      const fromPublic = process.env.NEXT_PUBLIC_API_BASE_URL;
      const isDocker = process.env.IS_DOCKER === 'true';
      const backendPort = process.env.BACKEND_PORT || '4000';

      if (fromEnv) return fromEnv;
      if (isDocker) return `http://backend:${backendPort}`;
      if (fromPublic) return fromPublic.replace(/\/?api\/?$/, '');

      return `http://localhost:${backendPort}`;
    })();

    console.log('[Next.js] Rewriting API requests to:', backendOrigin);

    return [
      {
        source: '/api/:path*',
        destination: `${backendOrigin}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
