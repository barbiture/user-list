const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
	devServer: {
		contentBase: path.resolve(__dirname, 'dist'),
		compress: true,
		host: 'localhost',
		port: 8080
	},
	entry: [
		'./src/app/app.js'
	],
	output: {
		path: path.resolve(__dirname, '../dist'),
		filename: '[name].[hash].js',

	},

	module: {
		rules: [
			{
				test: [/.js$/],
				exclude: /(node_modules)/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: [
							'@babel/preset-env',
						]
					}
				}
			},
			{
				test: /\.(png|jpe?g|gif|svg)$/,
				use: [
					{
						// Using file-loader for these files
						loader: 'url-loader',

						// In options we can set different things like format
						// and directory to save
						options: {
							limit: 10000,
							fallback: 'file-loader',
							name: 'images/[name].[ext]',
						}
					}
				]
			},
			{
				// Apply rule for fonts files
				test: /\.(woff|woff2|eot|ttf|otf)$/,
				use: [
					{
						// Using url-loader too
						loader: 'url-loader',
						options: {
							limit: 10000,
							fallback: 'file-loader',
							name: 'fonts/[name].[ext]',
						}
					}
				]
			},
			{
				test: /\.html$/i,
				loader: 'raw-loader'
			},
		]
	},

	resolve: {
		alias: {
			'@img': path.resolve(__dirname, '../src/assets/images'),
			'@fonts': path.resolve(__dirname, '../src/assets/fonts'),
			'@': path.resolve(__dirname, '../src')
		},
		modules: ['node_modules', path.resolve(__dirname, 'src')],
		extensions: ['.js']
	},

	plugins: [
		new HtmlWebpackPlugin({
			title: 'Webpack 4 Starter',
			template: './src/public/index.html',
			inject: true,
			minify: {
				removeComments: true,
				collapseWhitespace: true
			}
		}),
		new CopyWebpackPlugin([
			{
				from: './src/assets/images',
				to: 'assets/images'
			},
			{
				from: './src/assets/fonts',
				to: 'assets/fonts'
			},
			{
				from: './src/styles',
				to: 'styles'
			}
		]),
		new CleanWebpackPlugin({
			root: path.join(__dirname, '..')
		})
	]
};
