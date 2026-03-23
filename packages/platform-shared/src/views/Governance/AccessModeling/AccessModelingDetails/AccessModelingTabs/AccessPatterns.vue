<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrSpinner
    v-if="isLoading || isSaving"
    class="py-5" />
  <div
    v-else
    class="px-4">
    <BRow
      sm="12"
      class="px-2 align-items-center d-flex justify-content-between mb-4">
      <div>
        <BButton
          v-if="!readOnly && availableAttributes.length > 0"
          variant="primary"
          :disabled="isSaving"
          @click="setPatternForModal({}, 'add')">
          <FrIcon
            name="add"
            class="mr-2" />
          {{ i18n.global.t('governance.accessModeling.patterns.addPattern') }}
        </BButton>
      </div>
      <FrSortDropdown
        class="px-3"
        :selected-item="sortField"
        :hide-labels-on-mobile="true"
        :sort-by-options="patternSortByOptions"
        @sort-field-change="handleSortChange"
        @sort-direction-change="handleSortDirectionChange" />
    </BRow>
    <BRow
      sm="12"
      class="px-2 align-items-center d-flex justify-content-between mb-2">
      <BCard
        v-for="(patternGroup, groupIndex) in patternList"
        :key="groupIndex"
        class="w-100 mb-3">
        <div class="d-flex flex-row">
          <BBadge
            pill
            class="users-badge">
            {{ i18n.global.t('governance.accessModeling.roleDetails.accessPatterns.users', { number: patternGroup.count}) }}
          </BBadge>
        </div>
        <BRow class="mt-3">
          <BCol
            v-for="(pattern, patternIndex) in patternGroup.attributes"
            :key="patternIndex"
            cols="6">
            <FrField
              v-model="pattern.value"
              sm="6"
              class="mb-4"
              :name="pattern.key"
              type="string"
              :disabled="true"
              :label="pattern.displayName" />
          </BCol>
        </BRow>
        <BRow
          v-if="!readOnly"
          class=" mr-1 d-flex justify-content-end">
          <BButton
            variant="outline-primary"
            :disabled="isLoading"
            @click="setPatternForModal(patternGroup, 'confirm')">
            {{ $t('common.remove') }}
          </BButton>
        </BRow>
      </BCard>
    </BRow>
    <FrPagination
      v-if="patternList.length > 0"
      v-model="currentPage"
      :per-page="pageSize"
      hide-page-size-selector
      hide-border="true"
      :total-rows="totalPatterns"
      @input="filterHandler({ currentPage: $event })"
      @on-page-size-change="filterHandler({ pageSize: $event })" />
    <BModal
      id="confirm-remove-pattern"
      :title="$t('governance.accessModeling.patterns.deletePatternTitle')"
      v-model="confirmModalVisible"
      centered
      no-close-on-backdrop
      no-close-on-esc>
      <p>
        {{ $t('governance.accessModeling.patterns.deletePatternMessage') }}
      </p>
      <template #modal-footer="{}">
        <BButton
          variant="outline-secondary"
          class="ml-auto mr-2"
          @click="closeModal('confirm')">
          {{ $t('common.cancel') }}
        </BButton>
        <FrButtonWithSpinner
          variant="primary"
          :button-text="$t('common.remove')"
          :disabled="isSaving"
          :show-spinner="isSaving"
          :spinner-text="$t('common.remove')"
          @click="() => updatePatterns('remove')" />
      </template>
    </BModal>
    <BModal
      id="add-pattern"
      :title="$t('governance.accessModeling.patterns.addPatternTitle')"
      v-model="addPatternModalVisible"
      :size="'lg'"
      centered
      no-close-on-backdrop
      no-close-on-esc>
      <p>
        {{ $t('governance.accessModeling.patterns.addPatternMessage') }}
      </p>
      <BRow class="mt-3">
        <BCol
          v-for="(attribute, index) in availableAttributes"
          :key="index"
          cols="6">
          <FrField
            v-model="addPattern[attribute.key]"
            class="mb-4"
            :name="attribute.key"
            type="string"
            :label="attribute.displayName" />
        </BCol>
      </BRow>
      <template #modal-footer="{}">
        <BButton
          variant="outline-secondary"
          class="ml-auto mr-2"
          @click="closeModal('add')">
          {{ $t('common.cancel') }}
        </BButton>
        <FrButtonWithSpinner
          variant="primary"
          :button-text="$t('common.add')"
          :disabled="isSaving"
          :show-spinner="isSaving"
          :spinner-text="$t('common.add')"
          @click="() => updatePatterns('add')" />
      </template>
    </BModal>
  </div>
</template>

<script setup>
import {
  BBadge,
  BButton,
  BCard,
  BCol,
  BModal,
  BRow,
} from 'bootstrap-vue';
import { ref, onBeforeMount, computed } from 'vue';
import { find } from 'lodash';
import { patternSortByOptions } from '@forgerock/platform-shared/src/utils/governance/accessModeling';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrSortDropdown from '@forgerock/platform-shared/src/components/governance/SortDropdown';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner/';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { getRoleDataById } from '@forgerock/platform-shared/src/api/governance/RoleApi';
import { convertRulesToDisplay } from '../../../../../utils/governance/prediction';
import i18n from '@/i18n';

const props = defineProps({
  role: {
    type: Object,
    default: () => ({}),
  },
  userSchema: {
    type: Array,
    default: () => ([]),
  },
  savePatterns: {
    type: Function,
    required: true,
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
  availableAttributes: {
    type: Array,
    default: () => [],
  },
});
const isLoading = ref(true);
const sortField = ref('attributeCount');
const sortDesc = ref(true);
const currentPage = ref(1);
const pageSize = ref(10);
const pagedResultsOffset = ref(0);
const totalPatterns = ref(0);
const patternList = ref([]);
const selectedPatterns = ref([]);
const confirmModalVisible = ref(false);
const addPatternModalVisible = ref(false);
const addPattern = ref({});
const readOnly = computed(() => props.role.status !== 'draft');

/**
 * Builds the query filter list from the given patterns
 * @param patterns list of patterns
 */
function buildQueryFilterList(patterns) {
  const queryFilters = patterns.map((patternGroup) => patternGroup.map((pattern) => `${pattern.key} eq '${pattern.value}'`).join(' and '));
  return queryFilters;
}

async function getRoleMembers(roleId, params) {
  const { data } = await getRoleDataById(roleId, props.role.status, 'members', params);
  return data;
}

/**
 * Gets the formatted list of access patterns
 */
async function getPatternList() {
  isLoading.value = true;
  try {
    const justifications = props.role?.justifications || [];
    totalPatterns.value = justifications.length;
    const patterns = convertRulesToDisplay(justifications, props.userSchema, true);
    let justificationsWithPatterns = [];
    for (let idx = 0; idx < justifications.length; idx += 1) {
      const justificationWithPattern = {
        id: justifications[idx],
        attributes: patterns[idx],
      };
      const metadata = find(props.role?.justificationMetadata, { justification: justificationWithPattern.id });
      if (metadata) {
        justificationWithPattern.memberCount = metadata.memberCount;
      }
      justificationsWithPatterns.push(justificationWithPattern);
    }
    if (sortField.value) {
      if (sortField.value === 'attributeCount') {
        justificationsWithPatterns.sort((a, b) => (sortDesc.value ? (b.attributes.length - a.attributes.length) : (a.attributes.length - b.attributes.length)));
      } else if (sortField.value === 'userCount') {
        justificationsWithPatterns.sort((a, b) => (sortDesc.value ? (b.memberCount - a.memberCount) : (a.memberCount - b.memberCount)));
      }
    }
    justificationsWithPatterns = justificationsWithPatterns.splice(pagedResultsOffset.value, pageSize.value);
    // Get the members count for each pattern
    const queryFilters = buildQueryFilterList(justificationsWithPatterns.map((justificationWithPattern) => justificationWithPattern.attributes));
    const rolePromises = queryFilters.map((queryFilter) => getRoleMembers(props.role.id, { _queryFilter: queryFilter, pageSize: 0 }));
    const roleResults = await Promise.all(rolePromises);
    // Map the return value for patternList
    patternList.value = justificationsWithPatterns.map((justificationWithPattern, index) => ({
      ...justificationWithPattern,
      count: roleResults[index]?.totalHits || 0,
    }));
    isLoading.value = false;
  } catch (error) {
    isLoading.value = false;
    showErrorMessage(error, i18n.global.t('governance.accessModeling.failedGettingRole'));
  } finally {
    isLoading.value = false;
  }
}

/**
 * Handles updates to pagination
 * @param {Object} property updated property
 */
function filterHandler(property) {
  const [key, value] = Object.entries(property)[0];
  if (key === 'currentPage') {
    currentPage.value = value;
    pagedResultsOffset.value = (value - 1) * pageSize.value;
  } else if (key === 'pageSize') {
    pageSize.value = property.pageSize;
    pagedResultsOffset.value = 0;
    currentPage.value = 1;
  }
  getPatternList();
}

/**
 * Handles sort field change
 */
function handleSortChange(sort) {
  sortField.value = sort;
  getPatternList();
}

/**
 * Handles sort direction change
 */
function handleSortDirectionChange() {
  sortDesc.value = !sortDesc.value;
  getPatternList();
}

/**
 * Closes the specified modal
 * @param {String} modalType - The type of modal to close ('confirm' or 'add')
 */
function closeModal(modalType) {
  if (modalType === 'confirm') {
    confirmModalVisible.value = false;
  } else if (modalType === 'add') {
    addPatternModalVisible.value = false;
    addPattern.value = {};
  }
  selectedPatterns.value = [];
}

/**
 * Sets the selected pattern for the confirmation modal and opens the modal
 * @param {Object} pattern - The pattern to be removed
 * @param {String} modalType - The type of modal to open ('confirm' or 'add')
 */
function setPatternForModal(pattern, modalType) {
  if (modalType === 'confirm') {
    selectedPatterns.value = [pattern];
    confirmModalVisible.value = true;
  } else if (modalType === 'add') {
    selectedPatterns.value = [addPattern.value];
    addPatternModalVisible.value = true;
  }
}

/**
 * Converts an attribute object into a persisted access pattern string.
 * Each populated entry is encoded as `<hexKeyLength>_<UPPERCASE_KEY>_<value>` and joined by spaces.
 *
 * @param {Object} obj - Key/value map of attribute names to attribute values.
 * @returns {String} Encoded pattern string used by access modeling APIs.
 */
function convertObjectToPattern(obj) {
  return Object.entries(obj)
    .filter(([, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => {
      const hexLength = key.length
        .toString(16)
        .toUpperCase()
        .padStart(2, '0');
      return `${hexLength}_${key.toUpperCase()}_${encodeURIComponent(value)}`;
    })
    .join(' ');
}

/**
 * Emits the selected patterns to be removed and closes the modal
 * @param {String} operation - The type of operation to perform (e.g., 'remove').
 */
async function updatePatterns(operation) {
  const patternsToUpdate = selectedPatterns.value.map((pattern) => {
    if (operation === 'add') {
      pattern.id = convertObjectToPattern(pattern);
    }
    const patternObject = {
      id: pattern.id,
      operation,
    };
    return patternObject;
  });
  await props.savePatterns('justifications', '', patternsToUpdate);
  closeModal(operation === 'add' ? 'add' : 'confirm');
  await getPatternList();
}

onBeforeMount(async () => {
  await getPatternList();
});
</script>

<style lang="scss" scoped>
.access-card {
  height: 325px;
}

.badge-col {
  text-align: center;
}

.users-badge {
  background-color: $blue !important;
}
</style>
