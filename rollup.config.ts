import typescript from '@rollup/plugin-typescript';

export default {
  input: './src/app.ts',
  output: {
    file: './dist/bundle.js',
    format: 'iife',
  },
  plugins: [
    typescript({
      exclude: ["**/*.test.ts"]
    })
  ]
}
