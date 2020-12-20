const CopyWebpackPlugin = require('copy-webpack-plugin')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
var package = require('./package.json')
const pages =  require('./pages.json')
var entries = {vendor: Object.keys(package.dependencies)}
entries.index = './src/index.js'
pages.slice(1).forEach(p => entries[p.filename] = `./src/${p.filename}/modelLogic.js`)

module.exports = {
  mode: 'production',
  entry: entries,
  module: {
    rules: [{
      test: /\.(js)$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader'
      }
    }]
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
    splitChunks: {
      chunks: 'all',
			name: 'shared'
    }
  },
  plugins: [
    new CopyWebpackPlugin([{
      from: 'build/assets',
      to: 'assets'
    }]),
		...pages.map(p => new HTMLWebpackPlugin({
			template: `build/${p.filename}.html`,
			filename: `${p.filename}.html`,
      title: `AI demos - ${p.name}`,
      page: p,
      lastPage: pages[pages.length-1],
			chunks: ['vendor','shared',p.filename]
		}))
  ],
  output: {
    filename: '[name].bundle.js'
  }
}
