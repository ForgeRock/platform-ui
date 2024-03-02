<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrVisualizationCard :title="title">
    <template #chart>
      <BRow>
        <template>
          <FrDonutChart
            class="userchart"
            :chart-data="userData"
            :is-loading="isUserDataLoading"
            :should-compare="shouldCompare"
            :title="title"
            :chart-id="`${feature}-userchart`">
            <template
              #chartTitle
              v-if="shouldCompare">
              <div>
                <BImg
                  class="d-block mb-2 mx-auto"
                  width="48"
                  :src="userInfo.profileImage ? userInfo.profileImage : require('@forgerock/platform-shared/src/assets/images/avatar.png')" />
                <h5>{{ chartName }}</h5>
              </div>
            </template>
          </FrDonutChart>
        </template>
        <template v-if="shouldCompare">
          <FrDonutChart
            class="tenantchart"
            :chart-data="tenantData"
            :is-loading="isTenantDataLoading"
            :should-compare="shouldCompare"
            :title="title"
            :chart-id="`${feature}-tenantchart`">
            <template #chartTitle>
              <div class="chartName">
                <div
                  class="rounded-circle d-flex align-items-center justify-content-center mb-2 bg-lightyellow text-warning"
                  style="width: 48px; height: 48px;">
                  <FrIcon
                    icon-class="md-24"
                    name="cloud" />
                </div>
                <div>
                  <h5 class="mb-0">
                    {{ $t('common.tenant') }}
                  </h5>
                </div>
              </div>
            </template>
          </FrDonutChart>
        </template>
      </BRow>
    </template>
  </FrVisualizationCard>
</template>

<script setup>
import { computed } from 'vue';
import FrVisualizationCard from '@forgerock/platform-shared/src/components/Visualization/VisualizationCard';
import {
  BRow, BImg,
} from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrDonutChart from './DonutChart';

const props = defineProps({
  tenantData: {
    type: Array,
    default: () => ([]),
  },
  userInfo: {
    type: Object,
    default: () => ({}),
  },
  userData: {
    type: Array,
    default: () => ([]),
  },
  isUserDataLoading: {
    type: Boolean,
    default: false,
  },
  isTenantDataLoading: {
    type: Boolean,
    default: false,
  },
  feature: {
    type: String,
    default: '',
  },
  shouldCompare: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
});

/**
 * Create a chart name from the user's username if we are comparing against the tenant
 *
 * @return {string} Username or empty string
 */
const chartName = computed(() => (props.shouldCompare ? props.userInfo.userName : ''));

</script>
