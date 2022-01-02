const { merge } = require('webpack-merge');
const ESLintPlugin = require('eslint-webpack-plugin');
const baseConfig = require('./webpack.config.base');

module.exports = (env) => {
  const devConfig = {
    /**
     * webpack --env mode=development ...
     * webpack --env mode=production ...
     */
    mode: 'development',

    /**
     * https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CSP
     * https://stackoverflow.com/questions/48047150/chrome-extension-compiled-by-webpack-throws-unsafe-eval-error
     * https://webpack.docschina.org/configuration/devtool/#root
     */
    devtool: 'inline-cheap-source-map',

    plugins: [
      new ESLintPlugin({
        extensions: ['js', 'jsx'],
        eslintPath: require.resolve('eslint'),
        context: './src',
        cache: true,
        fix: true,
      }),
    ],
  };

  return merge(baseConfig(env), devConfig);
};
