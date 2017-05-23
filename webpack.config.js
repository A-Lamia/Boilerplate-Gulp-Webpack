const path = require('path');
const webpack = require('webpack');

module.exports = {

  entry: [
    // 'webpack/hot/dev-server',
    // 'webpack-hot-middleware/client',
    './src/scripts/index.js',
  ],

  output: {
    path: path.resolve(__dirname, 'build/js/'),
    publicPath: '/build/js/',
    filename: 'build.js',
  },

  plugins:  // [
    // new webpack.optimize.DedupePlugin(),
    // new webpack.optimize.UglifyJsPlugin(),
  // ] :
  [
    // new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.HotModuleReplacementPlugin(),
  ],
  module: {

    rules: [
      {
        test: /\.js$/,
        use: ['babel-loader', 'webpack-module-hot-accept'],
        exclude: /node_modules$/,
      },
    ],
  },

  devtool: 'source-map',
};
