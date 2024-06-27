/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

// eslint-disable-next-line import/extensions
import { useAsyncState } from '@vueuse/core';
import { watch, ref } from 'vue';
import { getManagedResourceList } from '../../../api/ManagedResourceApi';

/**
 * Names of the default groups used in report details settings
 */
export const defaultGroups = ['report_admin', 'report_author', 'report_viewer'];

/**
 * Format the data for the multiselect input
 *
 * @param {Object} data - Array containing managed users
 * @returns {Array} Array containing users and groups formatted for a multiselect
 */
function formatData(data) {
  if (!data?.data?.result?.length) {
    return [];
  }
  return data.data.result.map(({
    _id, sn, givenName, profileImage, userName,
  }) => ({
    meta: {
      givenName,
      sn,
      profileImage,
      type: 'user',
      userName,
    },
    multiselectId: userName,
    text: userName,
    value: _id,
  }));
}

/**
 * Handles creating the query and fetching from the Managed API
 *
 * @param {String} searchTerm - Text used to search for users.
 * @param {String} realmName - Name of realm
 * @param {Boolean} isId - Determines if search query should specifically look for an ID
 * @returns {Promise<Array>} Combined responses of Managed API requests.
 */
async function handleFetchManagedUsers(searchTerm, realmName, isId) {
  let userQueryFilter = true;

  if (isId === true) {
    userQueryFilter = `_id eq '${searchTerm}'`;
  } else if (searchTerm) {
    userQueryFilter = `givenName co '${searchTerm}' or sn co '${searchTerm}' or userName co '${searchTerm}'`;
  }

  return getManagedResourceList(`${realmName}_user`, { queryFilter: userQueryFilter, _pageSize: 10 });
}

/**
 * Composable to fetch managed users
 *
 * @param {String} realm - Realm name for querying Managed Resource user
 * @returns {Object} Composable state
 */
export default function useManagedUsers(realm) {
  const userOptionData = ref([]);

  const {
    state, isLoading, error, execute,
  } = useAsyncState(
    (...args) => handleFetchManagedUsers(...args),
    [],
    { immediate: false },
  );

  /**
   * Make a request to retrieve Managed Users and static Managed Groups
   * If a fetch is called without a searchTerm we need to not return any results
   *
   * @param {String} searchTerm - String containing the term to be used in the queries
   * @param {Boolean} isId - Determines if search query should specifically look for an ID
   */
  function fetchManagedUsers(searchTerm, isId) {
    if (!searchTerm) {
      userOptionData.value = [];
      return;
    }
    execute(0, searchTerm, realm, isId);
  }

  watch(state, (newVal) => {
    userOptionData.value = formatData(newVal);
  });

  return {
    userOptionData,
    userOptionError: error,
    fetchManagedUsers,
    isLoading,
  };
}
