import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    rules: {
      // Disallow the use of console
      'no-console': 'error',
      // Disallow the use of debugger
      'no-debugger': 'error'
    },
  },
)