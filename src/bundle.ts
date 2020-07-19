import { transform } from '@babel/core';
import Terser from 'terser';

function bundle(code: string) {
  const result = transform(code, {
    filename: 'file.ts',
    babelrc: false,
    presets: [
      [
        '@babel/preset-env',
        { targets: 'defaults and not IE 11', modules: false },
      ],
      '@babel/preset-typescript',
      '@babel/preset-react',
    ],
  });

  return Terser.minify(result.code || '').code || '';
}

export default bundle;
