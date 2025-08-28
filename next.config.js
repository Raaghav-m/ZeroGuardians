/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer, webpack }) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "node:crypto": "crypto-browserify",
      "node:stream": "stream-browserify",
      "node:buffer": "buffer",
      "node:util": "util",
      "node:assert": "assert",
      "node:zlib": "browserify-zlib",
      "web-worker/cjs/node.js": "web-worker/cjs/browser.js",
      "node:readline": false,
      "node:tty": false,
    };

    if (!isServer) {
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        crypto: require.resolve("crypto-browserify"),
        stream: require.resolve("stream-browserify"),
        buffer: require.resolve("buffer/"),
        util: require.resolve("util/"),
        assert: require.resolve("assert/"),
        zlib: require.resolve("browserify-zlib"),
        fs: false,
        path: false,
        os: false,
        child_process: false,
        net: false,
        tls: false,
        readline: false,
        tty: false,
      };

      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ["buffer", "Buffer"],
          process: ["process"],
        })
      );
    }

    return config;
  },
};

module.exports = nextConfig;
