const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const path = require('path');
const envFilePath = path.resolve(`./.env.${process.env.NODE_ENV}`);
require('dotenv').config({
  path: envFilePath,
});

const Dotenv = require('dotenv-webpack');
const manifest = require('../src/manifest');

module.exports = {
  entry: {
    background: './src/pages/background/index.ts',
    popup: './src/pages/popup/index.tsx',
    content: './src/pages/content/index.ts',
    options: './src/pages/options/index.tsx',
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
    new Dotenv({ path: envFilePath }),

    new HtmlWebpackPlugin({
      filename: 'popup.html',
      template: 'public/template.html',
      chunks: ['popup'],
      title: "Popup - Microsoft To Do browser extension",
    }),
    new HtmlWebpackPlugin({
      filename: 'options.html',
      template: 'public/template.html',
      chunks: ['options'],
      title: "Options - Microsoft To Do browser extension",
    }),

    new CopyPlugin({
      patterns: [
        // build manifest.json with 'src/manifest.js'
        { from: 'src/manifest.js', to: 'manifest.json', transform: () => JSON.stringify(manifest) },

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

  // optimization: {
  //   splitChunks: {
  //     cacheGroups: {
  //       vendor: {
  //         test: /[\\/]node_modules[\\/](react|react-dom|@material-ui|sentry)[\\/]/,
  //         name: 'vendor',
  //         chunks: 'all',
  //       },
  //     },
  //   }
  // } 
}