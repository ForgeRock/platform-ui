<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BCol
    sm="12"
    :lg="shouldCompare ? 6 : 12"
    class="mb-sm-5"
  >
    <BRow>
      <BCol :lg="shouldCompare ? 12 : 4">
        <!-- Chart Skeleton -->
        <template v-if="isLoading">
          <div class="d-flex justify-content-center position-relative mb-5">
            <BSkeleton
              type="avatar"
              class="fr-skeleton-donutchart"
              animation="fade"
              width="220px"
              height="220px" />
            <div class="position-absolute w-100 h-100 d-flex flex-column justify-content-center align-items-center mb-0">
              <BSkeleton
                type="avatar"
                class="mb-2"
                animation="fade"
                width="48px"
                height="48px" />
              <BSkeleton
                width="90px"
                animation="fade" />
            </div>
          </div>
        </template>
        <template v-if="!isLoading">
          <div class="position-relative">
            <div class="chartName">
              <slot name="chartTitle" />
            </div>
            <FrPieChart
              class="mb-5"
              :data="chartData"
              :height="220"
              :id="chartId"
              :radius="90"
              :stroke-width="0"
              :width="220" />
          </div>
        </template>
      </BCol>
      <BCol :lg="shouldCompare ? 12 : 8">
        <template v-if="isLoading">
          <BSkeletonTable
            class="skeleton-table"
            responsive
            :rows="5"
            :columns="3"
            :table-props="{ 'thead-class': 'd-none' }" />
        </template>
        <template v-if="!isLoading">
          <BTable
            v-if="!isLoading"
            :fields="fields"
            :items="items"
            class="border-bottom mb-0"
            responsive
            thead-class="d-none">
            <template #cell(key)="data">
              <div class="d-flex align-items-start text-nowrap">
                <div
                  :class="['rounded-pill mr-3 mt-2', `bg-${data.item.colorReadable}`]"
                />
                <div>
                  <div>{{ data.value }}</div>
                </div>
              </div>
            </template>
          </BTable>
        </template>
      </BCol>
    </BRow>
  </BCol>
</template>

<script setup>
import {
  BCol, BRow, BSkeleton, BSkeletonTable, BTable,
} from 'bootstrap-vue';
import { computed } from 'vue';
import FrPieChart from './PieChart';

const prop = defineProps({
  chartData: {
    type: Array,
    default: () => ([]),
  },
  chartId: {
    type: String,
    default: 'donutchart',
  },
  isLoading: {
    type: Boolean,
    default: true,
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

const fields = [
  {
    key: 'key',
    class: 'text-truncate py-3',
  },
  {
    key: 'count',
    class: 'text-right py-3 w-25',
  },
];

/**
 * Data to be used as items in the BTable component
 *
 * @return {array} Array of behavior data formatted to be shown in a BTable
 */
const items = computed(() => prop.chartData.map((item) => ({ key: item.label, count: item.valueFormatted, colorReadable: item.colorReadable })));

</script>

<style lang="scss" scoped>
.fr-skeleton-donutchart {
  &:after {
    content: "";
    width: 188px;
    height: 188px;
    position: absolute;
    top: 16px;
    left: 16px;
    background-color: $card-bg;
    border-radius: 188px;
  }
}

.chartName {
  left: 50%;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
}

.rounded-pill {
  height: 10px;
  width: 24px;
}

.skeleton-table {
  thead {
    display: none;
  }

  td:first-child {
    padding-right: 0;
    width: 10%;
    .b-skeleton {
      width: 100% !important;
    }
  }

  td:last-child {
    .b-skeleton {
      float: right;
      width: 25% !important;
    }
  }
}

.table-responsive {
  margin-bottom: 0;
}
</style>
