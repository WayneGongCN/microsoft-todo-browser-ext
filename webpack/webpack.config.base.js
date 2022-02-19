const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const Dotenv = require('dotenv-webpack');
const { resolve, join } = require('path');
const envFilePath = resolve(join(__dirname, `../.env.${process.env.NODE_ENV}`));
require('dotenv').config({ path: envFilePath });

const manifest = require(join(__dirname, '../src/manifest'));

module.exports = {
  entry: {
    background: join(__dirname, '../src/pages/background/index.ts'),
    popup: join(__dirname, '../src/pages/popup/index.tsx'),
    content: join(__dirname, '../src/pages/content/index.ts'),
    options: join(__dirname, '../src/pages/options/index.tsx'),
  },

  output: {
    path: resolve(join(__dirname, `../dist_${process.env.TARGET}`)),
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

    /**
     * Dotenv not include "TARGET"
     */
    new webpack.EnvironmentPlugin(['TARGET']),

    /**
     * HtmlWebpackPlugin
     */
    new HtmlWebpackPlugin({
      filename: 'popup.html',
      template: join(__dirname, '../public/template.html'),
      chunks: ['popup'],
      title: `Popup ${manifest.name}`,
    }),
    new HtmlWebpackPlugin({
      filename: 'options.html',
      template: join(__dirname, '../public/template.html'),
      chunks: ['options'],
      title: `Options ${manifest.name}`,
    }),

    /**
     * CopyPlugin
     */
    new CopyPlugin({
      patterns: [
        // build manifest.json with 'src/manifest.js'
        { from: join(__dirname, '../src/manifest.js'), to: 'manifest.json', transform: () => JSON.stringify(manifest) },

        // copy icons to dist/icons
        { from: join(__dirname, '../public/icons'), to: 'icons/' },

        // copy _locales to dist/_locales
        { from: join(__dirname, '../public/_locales'), to: '_locales/' },
      ],
    }),

    /**
     * BundleAnalyzerPlugin
     */
    // new BundleAnalyzerPlugin(),

    /**
     * CleanWebpackPlugin
     */
    new CleanWebpackPlugin(),
  ],
};
