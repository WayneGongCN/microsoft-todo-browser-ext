const { merge } = require('webpack-merge');
const baseConfig = require('./webpack.config.base');


module.exports = (env) => {
  const prodConfig = {
    mode: 'production',
  };

  return merge(baseConfig(env), prodConfig);
};
