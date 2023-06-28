import {
  resolvePkgPath,
  getPackageJSON,
  getBaseRollupPlugin
} from './utils.js';
import generatePackageJson from 'rollup-plugin-generate-package-json';
import alias from '@rollup/plugin-alias';
const { name } = getPackageJSON('react-dom');

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
  }
];
