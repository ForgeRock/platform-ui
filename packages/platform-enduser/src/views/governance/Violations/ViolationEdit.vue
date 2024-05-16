<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <ViolationEdit
    :breadcrumb-path="'/violations'"
    :breadcrumb-title="$t('governance.violations.tabs.violations')" />
</template>

<script setup>
import ViolationEdit from '@forgerock/platform-shared/src/components/governance/Violations/ViolationEdit/ViolationEdit';
</script>
