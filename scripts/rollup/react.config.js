import {
  resolvePkgPath,
  getPackageJSON,
  getBaseRollupPlugin
} from './utils.js';
import generatePackageJson from 'rollup-plugin-generate-package-json';

const { name } = getPackageJSON('react');

const pkgPath = resolvePkgPath(name);

const pkgDisPath = resolvePkgPath(name, true);
export default [
  //react
  {
    input: `${pkgPath}/index.ts`,
    output: {
      file: `${pkgDisPath}/index.js`,
      name: 'react',
      format: 'umd'
    },
    plugins: [
      ...getBaseRollupPlugin(),
      generatePackageJson({
        inputFolder: pkgPath,
        outputFolder: pkgDisPath,
        baseContents: ({ name, description, version }) => ({
          name,
          description,
          version,
          main: 'index.js'
        })
      })
    ]
  },
  //jsx-runtime
  {
    input: `${pkgPath}/src/jsx.ts`,
    output: [
      //jsx-runtime
      {
        file: `${pkgDisPath}/jsx-runtime.js`,
        name: 'jsxRuntime',
        format: 'umd'
      },
      //jsx-dev-runtime
      {
        file: `${pkgDisPath}/jsx-dev-runtime.js`,
        name: 'jsxDevRuntime',
        format: 'umd'
      }
    ],
    plugins: getBaseRollupPlugin()
  }
];
