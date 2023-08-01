/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { computed } from 'vue';
import { determineEsvTypeForField } from '../utils/esvUtils';
import { useEsvInputStore } from '../stores/esvInput';

export default function useFilteredEsvs(query, fieldType) {
  if (query === null || query === undefined || fieldType === null || fieldType === undefined) {
    throw new Error('Both fieldType and query are required to use this composable');
  }
  const esvInputStore = useEsvInputStore();

  // Only expose variables which have the expected expression type or that have no type
  const expressionTypesToInclude = determineEsvTypeForField(fieldType);
  const relevantVariables = computed(() => esvInputStore.variables
    .filter(({ expressionType }) => typeof expressionType === 'undefined' || expressionTypesToInclude.includes(expressionType)));

  const filteredVariables = computed(() => relevantVariables.value.filter(({ placeholder }) => placeholder.includes(query.value.toLowerCase())));
  const filteredSecrets = computed(() => esvInputStore.secrets.filter(({ placeholder }) => placeholder.includes(query.value.toLowerCase())));

  return { filteredVariables, filteredSecrets };
}
