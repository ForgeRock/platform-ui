/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import {
  deleteSecretMapping,
  getAvailableSecretMappings,
  getSecretMappings,
  saveSecretMapping,
} from '@e2e/api/secretMappingsApi.e2e';
import {
  createSecret,
  deleteSecret,
} from '@e2e/api/esvApi.e2e';

export default class SecretMappingsApiSteps {
  static createdSecretIds = [];

  static secretCreationCount = 0;

  static originalMappings = new Map();

  static getSecretMappings() {
    return getSecretMappings();
  }

  static getAvailableSecretMappings() {
    return getAvailableSecretMappings();
  }

  static preserveMappingState(secretLabel) {
    return cy.then(() => {
      if (SecretMappingsApiSteps.originalMappings.has(secretLabel)) return null;

      return getSecretMappings().then(({ body }) => {
        const existingMapping = body.result?.find((mapping) => (
          (mapping._id || mapping.secretLabel || mapping.secretId) === secretLabel
        ));
        SecretMappingsApiSteps.originalMappings.set(secretLabel, {
          alias: existingMapping?.aliases?.[0] || '',
          exists: Boolean(existingMapping),
        });
        return null;
      });
    });
  }

  static saveSecretMapping(secretLabel, alias) {
    return SecretMappingsApiSteps.preserveMappingState(secretLabel)
      .then(() => saveSecretMapping(secretLabel, alias));
  }

  static clearMappingForAssignment(secretLabel) {
    return SecretMappingsApiSteps.preserveMappingState(secretLabel)
      .then(() => deleteSecretMapping(secretLabel, false));
  }

  static deleteSecretMapping(secretLabel, failOnStatusCode = true) {
    return deleteSecretMapping(secretLabel, failOnStatusCode);
  }

  static restoreOriginalMappings() {
    return cy.wrap(Array.from(SecretMappingsApiSteps.originalMappings.entries())).each(([secretLabel, originalMapping]) => {
      if (originalMapping.exists) return saveSecretMapping(secretLabel, originalMapping.alias);
      return deleteSecretMapping(secretLabel, false);
    }).then(() => {
      SecretMappingsApiSteps.originalMappings.clear();
    });
  }

  static createSecret(secretId, value) {
    SecretMappingsApiSteps.secretCreationCount += 1;
    const uniqueSecretId = `${secretId}-${Date.now()}-${SecretMappingsApiSteps.secretCreationCount}-${Math.random().toString(36).slice(2, 8)}`;
    return createSecret(uniqueSecretId, {
      description: 'Secret Mappings E2E test secret',
      encoding: 'generic',
      useInPlaceholders: false,
      valueBase64: btoa(value),
    }).then((response) => {
      SecretMappingsApiSteps.createdSecretIds.push(uniqueSecretId);
      expect(response.status).to.equal(200);
      return uniqueSecretId;
    });
  }

  static cleanup() {
    return cy.wrap(SecretMappingsApiSteps.createdSecretIds.slice()).each((secretId) => (
      deleteSecret(secretId, undefined, { failOnStatusCode: false, retryOnStatusCodeFailure: false })
    )).then(() => {
      SecretMappingsApiSteps.createdSecretIds = [];
    });
  }
}
