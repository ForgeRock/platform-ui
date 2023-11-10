<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div
    v-if="initialSearch"
    style="height: 50px;">
    <FrField
      @close="isOpen = false; isSearching = false;"
      @input="handleInput"
      @open="isOpen = true;"
      @search-change="debouncedSearch"
      name="resourceSelect"
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
      <template #singleLabel="{ option }">
        {{ option.text }}
      </template>
      <template #option="{ option }">
        {{ option.text }}
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
import { compareRealmSpecificResourceName } from '@forgerock/platform-shared/src/utils/realm';
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
    readOnly: {
      type: Boolean,
      default: false,
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
      savedData: {},
      initialSearch: false,
    };
  },
  async mounted() {
    this.savedData = this.initialData;
    if (isEmpty(this.initialData) && !isEmpty(this.value)) {
      const { data } = await getResource(this.resource, this.value?.split('/').pop());
      this.savedData = data?.result?.[0];
    }
    if (!isEmpty(this.savedData)) {
      await this.getResourceList(false);
      this.handleInput(this.savedData?.id, true);
    } else {
      this.getResourceList(true);
    }
  },
  computed: {
    selectOptions() {
      // used for inputs that have an additional option that is not a specific resource
      if (!isEmpty(this.firstOption)) return [this.firstOption, ...this.options];

      // no initial value supplied
      if (isEmpty(this.savedData)) return this.options;

      // initial value supplied
      const selectedOption = this.savedData.id;
      const match = this.options.find((option) => option.value === selectedOption);
      const initialOption = {
        text: this.$t('common.userFullName', { givenName: match?.userInfo?.givenName || this.savedData.givenName, sn: match?.userInfo?.sn || this.savedData.sn }),
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
     * @param {String} query Query for resource select field
     */
    getResourceList(setValue, query) {
      if (this.showingInitialOptions && !query) return Promise.resolve();

      return getResource(this.resource, query).then(({ data }) => {
        this.options = data.result.map((element) => {
          if (this.resource === 'user' || compareRealmSpecificResourceName(this.resource, 'user')) {
            return {
              text: this.$t('common.userFullName', { givenName: element.givenName, sn: element.sn }),
              userInfo: element,
              value: element.id,
            };
          }
          return {
            text: element.name,
            value: element.id,
          };
        });

        this.showingInitialOptions = !query;
        const selectedValue = this.savedData?.id || this.options[0].value;
        if (setValue) this.handleInput(selectedValue);
      }).catch(() => {}).finally(() => { this.initialSearch = true; });
    },
    /**
     * emits out request to get user or role info if current resource is either, and emits
     * out input in the form of path/fieldValue
     * @param {Event} event currently selected value
     * @param {Boolean} isInitial Whether this is the mounted input change
     */
    handleInput(event, isInitial) {
      this.isSearching = false;

      if (this.resource === 'role' || compareRealmSpecificResourceName(this.resource, 'role')) {
        const selectedRole = this.options.find((role) => role.value === event) || {};

        this.$emit('get-role-info', { name: selectedRole.text, id: selectedRole.value });
      } else if (this.resource === 'user' || compareRealmSpecificResourceName(this.resource, 'user')) {
        let selectedUser = {};

        if (isInitial) selectedUser.userInfo = this.savedData;
        else selectedUser = this.options.find((user) => user.value === event) || {};

        this.$emit('get-user-info', selectedUser.userInfo);
      }

      this.selectValue = event;
      const path = `managed/${this.resource}`;
      this.$emit('input', `${path}/${event}`);
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
