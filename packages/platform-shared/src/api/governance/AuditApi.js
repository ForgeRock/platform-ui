/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateIgaApi } from '@forgerock/platform-shared/src/api/BaseApi';
import encodeQueryString from '@forgerock/platform-shared/src/utils/encodeQueryString';

const auditUrl = 'governance/audit';

/**
 * Get a paginated list of governance audit records.
 *
 * @param {Object} queryParams - Query parameters (pageSize, queryFilter, sortKeys, searchAfter, etc.)
 * @returns {Promise} Resolves to audit result with result[], totalCount, and pagination.searchAfter
 */
export async function getAuditLogs(queryParams = {}) {
  const {
    page, startDate, endDate, actor, eventType, objectId, ...rest
  } = queryParams;
  const encodedQueryParams = encodeQueryString(rest, false);
  const sep = (s) => (s ? '&' : '?');
  let rawParams = encodedQueryParams;
  const append = (key, val) => {
    if (val != null) rawParams += `${sep(rawParams)}${key}=${encodeURIComponent(val)}`;
  };
  append('startDate', startDate);
  append('endDate', endDate);
  append('actor', actor);
  append('eventType', eventType);
  append('objectId', objectId);
  append('page', page);
  return generateIgaApi().get(`${auditUrl}${rawParams}`);
}

/**
 * Get all audit records matching the given params, fetching up to maxRows in batches.
 * Used for bulk export (xlsx/PDF).
 *
 * @param {Object} queryParams - Base query params (queryFilter, sortKeys, etc.)
 * @param {number} [maxRows=10000] - Maximum number of rows to fetch
 * @returns {Promise<Array>} Resolves to a flat array of audit records
 */
export async function getAllAuditLogs(queryParams = {}, maxRows = 10000) {
  const pageSize = Math.min(maxRows, 500);
  const allResults = [];
  let page = 1;
  do {
    const params = { ...queryParams, pageSize, page };
    // eslint-disable-next-line no-await-in-loop
    const { data } = await getAuditLogs(params);
    const batch = data?.result ?? [];
    allResults.push(...batch);
    if (allResults.length >= maxRows || batch.length < pageSize) break;
    page += 1;
  } while (true); // eslint-disable-line no-constant-condition

  return allResults.slice(0, maxRows);
}
