require('dotenv').config();

const path = require('path');
const nodeExternals = require('webpack-node-externals');
const webpack = require('webpack');

const mode = process.env.NODE_ENV || 'development';

const commitHash = require('child_process')
	.execSync('git rev-parse HEAD')
	.toString()
	.trim();

const branch = require('child_process')
	.execSync('git rev-parse --abbrev-ref HEAD')
	.toString()
	.trim();

console.log(`Building for ${mode}`);

const serverConfig = {
	mode: mode,
	entry: './src/server/server.ts',
	module: {
		rules: [
			{
				test: /\.ts?$/,
				loader: 'ts-loader',
				exclude: /node_modules/,
				options: {
					configFile: 'tsconfig.json',
					context: path.resolve(__dirname, './src/server')
				}
			}
		]
	},
	resolve: {
		extensions: [ '.ts', '.js' ]
	},
	output: {
		filename: 'server.js',
		path: path.resolve(__dirname, 'dist')
	},
	target: 'node',
	node: {
		__dirname: false
	},
	externals: [ nodeExternals() ]
};

const clientConfig = {
	mode: mode,
	entry: './src/client/index.tsx',
	devtool: 'inline-source-map',
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				loader: 'ts-loader',
				exclude: /node_modules/,
				options: {
					configFile: 'tsconfig.json',
					context: path.resolve(__dirname, './src/client')
				}
			},
			{
				test: /\.scss$/,
				use: [ 'style-loader', 'css-loader', 'sass-loader' ]
			}
		]
	},
	plugins: [
		new webpack.DefinePlugin({
			COMMIT_HASH: JSON.stringify(commitHash),
			BRANCH: JSON.stringify(branch),
			BUILD_MODE: JSON.stringify(mode)
		})
	],
	resolve: {
		extensions: [ '.tsx', '.ts', '.js', '.css', '.scss' ]
	},
	output: {
		filename: 'app.js',
		path: path.resolve(__dirname, 'public/js')
	}
};

module.exports = [ serverConfig, clientConfig ];
