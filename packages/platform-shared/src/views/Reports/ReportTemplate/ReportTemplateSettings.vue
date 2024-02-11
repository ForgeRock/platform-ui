<!-- Copyright 2023-2024 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->

<template>
  <BCard
    body-class="p-0"
    class="fr-create-report-settings h-100 p-4 overflow-auto">
    <BCardTitle
      class="h5 mb-3"
      title-tag="h2">
      {{ $t('common.settings') }}
    </BCardTitle>
    <BTabs
      v-model="tabIndex"
      content-class="mt-3"
      nav-class="fr-tabs mb-4">
      <BTab
        v-for="(tab, index) in tabItems"
        :active="tabIndex === index"
        :key="index"
        :title="tab.tabLabel">
        <div v-if="tabItems[index].id === 'dataTab'">
          Data content
        </div>
        <div v-if="tabItems[index].id === 'detailsTab'">
          Details content
        </div>
      </BTab>
    </BTabs>
  </BCard>
</template>

<script setup>
/**
 * @description
 * Create report settings panel with data and details tabs for creating custom analytics reports.
 */
import {
  BCard,
  BCardTitle,
  BTab,
  BTabs,
} from 'bootstrap-vue';
import { ref } from 'vue';
import i18n from '@/i18n';

const tabIndex = ref(0);
const tabItems = [
  {
    id: 'dataTab',
    tabLabel: i18n.global.t('common.data'),
  },
  {
    id: 'detailsTab',
    tabLabel: i18n.global.t('common.details'),
  },
];
</script>

<style lang="scss" scoped>
.fr-create-report-settings {
  min-width: 320px;
}
</style>
