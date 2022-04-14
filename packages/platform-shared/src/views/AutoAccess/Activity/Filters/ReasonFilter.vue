<!-- Copyright (c) 2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrField
    :field="field"
    @valueChange="(value) => $emit('update', value)"
    open-direction="above"
  />
</template>
<script>
import _ from 'lodash';
import FrField from '../../Shared/Field';
import store from '@/store';
import { causeMap } from '../api/ActivityAPI';

export default {
  name: 'ReasonFilter',
  components: {
    FrField,
  },
  props: {
    selected: {
      type: Array,
    },
  },
  computed: {
    field() {
      return {
        type: 'multiselect',
        title: 'Reason',
        options: _.concat(['is_automated_user_agent', 'is_brute_force', 'is_credential_stuffing', 'is_impossible_travel', 'is_suspicious_ip'].map((heuristic) => (
          {
            text: this.$t(`autoAccess.access.heuristics["${heuristic}"]`),
            value: heuristic,
          }
        )), store.state.Dashboard.uebaClusteringReasons.map((reason) => (
          {
            text: `Unusual ${causeMap[reason]}`,
            value: reason,
          }
        ))),
        allowEmpty: true,
        value: this.selected,
      };
    },
  },
};
</script>
