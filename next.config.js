/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Add WASM support
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    // Worker loader configuration
    config.module.rules.push({
      test: /\.worker\.(js|ts)$/,
      use: { loader: 'worker-loader' },
    });

    return config;
  },
  // Allow specific packages to be used in Client Components
  transpilePackages: ['@xenova/transformers'],
  reactStrictMode: true,
};

module.exports = nextConfig; 
