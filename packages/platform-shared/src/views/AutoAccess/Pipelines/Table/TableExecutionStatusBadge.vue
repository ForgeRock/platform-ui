<!-- Copyright (c) 2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div
    v-if="loading"
    style="max-width: 70px;"
  >
    <FrSpinner size="xs" />
  </div>
  <BBadge
    pill
    v-else
    :variant="execution.status === 'ACTIVE' ? 'warning'
      : execution.status === 'FAILED' || execution.status === 'CANCELLED' ? 'danger'
        : execution.status === 'SUCCEEDED' ? 'success'
          : 'light' "
  >
    <span class="text-capitalize">
      {{ getStatusLabel(execution.status) }}
    </span>
  </BBadge>
</template>
<script>
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';
import { BBadge } from 'bootstrap-vue';

export default {
  name: 'TableExecutionStatusBadge',
  components: {
    FrSpinner,
    BBadge,
  },
  props: {
    execution: {
      default: () => {},
      require: true,
      type: Object,
    },
    loading: {
      type: Boolean,
    },
  },
  methods: {
    getStatusLabel(status) {
      switch (status) {
        case 'ACTIVE':
          return 'Running';
        case 'FAILED':
          return 'Failed';
        case 'SUCCEEDED':
          return 'Succeeded';
        case 'CANCELLED':
          return 'Canceled';
        default:
          return 'Not Started';
      }
    },
  },
};
</script>
