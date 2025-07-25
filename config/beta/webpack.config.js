var path = require('path');
// const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
        mode: 'development',
        context: path.resolve(__dirname, '../../src/main/js'),
        entry: {
            app: './app.js'
        },
        devtool: 'sourcemaps',
        cache: true,
        output: {
            path: path.resolve(__dirname, '../../src/main/resources/static/js'),
            filename: 'app.bundle.js',
        },
        module: {
            rules: [
                {
                    test: path.join(path.resolve(__dirname, '../../'), '.'),
                    exclude: /(node_modules)/,
                    use: [{
                        loader: 'babel-loader',
                        options: {
                            presets: ["@babel/preset-env", "@babel/preset-react"]
                        }
                    }]
                }
            ]
        }
    }