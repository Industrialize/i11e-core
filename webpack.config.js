const webpack = require("webpack");
const path = require('path');

module.exports = {
  entry: {
    'i11e': './index.js'
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js'
  },
  module: {
    loaders: [{
      test: /\.js?$/,
      exclude: /(node_modules|bower_components)/,
      loader: 'babel',
      query: {
        presets: ["es2015"]
      }
    }]
  }
}
