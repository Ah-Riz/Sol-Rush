const merge = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const webpack = require('webpack');
const base = require('./base');

module.exports = merge(base, {
  mode: 'production',
  output: {
    filename: 'bundle.min.js',
  },
  devtool: false,
  performance: {
    maxEntrypointSize: 900000,
    maxAssetSize: 900000,
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env)
    }),
    new Dotenv({
      path: './.env',
      systemvars: true,
      safe: true,
    }),
  ],
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          output: {
            comments: false,
          },
        },
      }),
    ],
  },
});
