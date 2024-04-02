<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer class="d-flex justify-content-center align-self-start">
    <BCard class="fr-add-data-source-card text-center my-5 py-4">
      <FrIcon
        icon-class="opacity-20 md-96 mb-3"
        name="source" />
      <FrSpinner
        v-if="isLoading"
        class="py-2" />
      <template v-else>
        <BCardTitle
          class="h4 mb-2"
          title-tag="h2">
          {{ $t('reports.template.addData') }}
        </BCardTitle>
        <BCardText class="mb-4">
          {{ $t('reports.template.addDataSourceToGetStarted') }}
        </BCardText>
        <BButton
          variant="primary"
          @click="$emit('open-data-source-modal')">
          <FrIcon
            icon-class="mr-2"
            name="add">
            {{ $t('reports.template.dataSource') }}
          </FrIcon>
        </BButton>
      </template>
    </BCard>
  </BContainer>
</template>

<script setup>
/**
 * @description
 * Empty state card for a custom analytics report which triggers a modal for adding a template data source.
 */
import {
  BButton,
  BCard,
  BCardTitle,
  BCardText,
  BContainer,
} from 'bootstrap-vue';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';

defineEmits(['open-data-source-modal']);
defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
});
</script>

<style lang="scss" scoped>
.fr-add-data-source-card {
  width: 500px;
}
</style>
