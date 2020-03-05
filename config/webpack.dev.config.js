const merge = require('webpack-merge');
const webpackBaseConfig = require('./webpack.common.config');
module.exports = merge(webpackBaseConfig, {
	module: {
		rules: [
			{
				test: /\.s[ac]ss$/i,
				use: [
					'style-loader',
					{
						loader: 'css-loader',
						options: {
							import: true,
							url: true,
							sourceMap: true,
						}
					},
					{
						loader: 'sass-loader',
						options: {
							sourceMap: true
						}
					},
				]
			}
		]
	}
});
