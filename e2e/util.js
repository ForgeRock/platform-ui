/**
 * Copyright 2023-2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

/**
 * Filter Cypress tests based on a given tag or tags. If no tags are present, run tests.
 * Also applies tags to the wrapped tests for @cypress/grep compatibility, enabling
 * pipeline-level filtering via CYPRESS_grepTags (e.g. "@cloud+-@skip").
 *
 * @param {Array} definedTags An array of tags
 * @param {Function} runTest All tests captured within a Cypress run
 * @example cypress open --env TAGS=forgeops
 * @example cypress open --env TAGS=forgeops/cloud
 */
export const filterTests = (definedTags, runTest) => {
  describe('', { tags: definedTags }, () => {
    let executed = false;
    if (Cypress.env('TAGS')) {
      const orTagsGroups = Cypress.env('TAGS').split(' or ');
      orTagsGroups.forEach((andTagsGroup) => {
        if (andTagsGroup.split(' and ').every((tag) => definedTags.includes(tag)) && !executed) {
          runTest();
          executed = true;
        }
      });
    } else {
      runTest();
    }
  });
};

/**
 * This is a wrapper function over Cypress's beforeEach. Cypress does not
 * retry when a test fails within the beforeEach block normally, and this
 * allows retries. As suggested by: https://github.com/cypress-io/cypress/issues/19458
 *
 * @param {*} beforeEachFunction function specified in same way that
 * beforeEach would normally be defined
 */
export const retryableBeforeEach = (beforeEachFunction) => {
  let shouldRun = true;

  // Only need to run beforeEach on first attempt
  beforeEach(() => {
    if (!shouldRun) return;
    shouldRun = false;
    beforeEachFunction();
  });

  Cypress.on('test:after:run', (result) => {
    // If a test fails, set runBeforeEach to true. Cypress then retries, calling
    // beforeEach(), which calls beforeEachFunction(), and then the test that failed
    if (result.state === 'failed') {
      if (result.currentRetry < result.retries) {
        shouldRun = true;
      }
    } else if (result.state === 'passed') {
      shouldRun = true;
    }
  });
};

/**
 * Data-driven test utility. Loops through an array of data and calls `it` for each item.
 * The title can be a string or a function that receives the data item and returns a string.
 * Include a `tags` property in each data item to tag individual cases.
 *
 * @param {Array} data - Array of data items. Each item must have a `name` property for the test title.
 *                       Optionally include `tags` for @cypress/grep tag filtering.
 * @param {function} testFn - Test body that receives the data item
 *
 * @example
 * eachCase([
 *   { name: 'Add base-uri directive (None checkbox)', tags: '@C24591', directive: 'base-uri', source: 'none', expected: "'none'" },
 *   { name: 'Add child-src directive (All checkbox)', tags: '@C24592', directive: 'child-src', source: 'all', expected: '*' },
 * ], ({ directive, source, expected }) => {
 *   adminSteps.cspReportOnlyPolicy.openAddDirectiveModal();
 *   adminSteps.cspReportOnlyPolicy.selectDirective(directive);
 *   adminSteps.cspReportOnlyPolicy.checkSource(source);
 *   adminSteps.cspReportOnlyPolicy.saveDirective();
 *   adminSteps.cspReportOnlyPolicy.assertDirectiveInTableWithValue(directive, expected);
 * });
 */
export const eachCase = (data, testFn) => {
  data.forEach((item) => {
    const options = item.tags ? { tags: item.tags } : {};
    it(item.name, options, () => testFn(item));
  });
};
