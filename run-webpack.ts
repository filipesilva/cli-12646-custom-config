import * as path from 'path';
import { ProgressPlugin } from 'webpack';
import * as webpack from 'webpack';
import { AngularCompilerPlugin, PLATFORM } from '@ngtools/webpack';

const TerserWebpackPlugin = require('terser-webpack-plugin');
const mainPath = path.join(__dirname, 'main.ts');

const config = {
  stats: {
    colors: true,
    warnings: true,
    errors: true,
    usedExports: true,
    maxModules: Infinity,
    optimizationBailout: true,
    reasons: true,
    // hide rxjs and tslib from stats output
    excludeModules: /\/(rxjs|tslib)\//
  },
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
  ],
  // Leaving node built-ins adds the global module because of @angular/core, causing it to not be concatenated.
  //  [17] (webpack)/buildin/global.js 510 bytes {0} [depth 3] [built]
  //       ModuleConcatenation bailout: Module is not an ECMAScript module
  //       cjs require global [14] ./node_modules/@angular/core/fesm5/core.js 1:0-47
  node: false,
};

const webpackCompiler = webpack(config as {});
webpackCompiler.run((_err, stats) => console.log(stats.toString(config.stats)))