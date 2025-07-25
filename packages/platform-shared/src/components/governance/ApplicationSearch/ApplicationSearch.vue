<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrField
    class="w-100"
    name="filterByApplication"
    type="multiselect"
    :internal-search="false"
    :label="i18n.global.t('governance.accessRequest.newRequest.filterByApplications')"
    :options="applicationFilterOptions"
    @input="filterByApplication"
    @search-change="debouncedApplicationSearch"
    @open="!applicationFilterOptions.length ? filterByApplicationSearch('') : null">
    <template #tag="{ option, remove }">
      <span class="multiselect__tag">
        <BMedia no-body>
          <img
            :alt="i18n.global.t('governance.resource.assignResourceModal.appLogoAltText', { appName: option.value })"
            height="24"
            width="24"
            class="mr-2 align-self-center"
            :onerror="onImageError"
            :src="option.icon">
          <BMediaBody class="pl-1">
            <div
              class="mb-1 text-dark"
              tabindex="0">
              {{ option.title }}
            </div>
            <div class="text-muted">
              {{ option.subtitle }}
            </div>
          </BMediaBody>
        </BMedia>
        <span
          class="multiselect__tag-icon"
          tabindex="0"
          :aria-label="$t('common.remove')"
          @click.prevent="remove(option)"
          @keydown.enter="remove(option)" />
      </span>
    </template>
    <template #option="{ option }">
      <BMedia no-body>
        <img
          :alt="$t('governance.resource.assignResourceModal.appLogoAltText', { appName: option.value })"
          height="24"
          width="24"
          class="mr-2 align-self-center"
          :onerror="onImageError"
          :src="option.icon">
        <BMediaBody class="pl-1">
          <div class="mb-1 text-dark">
            {{ option.title }}
          </div>
          <div class="text-muted">
            {{ option.subtitle }}
          </div>
        </BMediaBody>
      </BMedia>
    </template>
  </FrField>
</template>

<script setup>
/**
 * Centralizes the modal for taking actions of requests.
 * @component RequestModal
 * @prop {String} type - Modal type
 * @prop {Object} item - Request information
 * @prop {Boolean} isTesting - Determines if the component is in a test environment
 */
import { BMedia, BMediaBody } from 'bootstrap-vue';
import { computed } from 'vue';
import { debounce } from 'lodash';
import { onImageError } from '@forgerock/platform-shared/src/utils/applicationImageResolver';
import FrField from '@forgerock/platform-shared/src/components/Field';
import { getApplicationDisplayName, getApplicationLogo } from '@forgerock/platform-shared/src/utils/appSharedUtils';
import i18n from '@/i18n';

const props = defineProps({
  applicationSearchResults: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits([
  'search:applications',
  'update:applications',
]);

const applicationFilterOptions = computed(() => {
  const options = props.applicationSearchResults.map((application) => ({
    value: application.id,
    title: application.name,
    subtitle: getApplicationDisplayName(application),
    icon: getApplicationLogo(application),
  }));
  return options;
});

/**
 * Called on selecting one or more applications in entitlement view
 * @param {Array} applicationFilter Currently selected application(s)
 */
async function filterByApplication(applicationFilter) {
  emit('update:applications', applicationFilter);
}

/**
 * Search for applications using the searchValue
 * @param {String} searchValue value in field at the time of debounce resolution
 */
function filterByApplicationSearch(searchValue) {
  emit('search:applications', searchValue);
}

const debouncedApplicationSearch = debounce(filterByApplicationSearch, 500);
</script>
