import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/makeshift.esm.js',
      format: 'es',
      sourcemap: true,
    },
    {
      file: 'dist/makeshift.cjs.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
    },
  ],
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: 'dist/types',
    }),
    terser({
      compress: {
        pure_getters: true,
        passes: 2,
      },
      format: {
        comments: false,
      },
    }),
  ],
};
