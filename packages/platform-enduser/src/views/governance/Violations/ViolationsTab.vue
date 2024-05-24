<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <ViolationList
    :table-rows="violations"
    :total-row-count="violationsCount"
    :is-loading="isLoadingViolations"
    :search-input-placeholder="$t('governance.violations.searchViolations')"
    @handle-search="getViolations"
    @view-violation-details="viewViolationDetails"
    @revoke-violation="revokeViolation" />
</template>

<script setup>
import ViolationList from '@forgerock/platform-shared/src/components/governance/Violations/ViolationList';
import { ref } from 'vue';
import { getViolationListEndUser } from '@forgerock/platform-shared/src/api/governance/ViolationApi';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { useRouter } from 'vue-router';
import i18n from '@/i18n';

/**
 * Tab component that shows the list of violations of end user
 */

const violations = ref([]);
const violationsCount = ref(0);
const isLoadingViolations = ref(false);
const router = useRouter();

/**
 * Gets the violations for the policy
 * @param {Object} searchParams - search parameters to filter data
 * @param {Object} filterPayload - payload to filter data
 */
async function getViolations(searchParams, filterPayload) {
  isLoadingViolations.value = true;
  try {
    const { data } = await getViolationListEndUser(searchParams, filterPayload);
    violations.value = data.result;
    violationsCount.value = data.totalCount;
  } catch (error) {
    violations.value = [];
    showErrorMessage(error, i18n.global.t('governance.compliance.policies.edit.errorGetViolations'));
  } finally {
    isLoadingViolations.value = false;
  }
}

/**
 * View the violation details
 * @param {Object} violation - The violation to view details
 */
function viewViolationDetails(violation) {
  router.push({
    name: 'Violation',
    params: {
      violationId: violation.id,
      itemType: 'violation',
    },
  });
}

/**
 * Revoke the violation
 * @param {Object} violation - The violation to revoke
 */
function revokeViolation(violation) {
  router.push({
    name: 'ViolationRemediate',
    params: { violationId: violation.id },
  });
}
</script>
