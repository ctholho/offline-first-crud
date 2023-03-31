const { NODE_ENV, BABEL_ENV } = process.env
const cjs = NODE_ENV === 'test' || BABEL_ENV === 'commonjs'
const es = BABEL_ENV === 'es'
const loose = true

module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: { esmodules: true },
        loose,
        modules: false,
        exclude: [
          '@babel/plugin-transform-regenerator',
          '@babel/plugin-transform-parameters',
        ],
      },
    ],
    '@babel/preset-typescript',
  ],
  plugins: [
    cjs && ['@babel/transform-modules-commonjs', { loose }],
    es && ['babel-plugin-add-import-extension', { extension: 'mjs' }],
    // no runtime for umd builds
    BABEL_ENV && [
      '@babel/transform-runtime',
      {
        version: require('./package.json').dependencies[
          '@babel/runtime'
        ].replace(/^[^0-9]*/, ''),
      },
    ],
  ].filter(Boolean)
}