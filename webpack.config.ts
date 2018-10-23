import * as path from 'path';
import { ProgressPlugin } from 'webpack';
import { AngularCompilerPlugin, PLATFORM } from '@ngtools/webpack';

const TerserWebpackPlugin = require('terser-webpack-plugin');
const mainPath = path.join(__dirname, 'main.ts');

module.exports = {
  stats: 'normal',
  mode: 'production',
  devtool: 'source-map',
  performance: { hints: false, },
  resolve: {
    extensions: ['.ts', '.js'],
    mainFields: ['browser', 'module', 'main']
  },
  entry: [mainPath],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'js/[name].bundle.js',
    chunkFilename: 'js/[id].chunk.js',
  },
  module: {
    rules: [{
      test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
      loader: '@ngtools/webpack'
    }, {
      test: /\.js$/,
      loader: '@angular-devkit/build-optimizer/webpack-loader',
      options: { sourceMap: true }
    }, {
      // Mark files inside `@angular/core` as using SystemJS style dynamic imports.
      // Removing this will cause deprecation warnings to appear.
      test: /[\/\\]@angular[\/\\]core[\/\\].+\.js$/,
      parser: { system: true },
    }]
  },
  optimization: {
    minimizer: [
      new TerserWebpackPlugin({
        sourceMap: true,
        cache: false,
        parallel: false,
        terserOptions: {
          extractComments: false,
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
        }
      })
    ]
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
