<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    id="new-report-modal"
    cancel-variant="link"
    no-close-on-backdrop
    no-close-on-esc
    size="lg"
    :static="isTesting"
    title-class="h5"
    title-tag="h2"
    :ok-title="$t('common.next')"
    :title="$t('reports.newReportModal.title')"
    @hidden="handleModalHide"
    @ok="handleNextClick">
    <BFormGroup label-for="name-field">
      <FrField
        id="name-field"
        name="name-field"
        type="text"
        validation="alpha_num_spaces"
        value=""
        v-model="nameValue"
        :validation-immediate="false"
        :description="$t('reports.newReportModal.nameInputDescription')"
        :label="$t('common.name')" />
    </BFormGroup>
    <BFormGroup label-for="description-field">
      <FrField
        id="description-field"
        name="description-field"
        type="textarea"
        v-model="descriptionValue"
        :label="this.$t('common.optionalFieldTitle', { fieldTitle: this.$t('common.description') })" />
    </BFormGroup>
    <h5 class="mb-3">
      {{ $t('reports.newReportModal.labelViewers') }}
    </h5>
    <BFormGroup>
      <label>{{ $t('common.groups') }}</label>
      <FrField
        class="mb-2"
        id="group-admin"
        type="checkbox"
        v-model="groupReportAdmin"
        :label="$t('reports.newReportModal.reportAdminOption')" />
      <FrField
        class="mb-2"
        id="group-viewer"
        type="checkbox"
        v-model="groupReportViewer"
        :label="$t('reports.newReportModal.reportViewerOption')" />
      <FrField
        id="group-owner"
        type="checkbox"
        v-model="groupReportOwner"
        :label="$t('reports.newReportModal.reportOwnerOption')" />
    </BFormGroup>
    <BFormGroup label-for="allowed-viewers-field">
      <FrField
        id="allowed-viewers-field"
        v-model="viewersValue"
        name="data-allowed-viewers"
        type="multiselect"
        :clear-on-select="false"
        :description="$t('reports.newReportModal.usersInputDescription')"
        :internal-search="false"
        :label="$t('common.users')"
        :loading="isLoading"
        :options="unselectedUserOptions"
        :show-no-options="false"
        @search-change="handleSearchChange">
        <template
          v-for="slotName in ['singleLabel', 'option']"
          :key="slotName"
          #[slotName]="{ option: { meta: prop } }">
          <div :class="{ 'mb-1': slotName === 'singleLabel' }">
            <BMedia no-body>
              <BMediaAside vertical-align="center">
                <!-- USER OPTION -->
                <BAvatar
                  v-if="prop.type === 'user'"
                  size="24"
                  variant="light"
                  :src="prop.profileImage?.length ? prop.profileImage : require('@forgerock/platform-shared/src/assets/images/avatar.png')" />
                <!-- GROUP OPTION -->
                <div
                  v-if="prop.type === 'group'"
                  class="icon-group rounded rounded-circle bg-lightyellow color-yellow d-flex align-items-center justify-content-center">
                  <FrIcon
                    icon-class="md-14"
                    name="folder_shared" />
                </div>
              </BMediaAside>
              <!-- USER OPTION -->
              <BMediaBody v-if="prop.type === 'user'">
                <div class="mb-1 text-dark">
                  {{ `${prop.givenName} ${prop.sn}` }}
                </div>
                <small>
                  {{ prop.userName }}
                </small>
              </BMediaBody>
            </BMedia>
          </div>
        </template>
      </FrField>
    </BFormGroup>
    <template #modal-footer="{ cancel }">
      <BButton
        variant="link"
        @click="cancel()">
        {{ $t('common.cancel') }}
      </BButton>
      <FrButtonWithSpinner
        :button-text="$t('common.next')"
        :disabled="!meta.valid || props.reportIsSaving"
        :show-spinner="props.reportIsSaving"
        :spinner-text="$t('common.next')"
        @click="handleNextClick" />
    </template>
  </BModal>
</template>

<script setup>
/**
 * @description Modal for creating a new Analytics Report Template
 */
import { useForm } from 'vee-validate';
import {
  BAvatar, BButton, BFormGroup, BMedia, BMediaAside, BMediaBody, BModal,
} from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrField from '@forgerock/platform-shared/src/components/Field';
import { ref, watch } from 'vue';
import i18n from '@forgerock/platform-shared/src/i18n';
import { debounce } from 'lodash';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner/';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import useManagedUsers from '../composables/ManagedUsers';
import store from '@/store';

const descriptionValue = ref('');
const nameValue = ref('');
const searchValue = ref('');
const viewersValue = ref([]);
const groupReportAdmin = ref(false);
const groupReportViewer = ref(false);
const groupReportOwner = ref(false);
const unselectedUserOptions = ref([]);
const { meta } = useForm();

const {
  userOptionData, error, fetchManagedUsers, isLoading,
} = useManagedUsers(store.state.realm, viewersValue);

const debounceFetchManagedUsers = debounce(fetchManagedUsers, 250, false);
const emit = defineEmits(['new-report-save']);

const props = defineProps({
  reportIsSaving: {
    type: Boolean,
    default: false,
  },
  isTesting: {
    type: Boolean,
    default: false,
  },
});

function handleModalHide() {
  nameValue.value = null;
  descriptionValue.value = null;
  viewersValue.value = [];
}

/**
 * Calls the API when a user searches in the multiselect component
 *
 * @param {String} searchTerm
 */
function handleSearchChange(searchTerm) {
  searchValue.value = searchTerm;
  debounceFetchManagedUsers(searchTerm);

  if (props.isTesting) {
    fetchManagedUsers(searchTerm);
  }
}

watch(userOptionData, (newVal) => {
  // Filter out the selected options
  unselectedUserOptions.value = newVal.filter((option) => !viewersValue.value.includes(option.value));

  // Remove the options when there is no search value
  if (newVal.length && !searchValue.value) {
    unselectedUserOptions.value = [];
  }
});

watch(error, (newVal) => {
  if (newVal) {
    showErrorMessage(newVal, i18n.global.t('reports.noUserAndGroupData'));
  }
});

/**
 * Handle the form submission
 */
function handleNextClick() {
  const checkedGroups = [
    groupReportAdmin.value && 'report_admin',
    groupReportViewer.value && 'report_viewer',
    groupReportOwner.value && 'report_owner',
  ].filter(Boolean);

  emit('new-report-save', {
    description: descriptionValue.value,
    name: nameValue.value,
    viewers: [...checkedGroups, ...viewersValue.value],
  });
}
</script>
<style lang="scss" scoped>
  .icon-group {
    height: 24px;
    width: 24px;
  }
</style>
