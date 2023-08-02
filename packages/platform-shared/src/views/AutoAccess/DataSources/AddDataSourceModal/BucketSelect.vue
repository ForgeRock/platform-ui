<!-- Copyright (c) 2022-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrField
    label="Bucket Search"
    :field="field"
    type="multiselect"
    @search-change="handleSearch"
  >
    <template #option="{ option }">
      {{ option.text }}
    </template>
    <template #singleLabel="{ option }">
      {{ option.text }}
    </template>
  </FrField>
</template>
<script>
import FrField from '../../Shared/Field';
import { searchBuckets } from '../api/DataSourcesAPI';

export default {
  name: 'BucketSelect',
  components: {
    FrField,
  },
  data() {
    return {
      searchTerm: '',
      field: {
        type: 'select',
        key: 'bucket-search',
        title: 'Bucket Search',
        options: [],
        value: '',
      },
    };
  },
  watch: {
    searchTerm: {
      handler() {
        this.getBucketData();
      },
    },
    field: {
      deep: true,
      handler(val) {
        this.$emit('select', val.value);
      },
    },
  },
  methods: {
    getBucketData() {
      searchBuckets(this.searchTerm, 10)
        .then((result) => {
          this.field.options = result.buckets.map((b) => b.name);
        });
    },
    handleSearch(value) {
      this.searchTerm = value;
    },
  },
};
</script>
