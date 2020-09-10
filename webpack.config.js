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
      'lambda/ip-index/index': './src/lambda/ip-index',
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
      new CopyPlugin({
        patterns: [
          {
            flatten: true,
            from: './dist/*.db',
            to: 'lambda/ip-index',
          },
        ],
      }),
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
