import { Configuration, Options as WebpackOptions } from 'webpack';
import CleanWebpackPlugin from 'clean-webpack-plugin';
import * as CopyWebpackPlugin from 'copy-webpack-plugin';
import * as MiniCssExtractPlugin from 'mini-css-extract-plugin';

import { Options, Settings, getSettings } from './settings';

export const baseConfig = (options: Options): [Configuration, Settings] => {
  const settings = getSettings(options);

  return [{
    context: settings.paths.appAbsolute,
    devtool: 'cheap-module-source-map',
    mode: 'development',
    entry: Object.keys(settings.compilation.entryPoints).reduce((accumulator, key) => ({
      ...accumulator,
      [key]: `${settings.paths.bundlesAbsolute}/${settings.compilation.entryPoints[key].file}`,
    }), {}),
    module: { rules: settings.compilation.rules },
    output: {
      path: settings.paths.buildAbsolute,
      filename: settings.compilation.output.script,
      publicPath: `${settings.paths.server}${settings.paths.buildRelative}`,
    },
    optimization: {
      minimize: false,
      splitChunks: {
        cacheGroups: settings.compilation.chunks.reduce((accumulator, value) => ({
          ...accumulator,
          [value.name as string]: value,
        }), {}) as { [key: string]: WebpackOptions.CacheGroupsOptions },
      },
    },
    plugins: [
      new CleanWebpackPlugin({
        cleanOnceBeforeBuildPatterns: [`${settings.paths.distAbsolute}/*`].concat(
          (settings.compilation.cleanExclusions || [])
            .map(exclusion => `!${settings.paths.distAbsolute}/${exclusion}`),
        ),
      }),
      new CopyWebpackPlugin(settings.compilation.externalFiles.map((filesRules) => {
        const parsedRules = typeof filesRules === 'string' ? { from: filesRules } : filesRules;
        return {
          ...parsedRules,
          to: `${settings.paths.distAbsolute}/${parsedRules.to || ''}`,
          ignore: parsedRules.ignore || ['.*'],
        };
      })),
      ...(!settings.compilation.extractStyle ? [] : [
        new MiniCssExtractPlugin({
          filename: settings.compilation.output.style,
        }),
      ]),
    ],
    resolve: {
      extensions: settings.compilation.extensions,
      alias: settings.compilation.alias,
      modules: [
        settings.paths.appAbsolute,
        'node_modules',
      ],
    },
  }, settings];
};