module.exports = {
	moduleFileExtensions: [
		'js',
		'json',
		'vue',
	],
	transform: {
		'^.+\\.vue$': 'vue-jest',
		'^.+\\.js$': 'babel-jest',
		'.+\\.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub',
	},
	transformIgnorePatterns: [
		'/node_modules/.*',
		'node_modules/(?!(babel-jest|jest-vue-preprocessor)/)',
	],
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/src/$1',
	},
	snapshotSerializers: [
		'jest-serializer-vue',
	],
	testMatch: [
		'**/*.test.js',
	],
	watchPlugins: [
		'jest-watch-typeahead/filename',
		'jest-watch-typeahead/testname',
	],
	collectCoverageFrom: [
		'**/*.vue',
		'!**/node_modules/**',
	],
};
