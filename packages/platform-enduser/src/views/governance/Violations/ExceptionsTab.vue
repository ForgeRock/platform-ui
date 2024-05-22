<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrExceptionList
    :table-rows="exceptions"
    :total-row-count="exceptionsCount"
    :is-loading="isLoadingExceptions"
    :search-input-placeholder="$t('governance.violations.searchExceptions')"
    @handle-search="getExceptions"
    @view-exception-details="viewExceptionDetails" />
</template>

<script setup>
/**
 * Tab component that shows the list of exceptions of end user
 */
import FrExceptionList from '@forgerock/platform-shared/src/components/governance/Exceptions/ExceptionList';
import { ref } from 'vue';
import { getViolationListEndUser } from '@forgerock/platform-shared/src/api/governance/ViolationApi';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { useRouter } from 'vue-router';
import i18n from '@/i18n';

const exceptions = ref([]);
const exceptionsCount = ref(0);
const isLoadingExceptions = ref(false);
const router = useRouter();

/**
 * Gets the Exceptions for the policy
 * @param {Object} searchParams - search parameters to filter data
 * @param {Object} filterPayload - payload to filter data
 */
async function getExceptions(searchParams, filterPayload) {
  isLoadingExceptions.value = true;
  try {
    const { data } = await getViolationListEndUser(searchParams, filterPayload);
    exceptions.value = data.result;
    exceptionsCount.value = data.totalCount;
  } catch (error) {
    exceptions.value = [];
    showErrorMessage(error, i18n.global.t('governance.violations.errorGettingExceptions'));
  } finally {
    isLoadingExceptions.value = false;
  }
}

/**
 * View the exception details
 * @param {Object} exception - The exception to view details
 */
function viewExceptionDetails(exception) {
  router.push({
    name: 'Violation',
    params: {
      violationId: exception.id,
      itemType: 'exception',
    },
  });
}
</script>
