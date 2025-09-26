<!-- Copyright (c) 2023-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <BSkeletonTable
      v-if="loading"
      class="skeleton-table"
      data-testid="skeleton-table"
      :columns="4"
      :rows="10"
      :table-props="{ responsive: true }"
    />
    <div
      v-else-if="props.isEmpty"
      class="pt-4 w-100 d-flex justify-content-center">
      <FrNoData
        icon-classes="d-none"
        testid="no-table-data"
        :card="false"
        :subtitle="$t('reports.noReportData')"
      />
    </div>
    <div
      v-else
      :class="[{'d-none': loading}, 'table-responsive']"
    >
      <BTable
        v-resizable-table="{ persistKey: 'report-view' }"
        data-testid="report-table"
        :empty-text="$t('reports.noReportData')"
        :fixed="false"
        :no-local-sorting="true"
        v-bind="$attrs"
        @sort-changed="$emit('sort-changed', $event)"
      >
        <template #cell(user)="data">
          <p class="text-dark m-0">
            {{ data.item.userName }}
          </p>
          <p class="text-muted m-0">
            <small>
              {{ $t('common.userFullName', { givenName: data.item.firstName, sn: data.item.lastName }) }}
            </small>
          </p>
        </template>
        <template #cell(exception)="data">
          <div class="cell-exception">
            {{ data.value }}
          </div>
        </template>
        <template #cell()="data">
          <div
            v-if="(Array.isArray(data.value))"
            class="d-flex flex-wrap">
            <BCard
              v-for="(element, index) in data.value"
              body-class="pb-0 px-3 pt-3"
              class="col-md-6"
              :key="index">
              <p
                v-for="item in Object.keys(element)"
                class="m-0 pb-3"
                :key="item">
                <small class="text-muted">
                  {{ item }}
                </small>
                <br>
                <span v-if="item === 'node_event_time'">
                  {{ dayjs(element[item]).format('MM/D/YYYY h:mm A') }}
                </span>
                <span v-else>
                  {{ (element[item]) }}
                </span>
              </p>
            </BCard>
          </div>
          <template v-else>
            {{ data.value }}
          </template>
        </template>
      </BTable>
    </div>
  </div>
</template>

<script setup>
import {
  BCard,
  BTable,
  BSkeletonTable,
} from 'bootstrap-vue';
import dayjs from 'dayjs';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';

const props = defineProps({
  isEmpty: {
    type: Boolean,
    default: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});
</script>

<style lang="scss" scoped>
  .th-exception {
    width: 600px;
  }
  table {
    table-layout: auto !important;
  }
  .cell-exception {
    font-family: monospace;
    font-size: 0.75rem;
    max-height: 300px;
    overflow: scroll;
    width: 800px;
  }
  .skeleton-table {
    td {
      padding: 1.25rem 1.5rem;
    }
  }
</style>
