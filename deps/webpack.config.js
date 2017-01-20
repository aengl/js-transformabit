const webpack = require('webpack');

module.exports = {
  entry: './index.js',
  output: {
    filename: './bundle.js',
    pathinfo: true,
    libraryTarget: 'commonjs2'
  },
  node: {
    fs: 'empty',
    net: 'empty',
    module: 'empty'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015'],
          plugins: ['transform-object-assign']
        }
      }
    ]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      // compress: {
      //   warnings: false
      // }
      beautify: true,
      mangle: false
    })
  ],
  performance: {
    hints: false
  }
};
