import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginStylistic from '@stylistic/eslint-plugin';

export default [
  { files: ['webpack.*.js'], languageOptions: { globals: globals.node, sourceType: 'commonjs' } },
  { languageOptions: { globals: globals.browser } },
  pluginStylistic.configs.customize({ indent: 2, quotes: 'single', semi: true, jsx: true }),
  pluginJs.configs.recommended,
  { ignores: ['dist/*'] },
];
