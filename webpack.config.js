var ip = require('ip');
var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: {
    'ts-loader': [
      'webpack-dev-server/client?http://' + ip.address() + ':8080',
      './lib/index.js'
    ],
    'ts-loader.min': './lib/index.js'
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js'
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      include: /\.min\.js$/,
      minimize: true
    })
  ]
};
