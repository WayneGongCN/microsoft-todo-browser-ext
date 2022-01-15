const { merge } = require('webpack-merge');
const baseConfig = require('./webpack.config.base');

module.exports = () => {
  const prodConfig = {
    mode: 'production',
  };

  return merge(baseConfig, prodConfig);
};
