const path = require('path');
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  mode: 'production',
  entry: [
    './src/scripts/index.js',
  ],

  output: {
    filename: 'build.js',
    path: path.join(__dirname, 'build', 'js'),
    publicPath: '/build/',
  },

  plugins: [
    new webpack.optimize.ModuleConcatenationPlugin(),
    new BundleAnalyzerPlugin({ openAnalyzer: false }),
  ],
  module: {

    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            // presets: ['@babel/preset-env', { modules: false }],
          },
        },
        exclude: /node_modules$/,
      },
    ],
  },
};
