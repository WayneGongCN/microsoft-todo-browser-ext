const path = require('path');
// const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const Dotenv = require('dotenv-webpack');

const manifest = require('./src/manifest');

module.exports = (env) => ({
  /**
   * webpack --env mode=development ...
   * webpack --env mode=production ...
   */
  mode: env.mode,

  /**
   * https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CSP
   * https://stackoverflow.com/questions/48047150/chrome-extension-compiled-by-webpack-throws-unsafe-eval-error
   * https://webpack.docschina.org/configuration/devtool/#root
   */
  devtool: 'cheap-module-source-map',

  entry: {
    background: './src/background/index.js',
    popup: './src/popup.jsx',
    options: './src/options.jsx',
    content: './src/content.js',
  },

  output: {
    path: path.resolve('./dist'),
    filename: '[name].js',
  },

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: { presets: ['@babel/env'] },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: { extensions: ['*', '.js', '.jsx'] },

  plugins: [
    /**
     * parse .env file
     */
    new Dotenv(),

    new ESLintPlugin({
      extensions: ['js', 'jsx'],
      eslintPath: require.resolve('eslint'),
      context: './src',
      cache: true,
      fix: true, // fix on save
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
        // build manifest.json with 'src/manifest/index.js'
        { from: 'src/manifest/index.js', to: 'manifest.json', transform: () => JSON.stringify(manifest) },

        // copy icons to dist/icons
        { from: 'public/icons', to: 'icons/' },
      ],
    }),

    // Clean the dist directory before building
    new CleanWebpackPlugin(),
  ],
});
