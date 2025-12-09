/**
 * Copyright (c) 2021-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { convertStringToBase64 } from '@forgerock/platform-shared/src/utils/encodeUtils';
import { generateFraasEnvironmentApi } from '@forgerock/platform-shared/src/api/BaseApi';

const requestConfig = {
  headers: {
    'Content-Type': 'application/json',
    'Accept-API-Version': 'protocol=1.0,resource=1.0',
  },
};

const requestConfigV2 = {
  headers: {
    ...requestConfig.headers,
    'Accept-API-Version': 'resource=2.0',
  },
};

/**
 * Gets the existing variables using the API V2
 * @param {Object} queryConfig the query configuration
 * @param {String} queryConfig.query the query to filter the variables by
 * @param {Number} queryConfig.page the page number to get
 * @param {Number} queryConfig.pageSize the number of items to get per page
 * @param {String} queryConfig.sortBy the field to sort by
 * @param {Boolean} queryConfig.sortDesc whether to sort in descending order
 * @param {String} queryConfig.expressionType the expression type to filter by
 * @returns {Promise} Returns a promise that resolves to an array of variables
 */
export function getStartupVariablesV2({
  query,
  page,
  pageSize,
  sortBy,
  sortDesc,
  expressionType,
} = {}) {
  let _pagedResultsOffset;
  const usingPaging = page && pageSize;
  if (usingPaging) {
    _pagedResultsOffset = (page - 1) * pageSize;
  }

  const searchQuery = query ? `/_id co "${query}"` : '';
  const expressionTypeQuery = expressionType ? `/expressionType eq "${expressionType}"` : '';
  let queryFilter;
  if (searchQuery && expressionTypeQuery) {
    queryFilter = `${searchQuery} and ${expressionTypeQuery}`;
  } else if (searchQuery) {
    queryFilter = searchQuery;
  } else {
    queryFilter = expressionTypeQuery;
  }

  let _sortKeys;
  const usingSort = sortBy && sortDesc !== undefined;
  if (usingSort) {
    _sortKeys = `${sortDesc ? '-' : ''}${sortBy}`;
  }

  return generateFraasEnvironmentApi().get('/variables', {
    ...requestConfigV2,
    params: {
      ...(queryFilter ? { _queryFilter: queryFilter } : {}),
      ...(usingPaging ? { _pagedResultsOffset, _pageSize: pageSize } : {}),
      ...(usingSort ? { _sortKeys } : {}),
    },
  });
}

/**
 * Gets a variable by its _id
 * @param {String} _id the _id of the variable to get
 * @returns {Promise} Returns a promise that resolves to the variable with the given _id
 */
export function getVariable(_id) {
  return generateFraasEnvironmentApi().get(`/variables/${_id}`, requestConfigV2);
}

/**
 * Gets the pending variables using the API V2
 * @returns {Promise} Returns a promise that resolves to an array of variables
 */
export function getPendingVariables() {
  return generateFraasEnvironmentApi().get('/variables', {
    ...requestConfigV2,
    params: {
      _onlyPending: true,
    },
  });
}

/**
 * Updates the description on a variable
 * @param {String} _id the _id of the variable to update
 * @param {String} description the new description
 * @returns {Promise} Returns a promise which resolves when the variable has been updated
 */
export function updateVariableDescription({
  _id,
  description,
}) {
  return generateFraasEnvironmentApi().post(
    `/variables/${_id}`,
    {
      description,
    },
    {
      params: {
        _action: 'setDescription',
      },
      ...requestConfigV2,
    },
  );
}

/**
 * Create or update a variable
 * @param {String} _id the _id of the variable to create or update
 * @param {String} description the description of the variable to create or update
 * @param {String} value the value of the variable to create or update
 * @param {String} type the type that the value should adhere to
 * @returns {Promise} Returns a promise which resolves to the created variable
 */
/* eslint-disable-next-line object-curly-newline */
export function createOrUpdateStartupVariable({ _id, description, value, type }) {
  return generateFraasEnvironmentApi().put(
    `/variables/${_id}`,
    {
      description,
      valueBase64: convertStringToBase64(value),
      expressionType: type,
    },
    requestConfig,
  );
}

/**
 * Deletes a variable
 * @param {String} _id the _id of the variable to delete
 * @returns {Promise} a promise which resolves to the deleted variable
 */
export function deleteStartupVariable(_id) {
  return generateFraasEnvironmentApi().delete(`/variables/${_id}`, requestConfig);
}

/**
 * Gets the existing secrets using the API V2
 * @param {Object} queryConfig the query configuration
 * @param {String} queryConfig.query the query to filter the variables by
 * @param {Number} queryConfig.page the page number to get
 * @param {Number} queryConfig.pageSize the number of items to get per page
 * @param {String} queryConfig.sortBy the field to sort by
 * @param {Boolean} queryConfig.sortDesc whether to sort in descending order
 * @returns {Promise} Returns a promise that resolves to an array of secrets
 */
export function getStartupSecretsV2({
  query,
  page,
  pageSize,
  sortBy,
  sortDesc,
} = {}) {
  let _pagedResultsOffset;
  const usingPaging = page && pageSize;
  if (usingPaging) {
    _pagedResultsOffset = (page - 1) * pageSize;
  }

  let _sortKeys;
  const usingSort = sortBy && sortDesc !== undefined;
  if (usingSort) {
    _sortKeys = `${sortDesc ? '-' : ''}${sortBy}`;
  }

  return generateFraasEnvironmentApi().get('/secrets', {
    ...requestConfigV2,
    params: {
      ...(query ? { _queryFilter: `/_id co "${query}"` } : {}),
      ...(usingPaging ? { _pagedResultsOffset, _pageSize: pageSize } : {}),
      ...(usingSort ? { _sortKeys } : {}),
    },
  });
}

/**
 * Gets a secret by its _id
 * @param {String} _id the _id of the secret to get
 * @returns {Promise} Returns a promise that resolves to the secret with the given _id
 */
export function getSecret(_id) {
  return generateFraasEnvironmentApi().get(`/secrets/${_id}`, requestConfigV2);
}

/**
 * Gets the pending secrets using the API V2
 * @returns {Promise} Returns a promise that resolves to an array of secrets
 */
export function getPendingSecrets() {
  return generateFraasEnvironmentApi().get('/secrets', {
    ...requestConfigV2,
    params: {
      _onlyPending: true,
    },
  });
}

/**
 * Create a secret
 * @param {String} _id the _id of the secret to create or update
 * @param {String} description the description of the secret to create or update
 * @param {String} value the value of the secret to create or update
 * @param {String} encoding the encoding of the value to create or update
 * @param {Boolean} useInPlaceholders whether the secret should be usable within placeholders
 * @returns {Promise} Returns a promise which resolves to the created secret
 */
export function createStartupSecret({
  _id,
  description,
  value,
  encoding,
  useInPlaceholders,
}) {
  return generateFraasEnvironmentApi().put(
    `/secrets/${_id}`,
    {
      encoding,
      useInPlaceholders,
      description,
      valueBase64: convertStringToBase64(value),
    },
    requestConfig,
  );
}

/**
 * Updates the description on a secret
 * @param {String} _id the _id of the secret to update
 * @param {String} description the new description
 * @returns {Promise} Returns a promise which resolves when the secret has been updated
 */
export function updateSecretDescription({
  _id,
  description,
}) {
  return generateFraasEnvironmentApi().post(
    `/secrets/${_id}`,
    {
      description,
    },
    {
      params: {
        _action: 'setDescription',
      },
      ...requestConfig,
    },
  );
}

/**
 * Deletes a secret
 * @param {String} _id the _id of the secret to delete
 * @returns {Promise} a promise which resolves to the deleted secret
 */
export function deleteStartupSecret(_id) {
  return generateFraasEnvironmentApi().delete(`/secrets/${_id}`, requestConfig);
}

/**
 * Get the versions for a secret
 * @param {String} _id the _id of the secret to request versions for
 * @returns {Promise} a promise which resolves to an array of secret versions
 */
export function getStartupSecretVersions(_id) {
  return generateFraasEnvironmentApi().get(`/secrets/${_id}/versions`, requestConfig);
}

/**
 * Create a new version for a secret
 * @param {String} _id the _id of the secret to create a version for
 * @param {String} value the value of the new secret version
 * @returns {Promise} a promise which resolves to the created secret version
 */
export function createStartupSecretVersion(_id, value) {
  return generateFraasEnvironmentApi().post(
    `/secrets/${_id}/versions`,
    {
      valueBase64: convertStringToBase64(value),
    },
    {
      params: {
        _action: 'create',
      },
      ...requestConfig,
    },
  );
}

/**
 * Sets the status of a secret
 * @param {String} _id the _id of the secret to change the status of a version for
 * @param {Number} version the version of the secret to change the status of
 * @param {Status} status the status to set for the secret version
 * @returns {Promise} a promise which resolves to the changed secret version
 */
export function setStartupSecretVersionStatus(_id, version, status) {
  return generateFraasEnvironmentApi().post(
    `/secrets/${_id}/versions/${version}`,
    { status },
    {
      params: {
        _action: 'changestatus',
      },
      ...requestConfig,
    },
  );
}

/**
 * Delete a version of a secret
 * @param {String} _id the _id of the secret to delete a version for
 * @param {Number} version the version of the secret to delete
 * @returns {Promise} a promise which resolves to the deleted secret version
 */
export function deleteStartupSecretVersion(_id, version) {
  return generateFraasEnvironmentApi().delete(`/secrets/${_id}/versions/${version}`, requestConfig);
}

/**
 * Get the current rollout restart status for the tenant
 * @returns {Promise} a promise which resolves to the current rollout restart status
 */
export function getRolloutRestartStatus() {
  return generateFraasEnvironmentApi().get('/startup', requestConfig);
}

/**
 * Initiates a new rollout restart for the tenant
 * @returns {Promise} a promise which resolves to the current rollout restart status
 */
export function beginRolloutRestart() {
  return generateFraasEnvironmentApi().post(
    '/startup',
    null,
    {
      params: {
        _action: 'restart',
      },
      ...requestConfig,
    },
  );
}

/**
 * Gets how many variables and secrets are in an environment.
 * @returns {Promise} a promise which resolves to an object with the count of secrets and variables
 */
export function getSecretsAndVariablesCount() {
  return generateFraasEnvironmentApi().get('/count', requestConfigV2);
}

/**
 * Gets all variables and/or secrets in an environment.
 * @param {Object} queryConfig the query configuration
 * @param {String} [queryConfig.expressionType] The variables expression type to filter by.
 * @param {String} [queryConfig.esvType='all'] The type of ESV to retrieve ('variables', 'secrets', or 'all').
 * @returns {Promise} a promise which resolves to an object with all secrets and variables
 */
export async function getAllEsvs({ expressionType, esvType = 'all' } = {}) {
  const esvCount = await getSecretsAndVariablesCount();
  const pageSize = 100;
  const esvSecrets = [];
  const esvVariables = [];

  const shouldFetchSecrets = esvType === 'all' || esvType === 'secrets';
  const shouldFetchVariables = esvType === 'all' || esvType === 'variables';

  if (shouldFetchSecrets) {
    const secretsPageCount = Math.ceil(esvCount.data.secrets / pageSize);
    for (let i = 1; i <= secretsPageCount; i += 1) {
      /* eslint-disable no-await-in-loop */
      const pageRequest = await getStartupSecretsV2({ page: i, pageSize });
      esvSecrets.push(...pageRequest.data.result);
    }
  }

  if (shouldFetchVariables) {
    const variablesPageCount = Math.ceil(esvCount.data.variables / pageSize);
    for (let i = 1; i <= variablesPageCount; i += 1) {
      /* eslint-disable no-await-in-loop */
      const pageRequest = await getStartupVariablesV2({ page: i, pageSize, expressionType });
      esvVariables.push(...pageRequest.data.result);
    }
  }

  return {
    secrets: esvSecrets,
    variables: esvVariables,
  };
}
