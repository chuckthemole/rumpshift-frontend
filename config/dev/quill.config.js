var path = require('path');
// const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
        mode: 'development',
        context: path.resolve(__dirname, '../../src/main/js'),
        entry: {
            app: './rumpus_quill.js'
        },
        devtool: 'sourcemaps',
        cache: true,
        output: {
            path: path.resolve(__dirname, '../../src/main/resources/static/js'),
            filename: 'quill.bundle.js',
        },
        resolve: {
            alias: {
                'parchment': path.resolve(__dirname, '../../node_modules/parchment/src/parchment.ts'),
                'quill$': path.resolve(__dirname, '../../node_modules/quill/quill.js'),
            },
            extensions: ['.js', '.ts', '.svg']
        },
        module: { // quill
            rules: [{
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: [{
                    loader: 'babel-loader',
                    options: {
                        presets: ["@babel/preset-env"]
                    }
                }],
            }, {
                test: /\.ts$/,
                exclude: /(node_modules)/,
                use: [{
                    loader: 'ts-loader',
                    options: {
                        compilerOptions: {
                            declaration: false,
                            target: 'es5',
                            module: 'commonjs'
                        },
                        transpileOnly: true
                    }
                }]
            }, {
                test: /\.svg$/,
                exclude: /(node_modules)/,
                use: [{
                    loader: 'html-loader',
                    options: {
                        minimize: true
                    }
                }]
            }]
        }
    }