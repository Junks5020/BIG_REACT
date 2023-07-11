import {
  resolvePkgPath,
  getPackageJSON,
  getBaseRollupPlugin
} from './utils.js';
import generatePackageJson from 'rollup-plugin-generate-package-json';
import alias from '@rollup/plugin-alias';
const { name, peerDependencies } = getPackageJSON('react-dom');

const pkgPath = resolvePkgPath(name);

const pkgDisPath = resolvePkgPath(name, true);
export default [
  //react-dom
  {
    input: `${pkgPath}/index.ts`,
    output: [
      {
        file: `${pkgDisPath}/index.js`,
        name: 'ReactDOM',
        format: 'umd'
      },
      {
        file: `${pkgDisPath}/client.js`,
        name: 'ReactDOM',
        format: 'umd'
      }
    ],
    external: [...Object.keys(peerDependencies)],
    plugins: [
      ...getBaseRollupPlugin(),
      alias({
        entries: {
          hostConfig: `${pkgPath}/src/hostConfig.ts`
        }
      }),
      generatePackageJson({
        inputFolder: pkgPath,
        outputFolder: pkgDisPath,
        baseContents: ({ name, description, version }) => ({
          name,
          description,
          version,
          peerDependencies: {
            react: version
          },
          main: 'index.js'
        })
      })
    ]
  },
  //react-test-utils
  {
    input: `${pkgPath}/test-utils.ts`,
    output: [
      {
        file: `${pkgDisPath}/test-utils.js`,
        name: 'testUtils',
        format: 'umd'
      }
    ],
    external: ['react', 'react-dom'],
    plugins: [...getBaseRollupPlugin()]
  }
];
