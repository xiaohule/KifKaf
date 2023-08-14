module.exports = {
  // https://eslint.org/docs/user-guide/configuring#configuration-cascading-and-hierarchy
  // This option interrupts the configuration hierarchy at this file
  // Remove this if you have an higher level ESLint config file (it usually happens into a monorepos)
  // root: true,

  parserOptions: {
    ecmaVersion: "2021", // Allows for the parsing of modern ECMAScript features
  },

  env: {
    node: true,
  },

  // Rules order is important, please avoid shuffling them
  extends: [
    // Base ESLint recommended rules
    "eslint:recommended",
    "plugin:node/recommended",
    "plugin:prettier/recommended",

    // https://github.com/prettier/eslint-config-prettier#installation
    // usage with Prettier, provided by 'eslint-config-prettier'.
    "prettier",
  ],

  plugins: [
    "node",
    // https://github.com/typescript-eslint/typescript-eslint/issues/389#issuecomment-509292674
    // Prettier has not been included as plugin to avoid performance impact
    // add it as an extension for your IDE
  ],
  // add your custom rules here
  rules: {
    "prefer-promise-reject-errors": "off",
    "no-console": "off",
    "no-unused-vars": ["error", { argsIgnorePattern: "next" }],
    "no-underscore-dangle": ["error", { allow: ["_id"] }],
    "consistent-return": "off",
    "func-names": "off",
    "max-len": ["error", { code: 120 }],
    "object-curly-newline": ["error", { consistent: true }],
    "quote-props": ["error", "consistent"],
    semi: ["error", "always"],
    "comma-dangle": ["error", "always-multiline"],
    "arrow-parens": ["error", "as-needed"],
    "arrow-body-style": ["error", "as-needed"],
    "no-param-reassign": ["error", { props: false }],
    "prefer-destructuring": ["error", { object: true, array: false }],
  },
};
