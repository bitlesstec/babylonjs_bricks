const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin'); 
const CopyWebpackPlugin = require('copy-webpack-plugin');

const fs = require('fs'); 

module.exports = {
  entry: './src/index.ts',
  // entry: './src/arexample.ts',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins:[
    new HtmlWebpackPlugin({
        template: './src/index.html',  // template html
      }),
      new CopyWebpackPlugin({
        patterns:[
          { from:'src/textures', to: 'textures' },
          { from:'src/sounds', to: 'sounds' }
        ]
      })
  ],

  devServer: {
    static: './dist',
    host: '0.0.0.0', 
    port: 8080,     
    allowedHosts: 'all', 
  },

  mode: 'development',
};