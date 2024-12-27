/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  // cleanDistDir: true,
  // swcMinify: false, // Disable SWC minification
  // productionBrowserSourceMaps: true, // Enable source maps
  // // Customize webpack config for better readability
  // webpack: (config, { dev, isServer }) => {

  //   if (!isServer) {
  //     console.dir(config, { depth: null })
  //     config.optimization.minimize = false;
  //     // config.output.filename = '[name].js';
  //     config.output.filename = 'static/chunks/[name].js';
  //     config.output.chunkFilename = 'static/chunks/[name].js';
  //   }
  //   return config;
  // }
};

module.exports = nextConfig;