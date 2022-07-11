<!-- Copyright (c) 2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <FrField
      :options="reasonOptions"
      label="Reason"
      type="multiselect"
      v-model="selected"
    />
  </div>
</template>
<script>
import FrField from '@forgerock/platform-shared/src/components/Field/';
import store from '@/store';
import { causeMap } from '../api/ActivityAPI';

export default {
  name: 'ReasonFilter',
  components: {
    FrField,
  },
  props: {
    value: {
      default: () => [],
      type: Array,
    },
  },
  computed: {
    selected: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('update', value);
      },
    },
    reasonOptions() {
      const defaultOptions = ['is_automated_user_agent', 'is_brute_force', 'is_credential_stuffing', 'is_impossible_travel', 'is_suspicious_ip'];
      const uebaOptions = store.state.Dashboard.uebaClusteringReasons.map((reason) => (
        {
          text: `Unusual ${causeMap[reason]}`,
          value: reason,
        }
      ));
      return [
        ...defaultOptions.map((heuristic) => ({ text: this.$t(`autoAccess.access.heuristics["${heuristic}"]`), value: heuristic })),
        ...uebaOptions,
      ];
    },
  },
};
</script>/script>
