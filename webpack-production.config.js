var webpack = require('webpack');

var devConfig = require('./webpack.config.js');

// Remove the webpack-dev-server from entries
devConfig.entry['ts-loader'].shift();

// set process.env to "production" to use the production build for react
devConfig.plugins.unshift(
  new webpack.DefinePlugin({
    'process.env': {
      'NODE_ENV': JSON.stringify('production')
    }
  })
);

module.exports = devConfig;
