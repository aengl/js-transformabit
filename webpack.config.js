module.exports = {
  entry: './dist/Main.js',
  output: {
    filename: 'main.js',
    pathinfo: true,
    library: 'test',
    libraryTarget: 'var'
  },
  node: {
    fs: 'empty',
    module: 'empty',
    net: 'empty'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        }
      }
    ]
  }
};
