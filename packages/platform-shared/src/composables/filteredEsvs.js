/**
 * Copyright (c) 2023-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { computed } from 'vue';
import { determineEsvTypeForField, showEsvSecretsForField } from '../utils/esvUtils';
import { useEsvInputStore } from '../stores/esvInput';

/**
 * Filters the list of ESV secrets and variables taken from the global store
 * based on a search query and a field type
 * @param {String} query the search query to filter by
 * @param {String} fieldType the type of the field to filter by
 * @returns {Object} containing the loading state, a list of filtered variables and secrets,
 * whether secrets are to be displayed and a reactive variable to toggle the list in use
 */
export default function useFilteredEsvs(query, fieldType) {
  if (query === null || query === undefined || fieldType === null || fieldType === undefined) {
    throw new Error('Both fieldType and query are required to use this composable');
  }
  const esvInputStore = useEsvInputStore();

  // Only expose variables which have the expected expression type or that have no type
  const expressionTypesToInclude = determineEsvTypeForField(fieldType);
  const relevantVariables = computed(() => esvInputStore.variables
    .filter(({ expressionType }) => typeof expressionType === 'undefined' || expressionTypesToInclude.includes(expressionType)));

  // Compute the ESV list, only include secrets if needed for the field type
  const includeSecrets = showEsvSecretsForField(fieldType);
  const filteredEsvs = computed(() => {
    const lowerCaseQuery = query.value.toLowerCase();

    return [
      ...relevantVariables.value.filter(({ placeholder }) => placeholder.includes(lowerCaseQuery)),
      ...(includeSecrets ? esvInputStore.secrets.filter(({ placeholder }) => placeholder.includes(lowerCaseQuery)) : []),
    ];
  });

  const isLoading = computed(() => esvInputStore.loading);

  const esvListInUse = computed({
    get() {
      return esvInputStore.listInUse;
    },
    set(listInUse) {
      // When the list is being shown, update values in the store so that the list can be reloaded
      esvInputStore.listInUse = listInUse;
      esvInputStore.supportedTypes = expressionTypesToInclude;
    },
  });

  return {
    isLoading,
    filteredEsvs,
    secretsVisible: includeSecrets,
    esvListInUse,
  };
}
