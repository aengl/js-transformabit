const webpack = require('webpack');

module.exports = {
  entry: './dist/Main.js',
  output: {
    filename: 'index.js',
    pathinfo: true,
    library: 'lib',
    libraryTarget: 'this'
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
      compress: {
        warnings: false
      }
    })
  ]
};
