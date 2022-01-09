const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const Dotenv = require('dotenv-webpack');

const manifest = require('../src/manifest');

module.exports = (env) => ({
  entry: {
    background: './src/background/index.ts',
    popup: './src/popup/index.tsx',
    content: './src/content/index.ts',
    // options: './src/options.tsx',
  },

  output: {
    path: path.resolve('./dist'),
    filename: '[name].js',
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
        sideEffects: true,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },

  plugins: [
    /**
     * parse .env file
     */
    new Dotenv({
      path: path.resolve(`./.env.${env.NODE_ENV}`)
    }),

    new HtmlWebpackPlugin({
      filename: 'popup.html',
      template: 'public/template.html',
      chunks: ['popup'],
    }),
    new HtmlWebpackPlugin({
      filename: 'options.html',
      template: 'public/template.html',
      chunks: ['options'],
    }),

    new CopyPlugin({
      patterns: [
        // build manifest.json with 'src/manifest.js'
        { from: 'src/manifest.js', to: 'manifest.json', transform: () => JSON.stringify(manifest(env)) },

        // copy icons to dist/icons
        { from: 'public/icons', to: 'icons/' },

        // copy _locales to dist/_locales
        { from: 'public/_locales', to: '_locales/' },
      ],
    }),

    // Clean the dist directory before building
    new CleanWebpackPlugin(),

    // new BundleAnalyzerPlugin(),
  ],

  optimization: {
    usedExports: true,

    splitChunks: {
      chunks: 'async',
      minSize: 20000,
      minRemainingSize: 0,
      minChunks: 1,
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
      enforceSizeThreshold: 50000,
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          reuseExistingChunk: true,
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
  },
});
