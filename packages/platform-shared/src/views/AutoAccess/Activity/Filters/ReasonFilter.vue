<!-- Copyright (c) 2022-2023 ForgeRock. All rights reserved.

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
    /**
     * Formats a list of options used in a multiselect filter
     *
     * @returns {Array} filter options
     */
    reasonOptions() {
      const defaultOptions = [
        'is_advanced_bot_detection',
        'is_automated_user_agent',
        'is_brute_force',
        'is_credential_stuffing',
        'is_distributed_attack',
        'is_impossible_travel',
        'is_ip_blocked',
        'is_suspicious_ip',
      ];
      const uebaList = store.state.Dashboard.uebaClusteringReasons.map((reason) => (
        {
          text: `Unusual ${causeMap[reason]}`,
          value: reason,
        }
      ));
      const uebaOptions = [];
      uebaList.forEach((item) => {
        if (!uebaOptions.some((option) => option.text === item.text)) {
          const list = [];
          uebaList.forEach((reason) => {
            if (reason.text === item.text) {
              list.push(reason.value);
            }
          });
          uebaOptions.push({
            text: item.text,
            value: list,
          });
        }
      });
      return [
        ...defaultOptions.map((heuristic) => ({ text: this.$t(`autoAccess.access.reasons["${heuristic}"]`), value: [heuristic] })),
        ...uebaOptions,
      ];
    },
  },
};
</script>
