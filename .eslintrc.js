module.exports = {
    root: true,
    env: {
        node: true,
    },
    extends: [
        'plugin:vue/vue3-recommended',
        'eslint:recommended',
    ],
    parserOptions: {
        ecmaVersion: 2020,
    },
    rules: {
        // 在此添加自定义规则
        "vue/script-setup-uses-vars": "error",
        // "no-unused-vars": "warn", // 或 'off'
    },
};
