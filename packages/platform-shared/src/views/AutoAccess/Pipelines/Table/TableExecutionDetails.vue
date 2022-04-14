<!-- Copyright (c) 2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <FrTable
      :fields="fields"
      :items="rows"
      fixed
      :class="`border pipelines-table-execution-details ${showPipelineName ? &quot;has-name-col&quot; : &quot;&quot;}`"
      v-if="pipeline_executions.length > 0"
    >
      <template #cell(status)="data">
        <TableExecutionStatusBadge
          :execution="data.item"
          :loading="pendingStatus.indexOf(data.item.execution_id) > -1"
        />
      </template>
      <template #cell(start_time)="data">
        <RelativeTime
          :timestamp="fromUnix(data.item.start_time)"
          :include-ago="true"
          :max-seconds="604800"
          :include-absolute="true"
        />
      </template>
      <template #cell(end_time)="data">
        <RelativeTime
          :timestamp="fromUnix(data.item.end_time)"
          v-if="data.item.end_time"
          :include-ago="true"
          :max-seconds="604800"
          :include-absolute="true"
        />
      </template>
    </FrTable>
    <div v-else>
      No existing runs
    </div>
    <div>table exec</div>
  </div>
</template>
<script>
import dayjs from 'dayjs';
import { BButton } from 'bootstrap-vue';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';
import FrTable from '../../Shared/DataTable';
import TableExecutionStatusBadge from './TableExecutionStatusBadge';
import RelativeTime from '../../Shared/RelativeTime';
import { getLatestExecution } from '../api/PipelineApi';

export default {
  name: 'TableExecutionDetails',
  components: {
    FrSpinner,
    FrTable,
    TableExecutionStatusBadge,
    RelativeTime,
    BButton,
  },
  props: {
    pipelineExecutions: {
      type: Array,
      required: true,
    },
    pendingStatus: {
      type: Array,
      required: true,
    },
    showPipelineName: {
      type: Boolean,
      default: false,
    },
    isTraining: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    fields() {
      return [
        (this.showPipelineName
          ? {
            key: 'pipeline_name',
            label: 'Pipeline',
          }
          : null
        ),
        {
          key: 'start_time',
          label: 'Started',
        },
        {
          key: 'end_time',
          label: 'Completed',
        },
        {
          key: 'status',
          label: 'Status',
        },
        {
          key: 'dropdown',
          label: '',
        },
      ].filter((field) => !!field);
    },
    rows() {
      return this.pipeline_executions.map((execution) => ({
        ...execution,
        dropdown: [
          (this.isTraining && execution.status === 'SUCCEEDED'
            ? {
              action: () => {
                this.$emit('evaluate', execution);
              },
              text: 'View Results',
              icon: 'insights',
            }
            : null
          ),
          {
            action: () => {
              this.$emit('viewLogs');
            },
            text: 'View Logs',
            icon: 'receipt',
          },
          {
            action: () => {
              window.open(
                this.getGCPURL(execution.execution_id),
                '_blank',
              );
            },
            text: 'View on GCP',
            icon: 'link',
          },
          {
            action: () => {
              this.$emit('refresh', execution.execution_id);
            },
            text: 'Refresh',
            icon: 'refresh',
          },
        ].filter((field) => !!field),
      }));
    },
  },
  methods: {
    getGCPURL(execution_id) {
      try {
        const location = execution_id.split('/locations/')[1].split('/')[0];
        const workflow = execution_id.split('/workflows/')[1].split('/')[0];
        const execution = execution_id.split('/executions/')[1].split('/')[0];
        return `https://console.cloud.google.com/workflows/workflow/${location}/${workflow}/execution/${execution}`;
      } catch {
        return '';
      }
    },
    fromUnix(seconds) {
      if (!seconds) return '';

      return dayjs.unix(seconds).format();
    },
    formatUnixTime(seconds) {
      if (!seconds) return '';

      return dayjs.unix(seconds).format('MMMM D, YYYY h:mm A');
    },
  },
};
</script>
<style lang="scss">
  .pipelines-table-execution-details {
    .table-responsive {
      overflow: visible;
    }

    td,
    th {
      padding-right: 0;

      &:nth-last-child(2) {
        width: 160px;
      }

      &:last-child {
        width: 100px;
      }
    }
  }
</style>
