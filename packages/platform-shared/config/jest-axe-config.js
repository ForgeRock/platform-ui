/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { configureAxe } from 'jest-axe';
import { placeholderAsNameCheck, placeholderAsNameRule } from './axe-custom-rules/placeholder-as-name';

/**
 * Returns an axe instance with default rules, allowing selective overrides.
 * Only provided override properties (including individual rule fields) are merged.
 *
 * Also registers the custom "placeholder-as-label" rule (WCAG 3.3.2 — see
 * axe-custom-rules/placeholder-as-name.js) and enables it by default, so any
 * text field whose accessible name relies on its placeholder fails here even
 * though stock axe's `label` rule would pass it. To exempt a known false
 * positive, disable the rule for that run:
 *
 *   await runA11yTest(wrapper, { rules: { 'placeholder-as-label': { enabled: false } } });
 *
 * Checks and rules must be registered via globalOptions (axe-core's configure);
 * run options can only toggle rules that are already registered.
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
export function getAxe(overrides = {}) {
  const defaultConfig = {
    globalOptions: {
      checks: [placeholderAsNameCheck],
      rules: [placeholderAsNameRule],
    },
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
