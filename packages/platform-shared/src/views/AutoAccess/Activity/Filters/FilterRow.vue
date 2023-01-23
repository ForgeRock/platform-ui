<!-- Copyright (c) 2022-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="d-flex flex-row justify-content-between mb-3 activity-filter-row">
    <div
      style="flex: 1 1 50%;"
      class="mr-2">
      <FrField
        :field="featureField"
        @valueChange="(key) => updateFeature(key)"
      />
    </div>
    <div
      style="flex: 1 1 50%;"
      class="ml-2"
    >
      <ValueSelect
        :feature="featureField.value"
        :value="filter.value"
        @update="(val) => $emit('update', val)"
      />
    </div>
    <BButton
      variant="link"
      class="close ml-4"
      @click="$emit('remove')"
    >
      <span class="material-icons-outlined">
        remove
      </span>
    </BButton>
  </div>
</template>
<script>
import { BButton } from 'bootstrap-vue';
import FrField from '../../Shared/Field';
import store from '@/store';
import ValueSelect from './ValueSelect';

export default {
  name: 'Filters',
  components: {
    BButton,
    FrField,
    ValueSelect,
  },
  props: {
    filter: {
      default: () => ({}),
      type: Object,
    },
  },
  data() {
    return {
      featureField: {
        type: 'select',
        title: 'Feature',
        value: this.filter.key,
        allowEmpty: true,
        options: this.getFeatureOptions(),
      },
    };
  },
  methods: {
    getFeatureOptions() {
      return store.state.Dashboard.features
        .sort((a, b) => this.$t(`autoAccess.access.filters["${a.key}"]`).localeCompare(this.$t(`autoAccess.access.filters["${b.key}"]`))).map((item) => (
          {
            value: item.key,
            text: this.$t(`autoAccess.access.filters["${item.key}"]`),
          }
        ));
    },
    updateFeature(key) {
      this.$emit('update', { ...this.filter, key, value: [] });
    },
  },
};
</script>
