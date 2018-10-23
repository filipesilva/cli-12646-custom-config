import { ProgressPlugin } from 'webpack';
import * as path from 'path';
import { AngularCompilerPlugin, PLATFORM } from '@ngtools/webpack';

const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const rxjsMappings = require('rxjs/_esm5/path-mapping')();
const nodeModulesPath = path.join(__dirname, 'node_modules');
const mainPath = path.join(__dirname, 'main.ts');

module.exports = {
    mode: 'production',
    devtool: 'source-map',
    resolve: {
        extensions: ['.ts', '.js'],
        modules: [nodeModulesPath],
        symlinks: true,
        alias: rxjsMappings,
        mainFields: ['browser', 'module', 'main']
    },
    resolveLoader: {
        modules: [nodeModulesPath],
        alias: rxjsMappings
    },
    entry: [mainPath],
    output: {
        path: path.join(__dirname, 'dist'),
        crossOriginLoading: false,
        filename: 'js/[name].bundle.js',
        chunkFilename: 'js/[id].chunk.js',
    },
    module: {
        rules: [
            {
                test: /\.(html|md)$/,
                loader: 'raw-loader'
            },
            {
                test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
                loader: '@ngtools/webpack'
            },
            {
                test: /\.js$/,
                loader: '@angular-devkit/build-optimizer/webpack-loader',
                options: {
                    sourceMap: false
                }
            }
        ]
    },
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                test: /\.js$/i,
                extractComments: false,
                sourceMap: true,
                cache: false,
                parallel: false,
                uglifyOptions: {
                    output: {
                        ascii_only: true,
                        comments: false,
                        webkit: true
                    },
                    ecma: 5,
                    warnings: false,
                    ie8: false,
                    mangle: true,
                    compress: {
                        typeofs: false,
                        pure_getters: true,
                        passes: 3
                    }
                }
            })
        ],
        splitChunks: {
            chunks: 'async',
            minSize: 30000,
            minChunks: 1,
            maxAsyncRequests: 5,
            maxInitialRequests: 3,
            name: true,
            cacheGroups: {
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    priority: -10
                },
                default: {
                    minChunks: 2,
                    priority: -20,
                    reuseExistingChunk: false
                }
            }
        }
    },
    plugins: [
        new ProgressPlugin(),
        new AngularCompilerPlugin({
            mainPath: mainPath,
            platform: PLATFORM.Browser,
            nameLazyFiles: true,
            sourceMap: true,
            tsConfigPath: './tsconfig.app.json',
            skipCodeGeneration: false
        })
    ]
};
