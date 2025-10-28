var path = require('path');
const webpack = require('webpack');
require('dotenv').config();
const HtmlWebpackPlugin = require('html-webpack-plugin');

const apiBaseURL =
    process.env.REACT_APP_ENV === 'production'
        ? process.env.REACT_APP_API_BASE_URL_PRODUCTION
        : process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

console.log('ENV VALUE Base URL:', apiBaseURL);

module.exports = {
    mode: 'development',
    context: path.resolve(__dirname, '../../'),
    entry: {
        app: './src/index.js',
        // quill: './common/rumpus_quill.js'
        // quill: '@rumpushub/common-react/dist/components/rumpus_quill'
    },
    devtool: 'source-map',
    cache: true,
    output: {
        path: path.resolve(__dirname, '../../build/js'),
        filename: '[name].bundle.js',
        publicPath: '/',
    },
    resolve: {
        // TODO: may need to not alias for production
        alias: {
            'Parchment': path.resolve(__dirname, '../../node_modules/parchment/src/parchment.ts'),
            'quill$': path.resolve(__dirname, '../../node_modules/quill/quill.js'),
            'react': path.resolve(__dirname, '../../node_modules/react'),
            'react-dom': path.resolve(__dirname, '../../node_modules/react-dom'),
            'react-router-dom': path.resolve(__dirname, '../../node_modules/react-router-dom')
        },
        extensions: ['.mjs', '.js', '.ts', '.svg'],
        symlinks: true,
        fallback: {
            stream: require.resolve('stream-browserify'),
            buffer: require.resolve('buffer/')
        }
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.REACT_APP_API_BASE_URL': JSON.stringify(
                process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'
            ),
            'process.env.REACT_APP_API_RUMPSHIFT_URL': JSON.stringify(
                process.env.REACT_APP_API_RUMPSHIFT_URL || 'http://localhost:8000'
            ),
            'process.env.REACT_APP_API_BASE_URL_PRODUCTION': JSON.stringify(
                process.env.REACT_APP_API_BASE_URL_PRODUCTION
            ),
            'process.env.REACT_APP_API_RUMPSHIFT_URL_PRODUCTION': JSON.stringify(
                process.env.REACT_APP_API_RUMPSHIFT_URL_PRODUCTION
            ),
            'process.env.REACT_APP_ENV': JSON.stringify(
                process.env.REACT_APP_ENV || 'development'
            ),
            'process.env.REACT_APP_DEFAULT_FONT': JSON.stringify(
                process.env.REACT_APP_DEFAULT_FONT || '"Nunito", sans-serif'
            ),
            'process.env.REACT_APP_SECONDARY_FONT': JSON.stringify(
                process.env.REACT_APP_SECONDARY_FONT || '"Roboto Mono", monospace'
            ),
            'process.env.REACT_APP_BACKUP_PRIMARY_FONT': JSON.stringify(
                process.env.REACT_APP_BACKUP_PRIMARY_FONT || '"Source Code Pro", monospace'
            ),
            'process.env.REACT_APP_BACKUP_SECONDARY_FONT': JSON.stringify(
                process.env.REACT_APP_BACKUP_SECONDARY_FONT || '"Source Code Pro", monospace'
            )
        }),
        new HtmlWebpackPlugin({
            template: './public/index.html', // make sure this file exists!
            filename: 'index.html'
        }),
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
        }),
    ],
    devServer: {
        static: {
            directory: path.resolve(__dirname, '../../public'),
            publicPath: '/',
            // serveIndex: false,
        },
        historyApiFallback: true,
        port: process.env.PORT || 3000
        // proxy: {
        //     '/api': {
        //         target: 'http://localhost:8888', // Spring Boot backend
        //         changeOrigin: true,
        //     },
        // }
    },
    module: {
        rules: [
            {
                test: path.join(path.resolve(__dirname, '../../'), '.') && /\.js$/,
                exclude: /(node_modules)/,
                use: [{
                    loader: 'babel-loader',
                    options: {
                        presets: ["@babel/preset-env", "@babel/preset-react"]
                    }
                }]
            }, {
                test: path.join(path.resolve(__dirname, '../../'), '.') && /\.(tsx|ts)$/,
                loader: 'babel-loader'
            }, {
                test: path.join(path.resolve(__dirname, '../../'), '.') && /\.svg$/,
                use: [{
                    loader: 'html-loader',
                    options: {
                        minimize: true
                    }
                }]
            }, {
                test: path.join(path.resolve(__dirname, '../../'), '.') && /\.mjs$/,
                include: /(node_modules)/,
                type: 'javascript/auto'
            }, {
                test: path.join(path.resolve(__dirname, '../../'), '.') && /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
        ]
    }
}