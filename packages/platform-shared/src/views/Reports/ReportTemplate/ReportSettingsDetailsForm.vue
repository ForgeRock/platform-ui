<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BForm>
    <BFormGroup label-for="name-field">
      <FrField
        name="name-field"
        type="text"
        :disabled="!isNameEditable"
        :description="$t('reports.newReportModal.nameInputDescription')"
        :label="$t('common.name')"
        :validation="validationRules"
        :validation-immediate="false"
        :value="props.value.name"
        @input="update('name', $event)" />
    </BFormGroup>
    <BFormGroup label-for="description-field">
      <FrField
        name="description-field"
        type="textarea"
        :label="$t('common.optionalFieldTitle', { fieldTitle: $t('common.description') })"
        :value="props.value.description"
        @input="update('description', $event)" />
    </BFormGroup>
    <h5 class="mb-3">
      {{ $t('reports.newReportModal.labelViewers') }}
    </h5>
    <BFormGroup>
      <FrField
        class="mb-2"
        name="report_viewer"
        type="checkbox"
        :value="props.value.report_viewer"
        :label="$t('reports.newReportModal.reportViewerOption')"
        @input="update('report_viewer', $event)" />
    </BFormGroup>
    <BFormGroup label-for="allowed-viewers-field">
      <FrField
        name="data-allowed-viewers"
        type="multiselect"
        :clear-on-select="false"
        :description="$t('reports.newReportModal.usersInputDescription')"
        :hide-selected="true"
        :internal-search="false"
        :label="$t('common.users')"
        :loading="isLoading"
        :options="[...userOptionData, ...userNameOptions]"
        :show-no-options="false"
        :value="viewers"
        @search-change="handleSearchChange"
        @input="updateViewers">
        <template
          v-for="slotName in ['singleLabel', 'option']"
          :key="slotName"
          #[slotName]="{ option: { meta: prop } }">
          <div :class="{ 'mb-1': slotName === 'singleLabel' }">
            <BMedia no-body>
              <BMediaAside vertical-align="center">
                <BAvatar
                  size="24"
                  variant="light"
                  :src="prop.profileImage?.length ? prop.profileImage : require('@forgerock/platform-shared/src/assets/images/avatar.png')" />
              </BMediaAside>
              <BMediaBody>
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
  </BForm>
</template>

<script setup>
/**
 * @description Component that contains the Detail Settings form for Report Templates
 */
import {
  computed,
  ref,
  toRaw,
  watch,
  onMounted,
} from 'vue';
import {
  BAvatar,
  BForm,
  BFormGroup,
  BMedia,
  BMediaAside,
  BMediaBody,
} from 'bootstrap-vue';
import { useForm } from 'vee-validate';
import FrField from '@forgerock/platform-shared/src/components/Field';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import i18n from '@forgerock/platform-shared/src/i18n';
import { debounce } from 'lodash';
import useManagedUsers from '../composables/ManagedUsers';
import store from '@/store';

const emit = defineEmits(['input', 'search-change', 'valid-change']);
const props = defineProps({
  isNameEditable: {
    type: Boolean,
    default: true,
  },
  isTesting: {
    type: Boolean,
    default: false,
  },
  reportNames: {
    type: Array,
    default: () => [],
  },
  value: {
    type: Object,
    default: () => ({}),
  },
});

// Composables
const { meta } = useForm();
const {
  userOptionData,
  userOptionError,
  fetchManagedUsers,
  isLoading,
} = useManagedUsers(store.state.realm);

// Globals
const debounceFetchManagedUsers = debounce(fetchManagedUsers, 250, false);
const userNameOptions = ref([]);

// Methods
/**
 * Fetches managed users based on the search query term passed from form field
 *
 * @param {String} searchQuery - Value from search form field
 */
function handleSearchChange(searchQuery) {
  debounceFetchManagedUsers(searchQuery);

  if (props.isTesting) {
    fetchManagedUsers(searchQuery);
  }
}

/**
 * Update function for component v-model
 *
 * @param {String} key - Name of object key
 * @param {*} value - Value of key parameter
 */
function update(key, value) {
  emit('input', { ...props.value, [key]: toRaw(value) });
}

/**
 * Updates the viewers when there is a report viewer that is added or removed
 * @param {Array} ids list of viewer ids
 */
function updateViewers(ids) {
  if (ids.length > userNameOptions.value.length) {
    // adding a viewer
    const [newViewer] = userOptionData.value;
    userNameOptions.value.push(newViewer);
  } else {
    // removing a viewer
    userNameOptions.value = userNameOptions.value.filter((option) => ids.includes(option.value));
  }

  update('viewers', ids);
}

// Computed
const vanityReportNames = computed(() => props.reportNames.map((name) => name.replace(/-/g, ' ').toLowerCase()));
const validationRules = computed(() => ({
  alpha_num_spaces: true,
  ...(props.reportNames.length && { unique: vanityReportNames.value }),
}));
// The value prop on the multiselect field requires options to be resolved and include
// a reference to all viewers first before being added, otherwise we run into a JS error.
const viewers = computed(() => (
  (userNameOptions.value.length >= props.value.viewers?.length) ? props.value.viewers : []
));

// Watchers
/**
 * Emit the validity of form from Vee Validate
 */
watch(meta, (newVal) => {
  emit('valid-change', newVal.valid);
});

/**
 * Handle errors from API request for Managed Users
 */
watch(userOptionError, (newVal) => {
  if (newVal) {
    showErrorMessage(newVal, i18n.global.t('reports.noUserAndGroupData'));
  }
});

/**
 * Adds API options object when a user belongs to the viewers list
 */
watch(userOptionData, ([user]) => {
  if (user && props.value.viewers.includes(user.value)) {
    userNameOptions.value.push(user);
  }
});

// Start
onMounted(() => {
  /**
   * Makes API calls for each viewer ID in order to retrieve username
   */
  const propViewers = props.value?.viewers;
  const userPromises = [];
  if (propViewers.length) {
    propViewers.forEach((id) => { userPromises.push(fetchManagedUsers(id, true)); });
    Promise.all(userPromises);
  }
});
</script>

<style lang="scss" scoped>
  .icon-group {
    height: 24px;
    width: 24px;
  }

  :deep(.multiselect .multiselect__tags-wrap) {
    max-width: 100%;
  }
</style>
