<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer class="mt-5">
    <BRow>
      <BCol style="margin-bottom: 60px;">
        <FrNormalViewHeader
          :is-loading="false"
          :title="tenantName"
          :toptitle="$t('autoAccess.access.normalView.userBehaviorHeader')"
        />
      </BCol>
    </BRow>
    <BRow>
      <BCol class="mb-4">
        <FrNormalViewToolbar
          :filters="activeFeatures"
          :has-compare="false"
          :is-loading="isTenantDataLoading"
          @updateSelectedFeatures="updateSelectedFeatures"
        />
      </BCol>
    </BRow>
    <BRow>
      <!-- Component placeholders for showing the loading state on the page -->
      <BCol v-if="isTenantDataLoading">
        <template
          v-for="i in 5"
          :key="i">
          <FrDonutChartCard
            class="mb-4"
            :is-user-data-loading="true"
          />
        </template>
      </BCol>
      <!-- Actual component used for showing the data -->
      <BCol v-if="!isTenantDataLoading">
        <template
          v-for="(feature) in selectedFeatures"
          :key="feature.text">
          <FrDonutChartCard
            :is-tenant-data-loading="isTenantDataLoading"
            :tenant-data="tenantData[feature.text]"
            :user-data="tenantData[feature.text]"
            :feature="feature.text"
            :title="feature.title"
            class="mb-4"
          />
        </template>
      </BCol>
    </BRow>
  </BContainer>
</template>

<script setup>
import {
  computed, onMounted, ref, watch,
} from 'vue';
import {
  BContainer, BCol, BRow,
} from 'bootstrap-vue';
import { getAutoAccessReportResult } from '@forgerock/platform-shared/src/api/AutoApi';
import dayjs from 'dayjs';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import FrNormalViewHeader from './NormalViewHeader';
import FrNormalViewToolbar from './NormalViewToolbar';
import FrDonutChartCard from './DonutChartCard';
import { causeMap } from '../api/ActivityAPI';
import store from '@/store';
import parseApiData from './utils/parseApiData';
import i18n from '@/i18n';

const activeFeatures = ref([]);
const isTenantDataLoading = ref(false);
const tenantData = ref([]);
const endDate = dayjs().utc();
const startDate = endDate.subtract(6, 'month');
const tenantName = store.state.tenant.split('.')[0];

/**
 * Collects a list of features that are set to show
 *
 * @param {array} Array of features
 */
const selectedFeatures = computed(() => activeFeatures.value.filter((filter) => filter.show));

/**
 * Gets user or tenant behavior data
 *
 * @return {object}
 */
async function getData(isUser, loadingState) {
  loadingState.value = true;
  try {
    const response = await getAutoAccessReportResult('', [startDate.format(), endDate.format()], 'User-Normal-View', 5, isUser, !isUser);
    const parsedResponse = parseApiData(response);
    loadingState.value = false;
    return parsedResponse;
  } catch (e) {
    showErrorMessage(e, i18n.global.t('autoAccess.access.normalView.retrievingDataError'));
  }
  return {};
}

/**
 * Updates the active view options list
 *
 * @param {array} value Value of filters that were checked
 */
function updateSelectedFeatures(value) {
  activeFeatures.value = value;
}

onMounted(async () => {
  tenantData.value = await getData(false, isTenantDataLoading);
});

/**
 * When the tenantData changes we need to get the feature names from the data
 */
watch(tenantData, (newVal) => {
  activeFeatures.value = Object.keys(newVal).map((feature) => ({ text: feature, title: causeMap[feature], show: true }));
});
</script>
