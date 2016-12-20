const webpack = require('webpack');

module.exports = {
  entry: './dist/Main.js',
  output: {
    filename: './dist/index.js',
    pathinfo: true,
    library: 'lib',
    libraryTarget: 'this'
  },
  node: {
    fs: 'empty',
    net: 'empty',
    module: 'empty'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
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
      },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        query: {
          compilerOptions: {
            noImplicitAny: false
          }
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
  ],
  performance: {
    hints: false
  }
};
