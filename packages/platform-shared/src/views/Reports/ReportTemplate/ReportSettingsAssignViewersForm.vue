<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <BFormGroup label-for="allowed-viewers-field">
      <FrField
        v-if="managedUsersLoadedFirstTime"
        v-model="initialIds"
        class="fr-viewers-multiselect"
        name="data-allowed-viewers"
        type="multiselect"
        hide-selected
        :clear-on-select="false"
        :description="$t('reports.newReportModal.usersInputDescription')"
        :internal-search="false"
        :label="$t('common.users')"
        :loading="isLoading"
        :options="userOptions"
        :show-no-options="false"
        @search-change="debounceSetSearchTerm">
        <template #option="{ option: { meta: user } }">
          <BMedia
            no-body
            class="mw-100">
            <BMediaAside vertical-align="center">
              <BAvatar
                size="24"
                variant="light"
                :src="user.profileImage || require('@forgerock/platform-shared/src/assets/images/avatar.png')" />
            </BMediaAside>
            <BMediaBody class="overflow-hidden">
              <div class="mb-1 text-dark d-block text-truncate">
                {{ $t('common.userFullName', { givenName: user.givenName, sn: user.sn}) }}
              </div>
              <small class="d-block text-truncate">
                {{ user.userName }}
              </small>
            </BMediaBody>
          </BMedia>
        </template>
        <template #tag="{ option, remove }">
          <span class="multiselect__tag">
            <BMedia no-body>
              <BMediaAside
                class="mr-2"
                vertical-align="center">
                <BAvatar
                  size="24"
                  variant="light"
                  :src="option?.meta.profileImage || require('@forgerock/platform-shared/src/assets/images/avatar.png')" />
              </BMediaAside>
              <BMediaBody class="overflow-hidden">
                <div class="mb-1 text-dark d-block text-truncate">
                  {{ `${option?.meta.givenName} ${option?.meta.sn}` }}
                </div>
                <small class="text-muted d-block text-truncate">
                  {{ option?.meta.userName }}
                </small>
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
      </FrField>
    </BFormGroup>
    <BFormGroup label="Groups">
      <FrField
        v-model="reportViewer"
        name="reportViewer"
        type="checkbox"
        :label="$t('reports.newReportModal.reportViewerOption')" />
    </BFormGroup>
  </div>
</template>

<script setup>
import {
  BAvatar,
  BFormGroup,
  BMedia,
  BMediaAside,
  BMediaBody,
} from 'bootstrap-vue';
import { ref, watch, computed } from 'vue';
import { debounce, isEqual } from 'lodash';
import FrField from '@forgerock/platform-shared/src/components/Field';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import i18n from '@forgerock/platform-shared/src/i18n';
import store from '@/store';
import { MANAGED_RESOURCE_TYPES, useManagedResource } from '../../../composables/useManagedResource';
import { REPORT_VIEWER_GROUP } from '../utils/constants';

/**
 * @description Form for assigning viewers to a report, it is used on the new
 * report and assign viewers modals. To see how this component is used, see the
 * ReportSettingsDetailsForm.vue component
 *
 * @prop {Array} modelValue - array of viewers to assign to the report
 *
 * @emits update:modelValue - emits the viewers array when the viewers are updated
 */

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['update:modelValue']);

const {
  isLoading, error: userOptionsError, data: userOptions, initialIds, searchTerm,
} = useManagedResource(store.state.realm, MANAGED_RESOURCE_TYPES.USER, props.modelValue.filter((id) => id !== REPORT_VIEWER_GROUP));
const debounceSetSearchTerm = debounce((event) => { searchTerm.value = event; }, 250);

const managedUsersLoadedFirstTime = ref(false);
const reportViewer = ref(props.modelValue.includes(REPORT_VIEWER_GROUP));
const allViewers = computed(() => (reportViewer.value ? [REPORT_VIEWER_GROUP, ...initialIds.value] : initialIds.value));

/**
 * Handle errors from API request for Managed Users
 */
watch(userOptionsError, (newValue) => showErrorMessage(newValue, i18n.global.t('reports.noUserAndGroupData')));

watch(() => props.modelValue, (newValue) => {
  const newInitialIds = newValue.filter((id) => id !== REPORT_VIEWER_GROUP);
  if (!isEqual(newInitialIds, initialIds.value)) {
    initialIds.value = newInitialIds;
  }
});

watch(allViewers, (newValue) => emit('update:modelValue', newValue));

// To remove the initial values that are not in the userOptions to avoid multiselect errors
watch(userOptions, (newValue) => {
  if (!isLoading.value) {
    initialIds.value = initialIds.value.filter((id) => newValue.some((user) => user.multiselectId === id));
  }
});

// Trick to make sure the managed users options are loaded first time before
// multiselect is rendered because the multiselect shows an error when the
// value contains elements that does not exists on the options yet.
watch(isLoading, (newValue) => {
  if (!newValue && !managedUsersLoadedFirstTime.value) {
    managedUsersLoadedFirstTime.value = true;
  }
});
</script>

<style lang="scss" scoped>
:deep(.multiselect__tags-wrap) {
  max-width: 100%;
}
</style>
