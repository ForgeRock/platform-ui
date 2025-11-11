<!-- Copyright (c) 2024-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrField
    v-model="selectedValue"
    class="select-field"
    type="select"
    :internal-search="false"
    :label="$t('common.entitlement')"
    :loading="isLoading"
    :options="selectOptions"
    :placeholder="$t('common.placeholders.typeToSearchFor', { item: 'Entitlement' })"
    @input="$emit('update:modelValue', $event)"
    @search-change="debouncedSearch">
    <template #noResult>
      {{ $t('common.noResultsFound') }}
    </template>
    <template
      #afterList
      v-if="viewMore">
      <BButton
        class="w-100"
        variant="link"
        :disabled="isLoading"
        @click="loadMore">
        {{ $t('common.viewMore') }}
      </BButton>
    </template>
  </FrField>
</template>

<script setup>
import { BButton } from 'bootstrap-vue';
import FrField from '@forgerock/platform-shared/src/components/Field';
import { ref } from 'vue';
import { getEntitlementList } from '@forgerock/platform-shared/src/api/governance/EntitlementApi';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { debounce } from 'lodash';
import i18n from '@/i18n';

/*
 * Component that allows the user to select an entitlement
 * @prop {String} modelValue - the selected entitlement
 * @emits update:modelValue - when the selected entitlement changes
 */

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
});

defineEmits(['update:modelValue']);

const selectedValue = ref(props.modelValue);
const selectOptions = ref([]);
const searchQuery = ref('');
const viewMore = ref(false);
const isLoading = ref(false);

const entriesPerPage = 10;
let currentPage = 0;
let totalPagedResults = 0;

function getEntitlementDisplayName(item) {
  return item.descriptor?.idx?.['/entitlement']?.displayName || item.entitlement.displayName;
}

async function search() {
  isLoading.value = true;
  const searchParameters = {
    pageNumber: currentPage,
    pageSize: entriesPerPage,
    sortKeys: 'descriptor.idx./entitlement.displayName',
    queryFilter: `descriptor.idx./entitlement.displayName co '${searchQuery.value}'`,
  };
  try {
    const { data } = await getEntitlementList('resource', searchParameters);
    let options = data.result.map((item) => {
      const displayName = getEntitlementDisplayName(item);
      return {
        value: displayName,
        text: displayName,
      };
    });

    totalPagedResults += data.resultCount;
    // If the total number of results is greater than the number of results already listed, show the view more button
    viewMore.value = totalPagedResults < data.totalCount;

    if (props.modelValue) {
      const isCurrentValueInOptions = options.some((option) => option.value === props.modelValue);
      const isCurrentValueInSelectOptions = selectOptions.value.some((option) => option.value === props.modelValue);

      // if the current value is not on the fetched items then get it from the server
      if (!isCurrentValueInOptions && !isCurrentValueInSelectOptions) {
        const searchParams = {
          queryFilter: `descriptor.idx./entitlement.displayName eq '${props.modelValue}'`,
        };
        const { data: dataValue } = await getEntitlementList('resource', searchParams);
        if (!dataValue.result.length) {
          showErrorMessage(null, i18n.global.t('governance.entitlements.notFound', { entitlement: props.modelValue }));
        } else {
          const selecteditemDisplayName = getEntitlementDisplayName(dataValue.result[0]);
          options = [
            {
              value: selecteditemDisplayName,
              text: selecteditemDisplayName,
            },
            ...options,
          ];
          totalPagedResults += 1;
        }
      } else if (isCurrentValueInOptions && isCurrentValueInSelectOptions) {
        // if the current value is in the options list and already fetched then remove it from the options list
        options = options.filter((option) => option.value !== props.modelValue);
      }
    }
    selectOptions.value = selectOptions.value.concat(options);
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.entitlements.failedToLoad'));
  } finally {
    isLoading.value = false;
  }
}

function loadMore() {
  currentPage += 1;
  search();
}

const debouncedSearch = debounce((event) => {
  // reset the search when the user types
  searchQuery.value = event;
  selectOptions.value = [];
  currentPage = 0;
  totalPagedResults = 0;
  viewMore.value = false;
  search();
}, 500);

search();
</script>

<style scoped lang="scss">
.select-field {
  min-width: 275px;
}

:deep(.form-label-group .btn-link) {
  color: $primary;
  cursor: pointer;
  border: none;

  &:focus,
  &:hover {
    color: $hover-blue;
    background-color: transparent;
  }
}

:deep(.multiselect__spinner) {
  &::before,
  &::after {
    border-color: $primary transparent transparent;
  }
}
</style>
