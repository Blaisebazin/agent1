/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image de sortie minimale, adaptée à un déploiement Docker.
  output: 'standalone',
};

export default nextConfig;
