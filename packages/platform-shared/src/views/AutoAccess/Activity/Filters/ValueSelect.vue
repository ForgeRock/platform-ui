<!-- Copyright (c) 2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrField
    :field="field"
    :loading="loading"
    @search-change="value => updateValueSearchTerm(value)"
    @valueChange="value => handleValueChange(value)"
  />
</template>
<script>
import FrField from '../../Shared/Field';
import store from '@/store';
import { getAvailableFilters } from '../api/ActivityAPI';

export default {
  name: 'Filters',
  components: {
    FrField,
  },
  props: {
    value: {
      type: Array,
      default: () => [],
    },
    feature: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      valueSearchTerm: '',
      loading: false,
      field: {
        type: 'multiselect',
        value: this.value,
        title: 'Value',
        allowEmpty: true,
        options: this.value,
      },
    };
  },
  mounted() {
    this.setValueOptions();
  },
  watch: {
    valueSearchTerm() {
      this.setValueOptions();
    },
    feature: {
      handler() {
        this.field.value = [];
        this.setValueOptions();
      },
    },
  },
  methods: {
    setValueOptions() {
      const { feature } = this;
      const searchTerm = this.valueSearchTerm;
      if (feature) {
        const featureItem = store.state.Dashboard.features.find((f) => f.key === feature);
        if (featureItem.cached) {
          this.field.options = featureItem.values;
        } else {
          this.loading = true;
          getAvailableFilters(feature, searchTerm)
            .then((res) => {
              if (res.length === 0 && this.field.options.length === 0) return;

              this.field.options = res;
              this.loading = false;
            });
        }
      } else {
        this.field.options = [];
      }
    },
    updateValueSearchTerm(searchTerm) {
      this.valueSearchTerm = searchTerm;
    },
    handleValueChange(value) {
      if (value.findIndex((v) => !v) === -1) {
        this.$emit('update', { key: this.feature, value });
      } else {
        // Vue-multiselect sets predefined values to undefined;
        // reset to defined values
        this.field.value = this.value;
        this.field.options = this.value.map((val) => ({ text: val, value: val }));
      }
    },
  },
};
</script>
