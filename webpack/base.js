const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = {
  mode: 'development',
  devtool: 'eval-source-map',
  resolve: {
    fallback: {
      "buffer": require.resolve("buffer"),
      "crypto": require.resolve("crypto-browserify"),
      "vm": require.resolve("vm-browserify"),
      "stream": false,
      "assert": false,
      "http": false,
      "https": false,
      "os": false,
      "url": false,
      "zlib": false
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: [/\.vert$/, /\.frag$/],
        use: 'raw-loader',
      },
      {
        test: /\.(gif|png|jpe?g|svg|xml)$/i,
        loader: 'file-loader',
        options: {
          outputPath: 'images/',
        },
      },
      {
        test: /\.(mp3|wav|ogg)$/i,
        loader: 'file-loader',
        options: {
          outputPath: 'sounds/',
        },
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name][ext]',
        },
      },
      {
        test: /\.html$/i,
        loader: 'html-loader',
      },
      {
        test: /\.ttf$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'fonts/',
            },
          },
        ],
      },
    ],
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
    new CleanWebpackPlugin({
      root: path.resolve(__dirname, '../'),
    }),
    new webpack.DefinePlugin({
      CANVAS_RENDERER: JSON.stringify(true),
      WEBGL_RENDERER: JSON.stringify(true),
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
  ],
};
