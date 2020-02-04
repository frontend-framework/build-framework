const { resolve } = require('path');
const jsxTransform = require('jsx-transform');
const MagicString = require('magic-string');
const babelPresetReact = require('@babel/preset-react');

const rollupJsxPlugin = ({ extensions, factory }) => ({
  name: 'biotope-build-jsx',
  transform(code, id) {
    if (
      (id.indexOf(resolve(`${process.cwd()}/node_modules`)) === 0)
      || (extensions ? !(new RegExp(`(${extensions.join('|')})$`)).test(id) : true)
    ) {
      return undefined;
    }

    const magicString = new MagicString(code);
    magicString.overwrite(0, code.length, jsxTransform.fromString(code, { factory }));

    return {
      code: magicString.toString(),
      map: magicString.generateMap(),
    };
  },
});

const jsxPlugin = (pluginConfig = {}) => {
  const extIgnore = pluginConfig.extIgnore || ['.ts', '.tsx', '.vue'];
  const factory = pluginConfig.factory || 'React.createElement';

  return {
    name: 'biotope-build-plugin-jsx',
    hook: 'before-build',
    priority: 10,
    runner({ extLogic }, builds) {
      const extensions = extLogic
        .filter((extension) => !extIgnore.some((ext) => extension === ext));

      builds.forEach(({ build }) => {
        build.priorityPlugins.push(rollupJsxPlugin({ extensions, factory }));

        if (build.pluginsConfig.babel) {
          build.pluginsConfig.babel[0].presets.push(babelPresetReact);
        }
      });
    },
  };
};

module.exports = jsxPlugin;
