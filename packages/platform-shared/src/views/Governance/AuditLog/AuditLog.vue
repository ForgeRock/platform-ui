<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer fluid>
    <div class="mt-5">
      <FrHeader
        :title="$t('governance.audit.title')"
        :subtitle="$t('governance.audit.subtitle')" />
      <FrAuditLogHistogram
        :from-date="histogramFromDate"
        :to-date="histogramToDate"
        :extra-params="histogramExtraParams"
        @bar-click="onBarClick" />
      <FrAuditLogTable
        :external-from-date="tableFromDate"
        :external-to-date="tableToDate"
        @filter-change="onFilterChange" />
    </div>
  </BContainer>
</template>

<script setup>
import { ref } from 'vue';
import { BContainer } from 'bootstrap-vue';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
import FrAuditLogHistogram from './AuditLogHistogram';
import FrAuditLogTable from './AuditLogTable';

const histogramFromDate = ref('');
const histogramToDate = ref('');
const histogramExtraParams = ref({});
const tableFromDate = ref('');
const tableToDate = ref('');

function onFilterChange({ fromDate, toDate, extraParams }) {
  histogramFromDate.value = fromDate;
  histogramToDate.value = toDate;
  histogramExtraParams.value = extraParams ?? {};
}

function onBarClick({ fromDate, toDate }) {
  tableFromDate.value = fromDate;
  tableToDate.value = toDate;
}
</script>
