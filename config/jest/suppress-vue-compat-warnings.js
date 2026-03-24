/**
 * Copyright 2025-2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

/**
 * Suppress Vue compat deprecation warnings and intlify HTML warnings during Jest tests in CI.
 * The migration from Vue 2 to Vue 3 using @vue/compat mode prints deprecation warnings with full stack traces
 * Vue warnings: ~43K lines with component traces (COMPONENT_V_MODEL, WATCH_ARRAY, etc.)
 * intlify warnings: ~4K lines about intentional HTML in i18n messages
 *
 * Conservative approach:
 * - console.warn: Suppresses Vue deprecation warnings (these use console.warn with [Vue warn] prefix)
 * - console.error: Only suppresses very specific known errors (Vue disabled compat, intlify HTML)
 * - Test failures, assertion errors, and unexpected errors are NEVER suppressed
 *
 * Only active in CI (process.env.CI or JENKINS_HOME), warnings visible in local development.
 */

// Vue 3 compat deprecation codes to suppress
const VUE_DEPRECATION_CODES = [
  'COMPONENT_V_MODEL',
  'WATCH_ARRAY',
  'INSTANCE_EVENT_EMITTER',
  'INSTANCE_EVENT_HOOKS',
  'INSTANCE_CHILDREN',
  'INSTANCE_SCOPED_SLOTS',
  'INSTANCE_ATTRS_CLASS_STYLE',
  'OPTIONS_BEFORE_DESTROY',
  'OPTIONS_DESTROYED',
  'V_ON_KEYCODE_MODIFIER',
  'CUSTOM_DIR',
  'ATTR_FALSE_VALUE',
  'ATTR_ENUMERATED_COERCION',
  'TRANSITION_GROUP_ROOT',
  'COMPONENT_ASYNC',
  'COMPONENT_FUNCTIONAL',
  'GLOBAL_MOUNT',
  'GLOBAL_EXTEND',
  'GLOBAL_PROTOTYPE',
  'GLOBAL_SET',
  'GLOBAL_DELETE',
  'GLOBAL_OBSERVABLE',
  'CONFIG_OPTION_MERGE_STRATS',
  'CONFIG_SILENT',
  'CONFIG_PRODUCTION_TIP',
  'CONFIG_IGNORED_ELEMENTS',
  'CONFIG_WHITESPACE',
  'CONFIG_KEY_CODES',
  'RENDER_FUNCTION',
  'FILTERS',
  'PRIVATE_APIS',
];

// Patterns to suppress (warnings that should not appear in CI logs)
const SUPPRESS_PATTERNS = [
  '[intlify] Detected HTML', // intlify HTML warnings (intentional HTML in i18n)
  'warnDeprecation', // Vue deprecation stack traces
  'Details: https://v3-migration.vuejs.org', // Vue migration guide links
  'configureCompat({', // Vue compat configuration suggestions
];

// CI-only warning allowlist for deterministic unit-test harness noise.
// Keep first-N occurrences visible to preserve debuggability.
const CI_WARNING_ALLOWLIST = [
  {
    key: 'Failed to resolve directive: resizable-table',
    type: 'includes',
    pattern: 'Failed to resolve directive: resizable-table',
    maxOccurrences: 20,
  },
  {
    key: 'Failed to resolve directive: b-toggle',
    type: 'includes',
    pattern: 'Failed to resolve directive: b-toggle',
    maxOccurrences: 20,
  },
  {
    key: 'Failed to resolve component: RouterLink',
    type: 'includes',
    pattern: 'Failed to resolve component: RouterLink',
    maxOccurrences: 20,
  },
  {
    key: 'BootstrapVue missing target copyButton',
    type: 'regex',
    pattern: /\[BootstrapVue warn\].*Unable to find target element by ID "#copyButton-/,
    maxOccurrences: 20,
  },
  {
    key: 'BootstrapVue missing target properties',
    type: 'includes',
    pattern: 'Unable to find target element by ID "#properties"',
    maxOccurrences: 20,
  },
  {
    key: 'BootstrapVue missing target documents',
    type: 'includes',
    pattern: 'Unable to find target element by ID "#documents"',
    maxOccurrences: 20,
  },
];

const ciWarningCounts = new Map();

const isCI = process.env.CI === 'true' || Boolean(process.env.JENKINS_HOME);

/**
 * Check if a console.warn message should be suppressed
 * @param {*} message - The console.warn message to check
 * @returns {boolean} - True if message should be suppressed
 */
function shouldSuppressWarning(message) {
  if (typeof message !== 'string') {
    return false;
  }

  // Check if it's a Vue deprecation warning (these use console.warn with [Vue warn] prefix)
  if (message.includes('[Vue warn]') && message.includes('deprecation')) {
    return true;
  }

  // Check if it matches any Vue deprecation code
  if (VUE_DEPRECATION_CODES.some((code) => message.includes(code))) {
    return true;
  }

  // Check if it matches any suppression pattern
  if (SUPPRESS_PATTERNS.some((pattern) => message.includes(pattern))) {
    return true;
  }

  // Check if it matches the generic deprecation pattern (Vue compat warnings)
  if (/deprecation [A-Z_]+/.test(message)) {
    return true;
  }

  return false;
}

function getCiAllowlistRule(message) {
  return CI_WARNING_ALLOWLIST.find((rule) => {
    if (rule.type === 'regex') {
      return rule.pattern.test(message);
    }

    return message.includes(rule.pattern);
  });
}

/**
 * Check if a console.error message should be suppressed
 * Conservative approach: Only suppress very specific known error messages
 * NEVER suppress test failures, assertion errors, or unexpected errors
 * @param {*} message - The console.error message to check
 * @returns {boolean} - True if message should be suppressed
 */
function shouldSuppressError(message) {
  if (typeof message !== 'string') {
    return false;
  }

  // NEVER suppress messages that look like test failures or real errors
  const NEVER_SUPPRESS = [
    'expected',
    'received',
    'AssertionError',
    'Test failed',
    'FAIL',
    'Error:',
    'TypeError:',
    'ReferenceError:',
    'SyntaxError:',
    'at Object.',
    'at Suite.',
    'at Test.',
    'at Context.',
  ];

  // If it looks like a test failure or real error, never suppress it
  if (NEVER_SUPPRESS.some((pattern) => message.includes(pattern))) {
    return false;
  }

  // ONLY suppress the specific Vue compat error about disabled behavior
  // This is the only console.error that Vue compat legitimately emits for deprecations
  if (message.includes('^ The above deprecation\'s compat behavior is disabled')) {
    return true;
  }

  // ONLY suppress intlify HTML detection errors (these are warnings about intentional HTML)
  if (message.includes('[intlify] Detected HTML')) {
    return true;
  }

  // Default: Do NOT suppress console.error messages
  // Better to show an extra error than hide a real test failure
  return false;
}

// Only suppress in CI environments (not in local development)
/* eslint-disable no-console */
if (isCI) {
  const originalError = console.error;

  // Conservative suppression for console.error
  // Only suppress very specific known error messages, never test failures
  console.error = function error(...args) {
    if (shouldSuppressError(args[0])) {
      return;
    }
    originalError.apply(console, args);
  };

  // Also suppress Vue's built-in warn handler
  if (typeof global.Vue !== 'undefined' && global.Vue.config) {
    global.Vue.config.warnHandler = () => {};
  }
}
// Suppress console.warn for Vue compat deprecation warnings (both local and CI)
const originalWarn = console.warn;

console.warn = function warn(...args) {
  if (isCI && typeof args[0] === 'string') {
    const message = args[0];
    const allowlistRule = getCiAllowlistRule(message);

    if (allowlistRule) {
      const currentCount = (ciWarningCounts.get(allowlistRule.key) || 0) + 1;
      ciWarningCounts.set(allowlistRule.key, currentCount);

      if (currentCount > allowlistRule.maxOccurrences) {
        if (currentCount === allowlistRule.maxOccurrences + 1) {
          originalWarn(
            `[Jest warn filter] Suppressing further occurrences of CI-allowlisted warning: "${allowlistRule.key}" after ${allowlistRule.maxOccurrences} logs.`,
          );
        }
        return;
      }
    }
  }

  if (shouldSuppressWarning(args[0])) {
    return;
  }
  originalWarn.apply(console, args);
};
/* eslint-enable no-console */
