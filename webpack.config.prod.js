const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'production',
  entry: [
    './src/scripts/index.js',
  ],

  output: {
    path: path.resolve(__dirname, 'build/js/'),
    publicPath: '/build/js/',
    filename: 'build.js',
  },

  plugins: [
    new webpack.optimize.ModuleConcatenationPlugin(),
  ],
  module: {

    rules: [
      {
        test: /\.js$/,
        use: ['babel-loader'],
        exclude: /node_modules$/,
      },
    ],
  },
};
