import path from 'path';
import fs from 'fs';
import ts from 'rollup-plugin-typescript2';
import cjs from '@rollup/plugin-commonjs';

const pkgPath = path.resolve(__dirname, '../../packages');
const distPath = path.resolve(__dirname, '../../dist/node_modules');
export function resolvePkgPath(pkgName, isDist) {
  if (isDist) {
    return `${distPath}/${pkgName}`;
  }
  return `${pkgPath}/${pkgName}`;
}

export function getPackageJSON(pkgName) {
  //...包路径
  const path = `${resolvePkgPath(pkgName)}/package.json`;
  //...读取文件
  const str = fs.readFileSync(path, 'utf8');
  //...转换为json
  return JSON.parse(str);
}
//定义插件
export function getBaseRollupPlugin({ typesrcipt = {} } = {}) {
  return [cjs(), ts(typesrcipt)];
}
