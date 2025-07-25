var path = require('path');
// const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
        mode: 'development',
        context: path.resolve(__dirname, '../../../common/src/main/js'),
        entry: {
            common: './common.js',
            client: './client.js',
            utils: './utils.js',
            dropdown: './dropdown.js',
            error_page: './error_page.js',
            footer: './footer.js',
            header: './header.js',
            login_modal: './login_modal.js',
            logout: './logout',
            modal_manager: './modal_manager.js',
            signup_modal: './signup_modal.js',
            user_icon: './user_icon.js'
        },
        devtool: 'sourcemaps',
        cache: true,
        output: {
            path: path.resolve(__dirname, '../../src/main/resources/static/js'),
            filename: '[name].bundle.js'
        },
        resolve: {
            alias: {
                'Parchment': path.resolve(__dirname, '../../node_modules/parchment/src/parchment.ts'),
                'quill$': path.resolve(__dirname, '../../node_modules/quill/quill.js'),
            },
            extensions: ['.mjs', '.js', '.ts', '.svg']
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
                }
            ]
        }
    }