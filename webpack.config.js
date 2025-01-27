const Dotenv = require('dotenv-webpack');
const DefinePlugin = require('webpack').DefinePlugin;
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const manifest = require('./manifest.json');

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: {
    background: './src/background/index.ts',
    content: './src/content/index.ts',
    web: './src/web/index.ts'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: 'ts-loader'
      },
      {
        test: /\.html$/i,
        use: [
          'raw-loader',
        ],
      },
      {
        test: /\.css$/i,
        use: [
          'raw-loader',
        ],
      },
    ]
  },
  plugins: [
    new Dotenv(),
    new DefinePlugin({
      'process.env.EXTENSION_VERSION': JSON.stringify(manifest.version),
    }),
    new CopyPlugin({
      patterns: [
        { from: "assets", to: "assets" }
      ],
    }),
  ],
}; 