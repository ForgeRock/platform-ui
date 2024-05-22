<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <ViolationEdit
    :breadcrumb-path="'/violations'"
    :breadcrumb-title="$t('governance.violations.tabs.violations')"
    :is-enduser-exception="itemType === 'exception'" />
</template>

<script setup>
import { useRoute } from 'vue-router';
import ViolationEdit from '@forgerock/platform-shared/src/components/governance/Violations/ViolationEdit/ViolationEdit';

// composables
const route = useRoute();

const { itemType } = route.params;
</script>
