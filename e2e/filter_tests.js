/**
 * Copyright 2021-2022 ForgeRock AS. All Rights Reserved
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
const filterTests = (definedTags, runTest) => {
  if (Cypress.env('TAGS')) {
    const tags = Cypress.env('TAGS').split('/');
    const found = definedTags.some(($definedTag) => tags.includes($definedTag));

    if (found) {
      runTest();
    }
  } else {
    runTest();
  }
};

export default filterTests;
