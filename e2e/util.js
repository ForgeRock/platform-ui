/**
 * Copyright 2023-2024 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

/**
 * Filter Cypress tests based on a given tag or tags. If no tags are present, run tests.
 *
 * @param {Array} definedTags An array of tags
 * @param {Function} runTest All tests captured within a Cypress run
 * @example cypress open --env TAGS=forgeops
 * @example cypress open --env TAGS=forgeops/cloud
 */
export const filterTests = (definedTags, runTest) => {
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
