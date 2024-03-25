<!-- Copyright (c) 2022-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrField
    @close="isSearching = false;"
    @input="$emit('input', $event); isSearching = false;"
    @search-change="debouncedSearch"
    class="w-100"
    :description="description"
    :internal-search="false"
    :label="label"
    :name="`resourceSelect_${_uid}`"
    open-direction="bottom"
    :options="selectOptions"
    :placeholder="searchText"
    :type="type"
    :value="value">
    <template
      v-for="(slotName, index) in ['singleLabel', 'option', 'tag']"
      :key="index"
      #[slotName]="{ option, remove }">
      <slot
        :name="slotName"
        :option="option"
        :remove="remove">
        {{ option.value[fields[0]] }}
      </slot>
    </template>
    <template #noResult>
      <slot name="noResult">
        {{ $t('common.noResultsFound') }}
      </slot>
    </template>
  </FrField>
</template>

<script>
import { debounce, isEqual } from 'lodash';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import ResourceMixin from '@forgerock/platform-shared/src/mixins/ResourceMixin';
import FrField from '@forgerock/platform-shared/src/components/Field';
import { getManagedResourceList } from '@forgerock/platform-shared/src/api/ManagedResourceApi';

export default {
  name: 'ResourceSelect',
  components: {
    FrField,
  },
  mixins: [
    NotificationMixin,
    ResourceMixin,
  ],
  props: {
    description: {
      type: String,
      default: null,
    },
    label: {
      type: String,
      default: null,
    },
    value: {
      type: Object,
      default: () => ({}),
    },
    resourcePath: {
      type: String,
      required: true,
    },
    fields: {
      type: Array,
      required: true,
    },
    type: {
      type: String,
      default: 'select',
    },
  },
  data() {
    return {
      debouncedSearch: debounce(this.search, 500),
      isSearching: false,
      options: [],
      showingInitialOptions: false,
      queryThreshold: 0,
    };
  },
  created() {
    this.getMinimumUIFilterLength(this.resourcePath).then((queryThreshold) => {
      this.queryThreshold = queryThreshold;
      this.getResourceList(this.type === 'select' && Object.keys(this.value).length === 0);
    });
  },
  computed: {
    searchText() {
      return this.queryThreshold > 1
        ? this.$t('common.placeholders.typeXCharactersToSearchFor', { numChars: this.queryThreshold, item: this.resourcePath })
        : this.$t('common.placeholders.typeToSearchFor', { item: this.resourcePath });
    },
    selectOptions() {
      const match = this.options.find((option) => isEqual(option, this.value));
      if (match || this.isSearching) return this.options;
      if (this.type === 'multiselect') return [...this.value, ...this.options];
      return [this.value, ...this.options];
    },
  },
  methods: {
    search(query) {
      const shouldQuery = query.length > 0 || this.queryThreshold !== 0;

      if (query.length >= this.queryThreshold && shouldQuery) {
        this.getResourceList(false, query);
        this.isSearching = true;
      } else {
        this.getResourceList(false);
      }
    },
    /**
     * Get resource list used for selecting a resource
     */
    getResourceList(setValue, query) {
      if (this.showingInitialOptions && !query) return;
      const params = {
        pageSize: 10,
        fields: this.fields.join(','),
      };

      if (query) {
        params.queryFilter = this.fields.map((field) => `/${field} sw "${query}"`).join(' or ');
        [params.sortKeys] = this.fields;
      } else {
        params.queryFilter = true;
      }

      getManagedResourceList(this.resourcePath, params).then(({ data }) => {
        this.options = data.result;
        this.showingInitialOptions = !query;
        if (setValue) this.$emit('input', this.options[0]);
      }).catch((error) => {
        this.showErrorMessage(error, this.$t('errors.errorRetrievingResources', { resource: this.resourcePath }));
      });
    },
  },
};

</script>
