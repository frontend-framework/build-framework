import { resolve } from 'path';
import * as mergeDeep from 'merge-deep';

import { environments } from './environments';
import {
  Options,
  Settings,
  EntryPoint,
} from './types';
import { getPaths } from './paths';
import { getRules } from './rules';
import { getRuntime } from './runtime';

const defaultKeywords = ['biotope', 'boilerplate', 'modern', 'framework', 'html5'];

const popLast = (array: string[]): string[] => array.reverse().splice(1).reverse();

export const getSettings = (options: Options): Settings => {
  const environment = options.environment || environments.default;
  const minify = environment === 'local' ? !!options.minify : true;

  const paths = getPaths(options.paths);
  const runtime = getRuntime(options.runtime || {}, environment, paths);
  const serverRuntimeKey = (options.paths || {}).serverPrefixRuntimeKey;
  paths.server = serverRuntimeKey ? runtime[serverRuntimeKey] : paths.server;

  const app = options.app || {};
  const compilation = options.compilation || {};
  const style: { global: boolean; extract: boolean } = {
    global: false,
    extract: false,
    ...(compilation.style || {}),
  };
  const entryPoints: IndexObject<EntryPoint> = (compilation.entryPoints || ['index.ts'])
    .reduce((accumulator, file) => ({
      ...accumulator,
      [popLast(file.split('.')).join('.')]: { file },
    }), {});

  const settings: Settings = {
    app: {
      title: 'Biotope Boilerplate v7',
      description: 'Modern HTML5 UI Framework',
      author: 'Biotope',
      ...app,
      keywords: (app.keywords || defaultKeywords).join(','),
    },
    environment,
    minify,
    overrides: options.overrides || (s => s),
    paths,
    runtime,
    compilation: {
      alias: compilation.alias || {},
      chunks: compilation.chunks || [
        {
          test: /node_modules/,
          name: 'core',
          enforce: true,
          priority: 100,
          chunks: 'all',
          minChunks: 1,
        },
      ],
      cleanExclusions: compilation.cleanExclusions || [],
      entryPoints,
      extensions: compilation.extensions || ['.ts', '.js', '.scss', '.css'],
      externalFiles: (compilation.externalFiles || [{
        from: `${paths.appAbsolute}/resources`,
        to: 'resources',
        ignore: ['*.md'],
      }]).map(files => (typeof files === 'string' ? resolve(files) : ({
        ...files,
        from: resolve(files.from),
      }))),
      extractStyle: style.extract,
      output: mergeDeep({
        script: '[name].js',
        style: '[name].css',
      }, compilation.output || {}),
      rules: getRules(
        minify,
        style.global,
        style.extract,
        compilation.compileExclusions || [],
        runtime,
      ),
    },
  };

  return settings;
};
