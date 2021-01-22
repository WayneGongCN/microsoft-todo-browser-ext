const path = require('path');
// const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = (env) => ({
  mode: env.mode,

  /**
   * https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CSP
   * https://stackoverflow.com/questions/48047150/chrome-extension-compiled-by-webpack-throws-unsafe-eval-error
   * https://webpack.docschina.org/configuration/devtool/#root
   */
  devtool: 'cheap-module-source-map',

  entry: {
    background: './src/background/index.js',
    popup: './src/popup.js',
    // options: './src/options.js',
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
    new Dotenv(),
    new ESLintPlugin({
      extensions: ['js', 'jsx'],
      eslintPath: require.resolve('eslint'),
      context: './src',
      cache: true,
      fix: true,
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
        { from: 'public/manifest.json', to: '' },
        { from: 'public/icons', to: 'icons/' },
      ],
    }),

    new CleanWebpackPlugin(),
  ],
});
