module.exports = {
	root: true,
	extends: '@react-native-community',
	rules: {
		'prettier/prettier': 'off',
		'curly': 'off',
		'comma-dangle': 'off',
		'@typescript-eslint/no-unused-vars': 'off',
		'react-hooks/exhaustive-deps': 'off',
		'react-native/no-inline-styles': 'off',
		'react/no-unstable-nested-components': [
			'warn',
			{ 'allowAsProps': true }
		]
	},
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint'],
	overrides: [
		{
			files: ['*.ts', '*.tsx'],
			rules: {
				'@typescript-eslint/no-shadow': ['error'],
				'no-shadow': 'off',
				'no-undef': 'off',
			},
		},
	],
};

