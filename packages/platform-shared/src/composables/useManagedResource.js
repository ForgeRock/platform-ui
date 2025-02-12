/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { useAsyncState } from '@vueuse/core';
import { ref, watch } from 'vue';
import { chain } from 'lodash';
import { getManagedResource, getManagedResourceList } from '../api/ManagedResourceApi';

export const MANAGED_RESOURCE_TYPES = Object.freeze({
  USER: 'user',
});

// Each resource type has a different query filter
const QUERY_FILTER_BY_RESOURCE_TYPE = {
  [MANAGED_RESOURCE_TYPES.USER]: (searchTerm) => `givenName co '${searchTerm}' or sn co '${searchTerm}' or userName co '${searchTerm}'`,
};

// Each resource type has a different formatter
const FORMATTER_BY_RESOURCE_TYPE = {
  [MANAGED_RESOURCE_TYPES.USER]: ({
    _id, sn, givenName, profileImage, userName,
  }) => ({
    meta: {
      givenName,
      sn,
      profileImage,
      userName,
    },
    multiselectId: _id,
    text: userName,
    value: _id,
  }),
};

/**
 * Fetches a list of managed resources
 *
 * @param {String} resourceName Specific managed resource path example: managed/user
 * @param {String} resourceType Type of resource
 * @param {String} searchTerm Search term to filter the resources
 * @returns {Promise} A list of managed resources
 */
async function getManagedResources(resourceName, resourceType, searchTerm) {
  return getManagedResourceList(resourceName, {
    queryFilter: QUERY_FILTER_BY_RESOURCE_TYPE[resourceType](searchTerm),
    _pageSize: 10,
  }).then((response) => response.data.result);
}

/**
 * Fetches a list of managed resources by id, if the resource is not found it
 * will remove it from the list
 *
 * @param {String} resourceName Specific managed resource path example: alpha_user
 * @param {String} ids A managed resource _id list
 * @returns {Promise} A managed resource list
 */
async function getManagedResourcesById(resourceName, ids) {
  const resources = await Promise.all([
    ...ids.map(
      (id) => getManagedResource(`${resourceName}`, id)
        .then((response) => response.data)
        .catch((error) => {
          if (error.response.status === 404) {
            return null; // if user is not found, return null
          }
          throw error;
        }),
    ),
  ]);
  return resources.filter((resource) => resource !== null); // remove not found resources
}

/**
 * @typedef {Object} UseManagedResourceState
 * @property {import('vue').Ref<boolean>} isLoading - The loading state.
 * @property {import('vue').Ref<string>} error - The error message.
 * @property {import('vue').Ref<Array>} data - The managed resources.
 * @property {import('vue').Ref<Array>} initialIds - The initial ids.
 * @property {import('vue').Ref<string>} searchTerm - The search term.
 */

/**
 * Composable to fetch managed resources, it exposes the data, loading state,
 * and error. It can be used to search for resources in a select or a multiselect.
 * Initial ids can be passed to fetch the resources by id and add them to the data,
 * this can be beneficical when you want to pre-populate the select or multiselect.
 * It uses useAsyncState composable to handle the async state. @see {@link https://vueuse.org/core/useAsyncState}
 *
 * @param {String} realm - Name of realm
 * @param {String} resourceType - Type of resource
 * @param {Array} initialIds - Array of initial ids, it will fetch the resources by id and add them to the data
 * @param {String} searchTerm - Search term to filter the resources
 * @returns {UseManagedResourceState} Composable state
 *
 * @example:
 *
 * ```
 * const {
 *   isLoading,
 *   error,
 *   data,
 *   initialIds,
 *   searchTerm,
 * } = useManagedResource('alpha', 'user');
 * ```
 * For more see a full example in `packages/platform-shared/src/views/Reports/ReportTemplate/ReportSettingsAssignViewersForm.vue`
 *
 * TODO: Add support for other resource types, for now only user is supported
 */
export function useManagedResource(realm, resourceType, initialIds = [], searchTerm = '') {
  const resourceName = `${realm}_${resourceType}`;
  const searchTermRef = ref(searchTerm);
  const initialIdsRef = ref(initialIds);

  const {
    state, isLoading, error, execute,
  } = useAsyncState(
    async (args) => Promise.all([
      getManagedResources(resourceName, resourceType, args?.searchTerm || searchTermRef.value), // load the managed resources depending on the search term
      getManagedResourcesById(resourceName, initialIdsRef.value), // load the initial ids if any
    ]).then((result) => chain(result)
      .flatten()
      .uniqBy('_id')
      .map(FORMATTER_BY_RESOURCE_TYPE[resourceType])
      .value()),
    [],
  );

  // watch the search term and execute the search again when it changes
  watch(searchTermRef, (newVal) => execute(0, { searchTerm: newVal }));

  return {
    isLoading,
    error,
    data: state,
    initialIds: initialIdsRef,
    searchTerm: searchTermRef,
  };
}
