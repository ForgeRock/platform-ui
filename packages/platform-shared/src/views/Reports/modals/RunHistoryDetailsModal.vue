<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    v-model="showModal"
    data-testid="run-history-details-modal"
    ok-only
    ok-variant="outline-primary"
    size="lg"
    :ok-title="$t('common.close')"
    :static="isTesting"
    :title="$t('reports.tabs.runHistory.table.runDetails')">
    <BContainer class="p-0 text-dark">
      <BRow no-gutters>
        <BCol md="12">
          <BListGroup horizontal>
            <BListGroupItem class="border-0 pt-0 pl-0 pr-5">
              <small class="text-muted">
                {{ $t('common.started') }}
              </small>
              <div data-testid="fr-run-history-summary-modal-date">
                {{ dayjs(tableItem.date).format('MM/DD/YYYY h:mm A') }}
              </div>
            </BListGroupItem>
            <BListGroupItem class="border-0 pt-0">
              <div>
                <small class="text-muted">
                  {{ $t('common.status') }}
                </small>
              </div>
              <FrRunReportBadges :report-status="tableItem.reportStatus" />
            </BListGroupItem>
          </BListGroup>
          <FrReportDetails :parameters="props.parameters" />
        </BCol>
      </BRow>
    </BContainer>
  </BModal>
</template>

<script setup>
/**
 * @description
 * Matches the incoming parameters with the list of all fields
 * and constructs a dataset for displaying the original run
 * details that the user input to generate a report.
 */
import { computed } from 'vue';
import {
  BCol,
  BContainer,
  BListGroup,
  BListGroupItem,
  BModal,
  BRow,
} from 'bootstrap-vue';
import dayjs from 'dayjs';
import FrRunReportBadges from '../RunReportBadges';
import FrReportDetails from '../ReportDetails';

const props = defineProps({
  isTesting: {
    type: Boolean,
    default: false,
  },
  parameters: {
    type: Object,
    default: () => ({}),
  },
  show: {
    type: Boolean,
    default: false,
  },
  tableItem: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['modal-toggle']);

const showModal = computed({
  get() {
    return props.show;
  },
  set(newValue) {
    emit('modal-toggle', newValue);
  },
});
</script>
