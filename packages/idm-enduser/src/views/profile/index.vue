<!-- Copyright 2025 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <FrProfileContainer :theme="props.theme">
    <template #settings>
      <BCol>
        <FrAccountControls class="mb-5" />
      </BCol>
    </template>
  </FrProfileContainer>
</template>

<script setup>

import { BCol } from 'bootstrap-vue';
import FrProfileContainer from '@forgerock/platform-shared/src/components/profile/ProfileContainer';
import FrAccountControls from '@forgerock/platform-shared/src/components/profile/AccountControls';
import { defineProps } from 'vue';

/**
 * @description Controlling component for profile management
 *
 * @fires PATCH type/name/id (e.g. managed/user/_id) - Submits a patch object of changes for the provided resource record
 */

const props = defineProps({
  theme: {
    type: Object,
    default: () => ({}),
  },
});
</script>
