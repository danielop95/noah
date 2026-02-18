import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  basePath: process.env.BASEPATH,
  redirects: async () => {
    return [
      {
        source: '/',
        destination: '/es/dashboards',
        permanent: true,
        locale: false
      },
      {
        source: '/:lang(es|en)',
        destination: '/:lang/dashboards',
        permanent: true,
        locale: false
      },
      {
        source: '/:path((?!es|en|front-pages|images|uploads|api|favicon.ico).*)*',
        destination: '/es/:path*',
        permanent: true,
        locale: false
      }
    ]
  }
}

export default nextConfig
