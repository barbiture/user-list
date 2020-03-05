const merge = require('webpack-merge');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpackBaseConfig = require('./webpack.common.config');
module.exports = merge(webpackBaseConfig, {
	optimization: {
		minimizer: [
			new UglifyJsPlugin(),
			new OptimizeCssAssetsPlugin()
		]
	},
	module: {
		rules: [
			{
				test: /\.s[ac]ss$/i,
				use: [
					MiniCssExtractPlugin.loader,
					/*          'css-loader', */
					/* 'sass-loader' */
				]
			}
		],
		plugins: [
			require('autoprefixer'),
			require('cssnano'),
			new MiniCssExtractPlugin({
				filename: 'style.[hash].css',
				chunkFilename: '[id].css',
				ignoreOrder: false
			}),
		]
	}
	
});
