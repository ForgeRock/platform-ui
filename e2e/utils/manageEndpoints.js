/**
 * Copyright 2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { deleteEndpoint } from '@e2e/api/endpointsApi.e2e';

/**
 * Deletes multiple endpoints via API
 * @param {string[]} endpointNames - Array of endpoint names to delete
 */
export default function deleteEndpoints(endpointNames) {
  endpointNames.forEach((name) => {
    deleteEndpoint(name);
  });
}
