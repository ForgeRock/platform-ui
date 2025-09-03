<!-- Copyright (c) 2024-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <ViolationEdit
    :breadcrumb-path="'/violations'"
    :breadcrumb-title="$t('governance.violations.tabs.violations')"
    :is-enduser-exception="itemType === 'exception'"
    @revoke-violation="revokeViolation" />
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
import ViolationEdit from '@forgerock/platform-shared/src/components/governance/Violations/ViolationEdit/ViolationEdit';

// composables
const route = useRoute();
const router = useRouter();

const { itemType } = route.params;

/**
 * Revoke the violation
 * @param {Object} violation - The violation to revoke
 */
function revokeViolation(violation) {
  router.push({
    name: 'ViolationEditRemediate',
    params: { itemType: 'violation', violationId: violation.id },
  });
}
</script>
