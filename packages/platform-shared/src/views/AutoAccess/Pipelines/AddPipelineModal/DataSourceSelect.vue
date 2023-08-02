<!-- Copyright (c) 2022-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="data-source-select">
    <FrField
      :field="dataSourceField"
      @valueChange="(value) => selectDataSource(value)"
      @search-change="value => updateSearch(value)"
    >
      <template #option="{ option }">
        {{ option.text }}
      </template>
      <template #singleLabel="{ option }">
        {{ option.text }}
      </template>
    </FrField>
  </div>
</template>
<script>
import FrField from '../../Shared/Field';
import { getDataSources } from '../../DataSources/api/DataSourcesAPI';

export default {
  name: 'DataSourceSelect',
  components: {
    FrField,
  },
  props: {
    datasourceId: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      options: [],
      searchTerm: '',
    };
  },
  computed: {
    dataSourceField() {
      return {
        type: 'select',
        value: this.datasourceId,
        options: this.options.map((ds) => (
          {
            text: ds.name,
            value: ds.datasource_id,
          }
        )),
        title: 'Data Source',
      };
    },
  },
  watch: {
    searchTerm: {
      immediate: true,
      handler() {
        this.setOptions();
      },
    },
  },
  methods: {
    updateSearch(val) {
      this.searchTerm = val;
    },
    setOptions() {
      getDataSources({}, this.searchTerm, [], true).then((result) => {
        this.options = result.items;
      });
    },
    selectDataSource(val) {
      this.$emit('value-change', val);
    },
  },
};
</script>

<style lang="scss">
</style>
