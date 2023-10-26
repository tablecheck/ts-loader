const ip = require('ip');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

const host = ip.address();
const port = 8080;

module.exports = {
  mode: 'development',
  entry: {
    'ts-loader': [
      `webpack-dev-server/client?http://${host}:${port}`,
      './lib/index.js'
    ],
    'ts-loader.min': ['./lib/index.js']
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js'
  },
  performance: {
    hints: false
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({ include: /\.min\.js$/ })]
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /(node_modules|bower_components)/,
        options: {
          cacheDirectory: true
        }
      }
    ]
  }
};
