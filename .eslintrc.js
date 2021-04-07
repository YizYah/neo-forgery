/* ns__file unit: standard, comp: .eslintrc.js */
module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: './tsconfig.json',
    },
    plugins: ['@typescript-eslint'],
    extends: [
        'plugin:@typescript-eslint/recommended',
    ],
    rules:  {
        /* ns__custom_start lintRules */
        "no-console": ["error"],
        "@typescript-eslint/no-var-requires": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/ban-types": "off",
        "@typescript-eslint/no-explicit-any":"off",
        "@typescript-eslint/ban-ts-comment": "off"
        /* ns__custom_end lintRules */
    }
}
