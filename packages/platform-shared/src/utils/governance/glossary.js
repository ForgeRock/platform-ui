/**
 * Copyright 2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { getGlossaryAttributes } from '@forgerock/platform-shared/src/api/governance/GlossaryApi';
/**
 * Gets glossary attributes
 * Method that fetches the schema of the glossary attributes, the glossary attributes for entitlements endpoint
 * returns all the attributes paginated with a page size of 10 by default, the form must to be generated no matter
 * how many attributes exist, this method ask endpoint for 100 attributes, in case there are more than that a
 * second request is sent asking for the remaining attributes
 * @param {String} resourceType resource type (e.g., role or entitlement)
 */
// eslint-disable-next-line import/prefer-default-export
export async function getGlossarySchema(resourceType = 'role') {
  const params = {
    objectType: `/openidm/managed/${resourceType}`,
    pageNumber: 0,
    pageSize: 100,
    sortBy: 'name',
    sortDir: 'asc',
  };

  try {
    // get first 100 attributes
    const { data: glossaryAtributes } = await getGlossaryAttributes(params);
    const { result: glosaryAttributesArray, resultCount, totalCount } = glossaryAtributes;

    // if more than 100 results, get remaining attributes
    if (resultCount < totalCount) {
      params.pageNumber = 1;
      params.pageSize = totalCount - resultCount;
      const { data: remainingCallData } = await getGlossaryAttributes(params);
      glosaryAttributesArray.push(remainingCallData.result);
    }

    // return one array with all attributes
    return glosaryAttributesArray.flatMap((item) => item);
  } catch (error) {
    return Promise.reject(error);
  }
}
