/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/quacktosql',
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

    // Exclude ONNX runtime binary files
    config.module.rules.push({
      test: /\.node$/,
      use: 'node-loader',
    });

    // Ignore ONNX runtime binary files
    config.resolve.alias = {
      ...config.resolve.alias,
      'onnxruntime-node': false,
    };

    return config;
  },
  // Allow specific packages to be used in Client Components
  transpilePackages: ['@huggingface/transformers'],
  reactStrictMode: true,
  trailingSlash: true,
};

module.exports = nextConfig; 
