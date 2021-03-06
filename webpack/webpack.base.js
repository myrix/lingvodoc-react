const webpack = require('webpack');
const path = require('path');
const config = require('./config');
const _ = require('./utils');

const buildType = process.env.LINGVODOC_BUILD_TYPE ? process.env.LINGVODOC_BUILD_TYPE : "server";
const buildTypePath = `${path.join(__dirname, '.')}/buildType.${buildType}`;

module.exports = {
  entry: {
    client: ['babel-polyfill', './src/index.js'],
  },
  output: {
    path: _.outputPath,
    filename: '[name].js',
    publicPath: config.publicPath,
  },
  performance: {
    hints: process.env.NODE_ENV === 'production' ? 'warning' : false,
  },
  resolve: {
    extensions: ['.js'],
    alias: {
      config: `${config.srcPath}/config/${process.env.REACT_WEBPACK_ENV}`,
      buildType: buildTypePath,
      wavesurfer: require.resolve('wavesurfer.js'),
      chroma: require.resolve('chroma-js')
    },
    modules: ['src', 'node_modules', 'vendor'],
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loaders: ['babel-loader'],
        exclude: [/node_modules/],
      },
      {
        test: /\.(ico|jpg|png|gif|eot|otf|webp|ttf|woff|woff2)(\?.*)?$/,
        loader: 'file-loader?limit=100000',
      },
      {
        test: /\.svg$/,
        loader: 'file-loader',
      },
    ],
  },
  plugins: [
    new webpack.LoaderOptionsPlugin(_.loadersOptions()),
    new webpack.ProvidePlugin({
      WaveSurfer: 'wavesurfer.js',
      chroma: 'chroma',
    }),
  ],
  target: _.target,
};
