const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = () => [
  {
    name: 'lambda',
    mode: 'production',
    stats: 'minimal',
    target: 'node',
    node: {
      __dirname: true,
    },
    watch: false,
    entry: {
      'lambda/ip-info/index': './src/lambda/ip-info',
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: 'babel-loader',
        },
      ],
    },
    plugins: [
      new CopyPlugin([
        {
          flatten: true,
          from: './dist/*.db',
          to: 'lambda/ip-info',
        },
      ]),
    ],
    optimization: {
      minimize: false,
    },
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'dist'),
      libraryTarget: 'commonjs2',
    },
    externals: {
      'aws-sdk': 'aws-sdk',
      'better-sqlite3': 'better-sqlite3',
    },
  },
];
