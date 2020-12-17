const CopyWebpackPlugin = require('copy-webpack-plugin')
const HTMLWebpackPlugin = require('html-webpack-plugin')
var package = require('./package.json')
const pages =  require('./pages.json')
var entries = {vendor: Object.keys(package.dependencies)}
pages.forEach(p => entries[p.filename] = `./src/${p.filename}.js`)
module.exports = {
	mode: 'development',
	entry: entries,
	devServer: {
		contentBase: 'dist',
		port: 8080
	},
	devtool: 'inline-source-map',
	plugins: [
		new CopyWebpackPlugin([{
			from: 'build/assets',
			to: 'assets'
		}]),
		...pages.map(p => new HTMLWebpackPlugin({
			template: `build/${p.filename}.html`,
			filename: `${p.filename}.html`,
			chunks: ['vendor','shared',p.filename]
		}))
	],
	output: {
		filename: '[name].bundle.js'
	},
  optimization: {
    splitChunks: {
			chunks: 'all',
			name: 'shared'
    }
  }
}