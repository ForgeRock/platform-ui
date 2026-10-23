/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

const METADATA_KEYS = ['_id', '_meta', '_rev', '_type'];

/**
 * Returns a shallow copy of a service configuration with AM metadata fields stripped,
 * so it can be sent back in a create or PUT request.
 * @param {Object} service - Service configuration as returned by the AM services API.
 * @returns {Object} Copy of the configuration without metadata fields.
 */
export function stripMetadata(service) {
  const config = { ...service };
  METADATA_KEYS.forEach((key) => delete config[key]);
  return config;
}
