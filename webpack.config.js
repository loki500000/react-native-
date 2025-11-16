const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/cli/index.ts',
  target: 'node',
  output: {
    path: path.resolve(__dirname, 'dist/cli'),
    filename: 'index.js',
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
  externals: {
    // Don't bundle node_modules
    bufferutil: 'bufferutil',
    'utf-8-validate': 'utf-8-validate',
  },
};
