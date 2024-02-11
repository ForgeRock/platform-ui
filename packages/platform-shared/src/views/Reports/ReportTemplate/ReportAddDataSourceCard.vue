<!-- Copyright 2023-2024 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->

<template>
  <BContainer class="d-flex justify-content-center align-self-start">
    <BCard class="fr-add-data-source-card text-center my-5 py-4">
      <FrIcon
        class="opacity-20 md-96 mb-3"
        name="source" />
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
          class="mr-2"
          name="add" />
        {{ $t('reports.template.dataSource') }}
      </BButton>
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
import FrIcon from '@forgerock/platform-shared/src/components/Icon';

defineEmits(['open-data-source-modal']);
</script>

<style lang="scss" scoped>
.fr-add-data-source-card {
  width: 500px;
}
</style>
