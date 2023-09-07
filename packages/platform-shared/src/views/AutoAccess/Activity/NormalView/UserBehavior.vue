<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer class="mt-5">
    <BRow>
      <BCol style="margin-bottom: 60px;">
        <FrNormalViewHeader
          :is-loading="isUserInfoLoading"
          :profile-image="userInfo.profileImage?.length ? userInfo.profileImage : require('@forgerock/platform-shared/src/assets/images/avatar.png')"
          :subtitle="`${userInfo.givenName} ${userInfo.sn}`"
          :title="userInfo.userName"
          :toptitle="$t('autoAccess.access.normalView.userNormalViewTitle')" />
      </BCol>
    </BRow>
    <BRow>
      <BCol class="mb-4">
        <FrNormalViewToolbar
          :filters="activeFeatures"
          :is-loading="isUserDataLoading"
          @compare="handleCompare"
          @updateSelectedFeatures="updateSelectedFeatures" />
      </BCol>
    </BRow>
    <BRow>
      <BCol v-if="isUserDataLoading">
        <template
          v-for="i in 5"
          :key="i">
          <FrDonutChartCard
            class="mb-4"
            :is-user-data-loading="true" />
        </template>
      </BCol>
      <br>
      <BCol v-if="!isUserDataLoading">
        <template
          v-for="(feature) in selectedFeatures"
          :key="feature.text">
          <FrDonutChartCard
            :is-tenant-data-loading="isTenantDataLoading"
            :is-user-data-loading="isUserDataLoading"
            :tenant-data="tenantData[feature.text]"
            :user-info="userInfo"
            :user-data="userData[feature.text]"
            :feature="feature.text"
            :should-compare="shouldCompare"
            :title="feature.title"
            class="mb-4" />
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
import { getManagedResourceList } from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import FrNormalViewHeader from './NormalViewHeader';
import FrNormalViewToolbar from './NormalViewToolbar';
import FrDonutChartCard from './DonutChartCard';
import { causeMap } from '../api/ActivityAPI';
import parseApiData from './utils/parseApiData';
import i18n from '@/i18n';
import store from '@/store';

const activeFeatures = ref([]);
const isUserDataLoading = ref(false);
const isUserInfoLoading = ref(false);
const isTenantDataLoading = ref(false);
const shouldCompare = ref(false);
const tenantData = ref({});
const userData = ref({});
const userInfo = ref({});
const endDate = dayjs().utc();
const startDate = endDate.subtract(6, 'month');
const userUserName = new URL(window.location.href).hash.split('/')[3];

/**
 * Gets the value of the compare checkbox, and if true, will trigger the loading and setting of tenant data
 *
 * @return {array} Array of filtered features used to show a user-selected set of behavoir features
 */
const selectedFeatures = computed(() => activeFeatures.value.filter((filter) => filter.show));

/**
 * Get's user info from the managed resource list
 *
 * @return {object}
 */
async function getUserInfo(userName) {
  isUserInfoLoading.value = true;
  const params = {
    pageSize: 1,
    fields: 'userName,givenName,sn,profileImage',
    queryFilter: `userName eq "${userName}"`,
  };
  try {
    const { realm } = store.state;
    const { data: { result: userResult } } = await getManagedResourceList(`${realm}_user`, params);
    if (userResult.length > 0 && userResult[0].userName === userName) {
      isUserInfoLoading.value = false;
      return userResult[0];
    }
    throw new Error();
  } catch (e) {
    showErrorMessage(e, i18n.global.t('autoAccess.access.normalView.userQueryNotFound'));
  }
  return {};
}

/**
 * Gets user or tenant behavior data
 *
 * @return {object}
 */
async function getData(isUser, loadingState) {
  loadingState.value = true;
  try {
    const response = await getAutoAccessReportResult(userUserName, [startDate.format(), endDate.format()], 'User-Normal-View', 5, isUser, !isUser);
    const parsedResponse = parseApiData(response);
    loadingState.value = false;
    return parsedResponse;
  } catch (e) {
    showErrorMessage(e, i18n.global.t('autoAccess.access.normalView.retrievingDataError'));
  }
  return {};
}

onMounted(async () => {
  userInfo.value = await getUserInfo(userUserName);
  userData.value = await getData(true, isUserDataLoading);
});

/**
 * Gets the value of the compare checkbox, and if true, will trigger the loading and setting of tenant data
 *
 * @param {boolean} value Boolean value returned from Compare checkbox component
 */
function handleCompare(value) {
  shouldCompare.value = value;
}

/**
 * Updates the active view options list
 *
 * @param {array<object>} value Array of active view options
 */
function updateSelectedFeatures(value) {
  activeFeatures.value = value;
}

/**
 * When the userData changes we need to get the feature names from the data
 */
watch(userData, (newVal) => {
  activeFeatures.value = Object.keys(newVal).map((feature) => ({ text: feature, title: causeMap[feature], show: true }));
});

/**
 * When we are comparing against the tenant we need to request the tenant data from the api if there is no data
 */
watch(shouldCompare, async (newVal) => {
  if (newVal && !Object.keys(tenantData.value).length) {
    tenantData.value = await getData(false, isTenantDataLoading);
  }
});

</script>
