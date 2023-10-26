const devConfig = require('./webpack.config.js');

devConfig.mode = 'production';

// Remove the webpack-dev-server from entries
devConfig.entry['ts-loader'].shift();

module.exports = devConfig;
