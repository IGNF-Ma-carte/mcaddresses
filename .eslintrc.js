module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "plugins": ["sonarjs"],
    "extends": ["eslint:recommended", "plugin:sonarjs/recommended"],
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "rules": {
        "sonarjs/cognitive-complexity": "off",
        "sonarjs/no-duplicate-string": "off"
    }
}
