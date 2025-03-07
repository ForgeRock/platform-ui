<!-- Copyright (c) 2023-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrField
    v-if="initialValuesLoad"
    @close="isSearching = false;"
    @input="handleInput"
    @search-change="debouncedSearch"
    :name="name"
    open-direction="bottom"
    type="select"
    :description="description"
    :disabled="readOnly"
    :internal-search="false"
    :label="fieldLabel"
    :options="selectOptions"
    :placeholder="searchText"
    :validation="validation"
    :value="selectValue">
    <template
      v-for="(slotName, index) in ['singleLabel', 'option']"
      :key="index"
      #[slotName]="{ option }">
      <slot
        :name="slotName"
        :option="option">
        {{ option.text }}
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
import {
  debounce,
  isEmpty,
} from 'lodash';
import FrField from '@forgerock/platform-shared/src/components/Field';
import { compareRealmSpecificResourceName } from '@forgerock/platform-shared/src/utils/realm';
import { getResource } from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import { getDefaultGovOption, getQueryParams } from '@forgerock/platform-shared/src/utils/governance/select';
import {
  getResourceType,
} from '@forgerock/platform-shared/src/components/FormEditor/utils/govObjectSelect';

export default {
  name: 'GovResourceSelect',
  components: {
    FrField,
  },
  props: {
    customQuery: {
      type: String,
      default: '',
    },
    label: {
      type: String,
      default: '',
    },
    validation: {
      type: [Object, String],
      default: '',
    },
    initialData: {
      type: Object,
      default: () => {},
    },
    value: {
      type: String,
      default: '',
    },
    resourcePath: {
      type: [String, Array],
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    firstOption: {
      type: Object,
      default: () => {},
    },
    readOnly: {
      type: Boolean,
      default: false,
    },
    setInitialValue: {
      type: Boolean,
      default: true,
    },
    name: {
      type: String,
      required: true,
    },
    /**
     * Function to containing api call to retrieve resource data
     */
    resourceFunction: {
      type: Function,
      default: getResource,
    },
    /**
     * Function to format resource data into options
     */
    optionFunction: {
      type: Function,
      default: getDefaultGovOption,
    },
    /**
     * Function to format query params used for resourceFunction
     */
    queryParamFunction: {
      type: Function,
      default: getQueryParams,
    },
  },
  data() {
    return {
      debouncedSearch: debounce(this.search, 500),
      isSearching: false,
      options: [],
      showingInitialOptions: false,
      selectValue: this.initialData?.id,
      savedData: {},
      initialValuesLoad: false,
    };
  },
  async mounted() {
    this.savedData = this.initialData;

    if (isEmpty(this.initialData)) {
      if (!isEmpty(this.value)) {
        try {
          const { data } = await this.resourceFunction(this.resource, this.queryParamFunction(this.value?.split('/').pop(), this.resource, true, this.customQuery));
          this.savedData = this.optionFunction(data?.result?.[0], this.resource);
        } catch {
          this.savedData = this.optionFunction({ id: this.value, name: this.value }, null);
        }
      }
    } else {
      this.savedData = this.optionFunction(this.savedData, this.resource);
    }

    if (!isEmpty(this.savedData)) {
      await this.getResourceList(false);
      this.handleInput(this.savedData.value, true);
    } else {
      await this.getResourceList(this.setInitialValue);
    }
  },
  computed: {
    selectOptions() {
      // used for inputs that have an additional option that is not a specific resource
      if (!isEmpty(this.firstOption)) return [this.firstOption, ...this.options];

      // no initial value supplied
      if (isEmpty(this.savedData)) return this.options;

      // initial value supplied
      const match = this.options.find((option) => option.value === this.savedData?.value);
      const initialOption = match || this.savedData;

      // ensures that the selected option is not in the list twice
      if (match || this.isSearching) return [...this.options];
      return [initialOption, ...this.options];
    },
    searchText() {
      return this.$t('common.placeholders.typeToSearchFor', { item: this.resource });
    },
    resource() {
      if (Array.isArray(this.resourcePath)) return this.resourcePath[0].split('/').pop();
      return this.resourcePath.split('/').pop();
    },
    fieldLabel() {
      return this.label || this.$t('common.selectSelection', { selection: getResourceType(this.resource) });
    },
  },
  methods: {
    getResourceType,
    /**
     * Searches for managed resources
     * @param {String} query Query for resource select field
     */
    search(query) {
      this.getResourceList(false, query);
      this.isSearching = true;
    },
    /**
     * Get resource list used for selecting a resource
     * @param {Boolean} setValue Whether handle input should be called
     * @param {String} queryString Query for resource select field
     */
    getResourceList(setValue, queryString) {
      if (this.showingInitialOptions && !queryString) return Promise.resolve();

      return this.resourceFunction(this.resource, this.queryParamFunction(queryString, this.resource, false, this.customQuery)).then(({ data }) => {
        this.options = data.result.map((option) => this.optionFunction(option, this.resource));
        this.showingInitialOptions = !queryString;
        const selectedValue = !isEmpty(this.savedData)
          ? this.savedData.value
          : this.options[0]?.value;
        if (setValue) this.handleInput(selectedValue);
      })
        .catch(() => {})
        .finally(() => { this.initialValuesLoad = true; });
    },
    /**
     * emits out request to get user or role info if current resource is either, and emits
     * out input in the form of path/fieldValue
     * @param {Event} event currently selected value
     * @param {Boolean} isInitial Whether this is the mounted input change
     */
    handleInput(event, isInitial) {
      this.isSearching = false;
      const selectedOption = this.options.find((option) => option.value === event) || {};

      if (this.resource === 'role' || compareRealmSpecificResourceName(this.resource, 'role')) {
        this.$emit('get-role-info', { name: selectedOption.text, id: selectedOption.value });
      } else if (this.resource === 'user' || compareRealmSpecificResourceName(this.resource, 'user')) {
        if (isInitial) selectedOption.userInfo = this.initialData;
        this.$emit('get-user-info', selectedOption.userInfo);
      }

      this.selectValue = event;
      const path = `managed/${this.resource}`;
      this.$emit('input', `${path}/${event}`);
      this.$emit('selected:option', selectedOption);
    },
  },
  watch: {
    resourcePath() {
      this.showingInitialOptions = false;
      this.getResourceList(true);
    },
  },
};
</script>
