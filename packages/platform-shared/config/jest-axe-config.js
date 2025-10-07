import { configureAxe } from 'jest-axe';

/**
 * Returns an axe instance with default rules, allowing selective overrides.
 * Only provided override properties (including individual rule fields) are merged.
 *
 * @param {Object} overrides - Optional config overrides
 * @returns {Object} Configured axe instance
 * @example
 * const axe = getAxe({
 *   rules: {
 *     'region': { enabled: true }, // override default to enable this rule
 *   },
 *   reporter: 'v2', // add a non-rule config override
 * });
 */
// eslint-disable-next-line import/prefer-default-export
export function getAxe(overrides = {}) {
  const defaultConfig = {
    rules: {
      region: { enabled: false },
      'color-contrast': { enabled: false },
    },
  };

  const mergedConfig = { ...defaultConfig };

  // Merge non-rules top-level keys
  Object.keys(overrides).forEach((key) => {
    if (key !== 'rules') {
      mergedConfig[key] = overrides[key];
    }
  });

  // Merge rules selectively
  if (overrides.rules) {
    mergedConfig.rules = { ...defaultConfig.rules };
    Object.entries(overrides.rules).forEach(([ruleName, ruleOverride]) => {
      mergedConfig.rules[ruleName] = {
        ...(mergedConfig.rules[ruleName] || {}),
        ...ruleOverride,
      };
    });
  }

  return configureAxe(mergedConfig);
}
