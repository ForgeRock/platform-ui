<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrField
    v-model="selectValue"
    :description="description"
    :internal-search="false"
    :label="label"
    :options="options"
    :value="selectValue"
    @input="handleInput"
    @search-change="debouncedSearch"
    open-direction="bottom"
    type="multiselect">
    <template #tag="{ option, remove }">
      <span class="multiselect__tag">
        <BMedia no-body>
          <BImg
            height="24"
            width="24"
            class="mr-2 align-self-center"
            :src="option.value.profileImage || require('@forgerock/platform-shared/src/assets/images/avatar.png')" />
          <BMediaBody class="pl-1">
            <div
              class="mb-1 text-dark"
              tabindex="0">
              {{ option.value.name }}
            </div>
            <small class="text-muted">
              {{ option.value.userName }}
            </small>
          </BMediaBody>
          <span
            class="multiselect__tag-icon"
            tabindex="0"
            :aria-label="$t('common.remove')"
            @click.prevent="remove(option)"
            @keydown.enter="remove(option)" />
        </BMedia>
      </span>
    </template>
    <template #option="{ option }">
      <BMedia no-body>
        <BImg
          height="24"
          width="24"
          class="mr-2 align-self-center"
          :src="option.value.profileImage || require('@forgerock/platform-shared/src/assets/images/avatar.png')" />
        <BMediaBody class="pl-1">
          <div class="mb-1 text-dark">
            {{ option.value.name }}
          </div>
          <small class="text-muted">
            {{ option.value.userName }}
          </small>
        </BMediaBody>
      </BMedia>
    </template>
  </FrField>
</template>

<script>
import {
  debounce,
  filter,
  some,
} from 'lodash';
import { BImg, BMedia, BMediaBody } from 'bootstrap-vue';
import { getResource } from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import FrField from '@forgerock/platform-shared/src/components/Field';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin/';

export default {
  name: 'GovUsersMultiSelect',
  components: {
    BImg,
    BMedia,
    BMediaBody,
    FrField,
  },
  mixins: [
    NotificationMixin,
  ],
  props: {
    description: {
      type: String,
      default: '',
    },
    label: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      debouncedSearch: debounce(this.search, 500),
      isSearching: false,
      options: [],
      selectValue: [],
    };
  },
  mounted() {
    this.getResourceList();
  },
  methods: {
    search(query) {
      this.getResourceList(query);
      this.isSearching = true;
    },
    getResourceList(queryString) {
      const pageSize = this.selectValue.length + 10;
      getResource('user', { queryString, pageSize })
        .then(({ data }) => {
          const parsedOptions = data.result.map((element) => ({
            value: {
              name: this.$t('common.userFullName', {
                givenName: element.givenName,
                sn: element.sn,
              }),
              id: element.id,
              profileImage: element.profileImage,
              userName: element.userName,
            },
          }));
          this.filterOptions(parsedOptions);
        })
        .catch((error) => {
          this.showErrorMessage(error, this.$t('governance.errors.getUsers'));
        });
    },
    filterOptions(parsedOptions) {
      const filteredOptions = filter(parsedOptions, ({ value }) => !some(this.selectValue, value));
      this.options = filteredOptions;
    },
    handleInput(event) {
      this.isSearching = false;
      this.$emit('input', event);
    },
  },
};
</script>
