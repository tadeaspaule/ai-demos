const CopyWebpackPlugin = require('copy-webpack-plugin')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
var package = require('./package.json')
const pages =  require('./pages.json')
var entries = {vendor: Object.keys(package.dependencies)}
pages.forEach(p => entries[p.filename] = `./src/${p.filename}.js`)

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
    minimizer: [new UglifyJSPlugin({
      uglifyOptions: {
        output: {
          comments: false //use it for removing comments like "/*! ... */"
        }
      }
    })],
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
			chunks: ['vendor','shared',p.filename]
		}))
  ],
  output: {
    filename: '[name].bundle.js'
  }
}
