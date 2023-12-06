<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BSkeletonTable
    v-if="props.loading"
    :columns="4"
    :rows="4"
    :table-props="{ responsive: true }"
  />
  <div
    v-else-if="props.isEmpty"
    class="w-100 d-flex justify-content-center">
    <FrNoData
      icon-classes="d-none"
      testid="no-table-data"
      :card="false"
      :subtitle="$t('reports.noReportData')"
    />
  </div>
  <BTable
    v-else
    :data-testid="testid"
    responsive
    :empty-text="$t('reports.noReportData')"
    :fields="props.fields"
    :items="props.items"
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
              {{ startCase(item) }}
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
</template>

<script setup>
import {
  BCard,
  BTable,
  BSkeletonTable,
} from 'bootstrap-vue';
import dayjs from 'dayjs';
import { startCase } from 'lodash';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';

const props = defineProps({
  fields: {
    type: Array,
    default: () => [],
  },
  items: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  isEmpty: {
    type: Boolean,
    default: false,
  },
  testid: {
    type: String,
    default: '',
  },
});
</script>
