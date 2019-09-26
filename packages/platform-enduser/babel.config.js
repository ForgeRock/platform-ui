module.exports = {
	presets: [
		['@vue/app', {
			useBuiltIns: 'entry',
		}],
	],
	env: {
		test: {
			plugins: ['require-context-hook'],
		},
	},
};
