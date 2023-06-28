<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div
    v-if="initialSearch"
    style="height: 50px;">
    <FrField
      :value="selectValue"
      @input="handleInput"
      @search-change="debouncedSearch"
      @open="isOpen = true;"
      @close="isOpen = false; isSearching = false;"
      open-direction="bottom"
      type="select"
      :label="fieldLabel"
      :validation="validation"
      name="resourceSelect"
      :placeholder="searchText"
      :internal-search="false"
      :options="selectOptions"
      :description="description">
      <template #singleLabel="{ option }">
        {{ option.label }}
      </template>
      <template #option="{ option }">
        {{ option.label }}
      </template>
      <template #noResult>
        <slot name="noResult">
          {{ $t('common.noResultsFound') }}
        </slot>
      </template>
    </FrField>
  </div>
</template>

<script>
import {
  debounce,
  isEmpty,
} from 'lodash';
import FrField from '@forgerock/platform-shared/src/components/Field';
import { getResource } from '@forgerock/platform-shared/src/api/governance/CommonsApi';

export default {
  name: 'GovResourceSelect',
  components: {
    FrField,
  },
  props: {
    label: {
      type: String,
      default: '',
    },
    validation: {
      type: String,
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
  },
  data() {
    return {
      debouncedSearch: debounce(this.search, 500),
      isOpen: false,
      isSearching: false,
      options: [],
      showingInitialOptions: false,
      selectValue: this.initialData?.id,
      initialSearch: false,
    };
  },
  mounted() {
    if (!isEmpty(this.initialData)) {
      this.getResourceList(false);
      this.handleInput(this.initialData?.id, true);
    } else {
      this.getResourceList(true);
    }
  },
  computed: {
    selectOptions() {
      // used for inputs that have an additional option that is not a specific resource
      if (!isEmpty(this.firstOption)) return [this.firstOption, ...this.options];

      // no initial value supplied
      if (isEmpty(this.initialData)) return this.options;

      // initial value supplied
      const selectedOption = this.initialData.id;
      const match = this.options.find((option) => option.value === selectedOption);
      const initialLabel = match ? `${match?.userInfo?.givenName} ${match?.userInfo?.sn}` : null;
      const initialOption = {
        label: initialLabel || `${this.initialData.givenName} ${this.initialData.sn}`,
        value: selectedOption,
      };

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
      return this.label || this.$t('common.selectSelection', { selection: this.resource });
    },
  },
  methods: {
    search(query) {
      this.getResourceList(false, query);
      this.isSearching = true;
    },
    /**
     * Get resource list used for selecting a resource
     */
    getResourceList(setValue, query) {
      if (this.showingInitialOptions && !query) return;

      getResource(this.resource, query).then(({ data }) => {
        this.options = data.result.map((element) => {
          if (this.resource === 'user') {
            return {
              label: `${element.givenName} ${element.sn}`,
              userInfo: element,
              value: element.id,
            };
          }
          return {
            label: element.name,
            value: element.id,
          };
        });

        this.showingInitialOptions = !query;
        const selectedValue = this.initialData?.id || this.options[0].value;
        if (setValue) this.handleInput(selectedValue);
      }).catch(() => {}).finally(() => { this.initialSearch = true; });
    },
    handleInput(event, isInitial) {
      this.isSearching = false;
      let path;
      if (this.resource === 'role') {
        path = 'managed/role';
        const selectedRole = this.options.find((role) => role.value === event);
        this.$emit('get-role-info', { name: selectedRole.label, id: selectedRole.value });
      }
      if (this.resource === 'user') {
        path = 'managed/user';
        let selectedUser = {};

        if (isInitial) selectedUser.userInfo = this.initialData;
        else {
          selectedUser = this.options
            .find((user) => user.value === event) || {};
        }
        this.$emit('get-user-info', selectedUser.userInfo);
      }
      this.selectValue = event;
      this.$emit('input', `${path}/${event}`);
    },
  },
  watch: {
    resourcePath: {
      handler() {
        this.showingInitialOptions = false;
        this.getResourceList(true);
      },
    },
  },
};

</script>
