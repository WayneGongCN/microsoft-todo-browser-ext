const { merge } = require('webpack-merge');
const baseConfig = require('./webpack.config.base');
const ZipPlugin = require('zip-webpack-plugin');
const { resolve, join } = require('path');
const package = require('../package.json');

module.exports = () => {
  const prodConfig = {
    mode: 'production',

    plugins: [
      new ZipPlugin({
        path: resolve(join(__dirname, '../')),
        filename: `dist_${package.version}_${process.env.TARGET}.zip`,
      }),
    ],
  };

  return merge(baseConfig, prodConfig);
};
