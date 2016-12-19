module.exports = {
  entry: './dist/Main.js',
  output: {
    filename: 'main.js',
    pathinfo: true,
    library: 'test',
    libraryTarget: 'var'
  }
}
