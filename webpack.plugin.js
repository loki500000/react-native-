const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = [
  // Plugin code (runs in Figma sandbox)
  {
    mode: 'production',
    entry: './src/plugin/code.ts',
    target: 'node',
    output: {
      path: path.resolve(__dirname, 'dist/plugin'),
      filename: 'code.js',
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js'],
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
  },
  // Plugin UI (runs in iframe)
  {
    mode: 'production',
    entry: './src/plugin/ui.ts',
    output: {
      path: path.resolve(__dirname, 'dist/plugin'),
      filename: 'ui.js',
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js'],
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/plugin/ui.html',
        filename: 'ui.html',
        inject: 'body',
      }),
    ],
  },
];
