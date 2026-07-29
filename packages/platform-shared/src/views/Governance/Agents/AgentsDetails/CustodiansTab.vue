<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BCard
    class="border-0 shadow-none"
    no-body>
    <BCardHeader class="p-0">
      <BButtonToolbar class="justify-content-between p-3 border-bottom-0">
        <div>
          <BButton
            variant="primary"
            data-testid="add-custodians-btn"
            @click="bvModal.show('addCustodiansModal')">
            <FrIcon
              icon-class="mr-2"
              name="add">
              {{ $t('governance.agents.custodiansTab.addCustodians') }}
            </FrIcon>
          </BButton>
          <BButton
            v-show="selectedCustodians.length > 0"
            class="ml-2"
            variant="outline-primary"
            data-testid="remove-custodians-btn"
            @click="bvModal.show('removeCustodiansModal')">
            {{ $t('common.remove') }}
          </BButton>
        </div>
      </BButtonToolbar>
    </BCardHeader>
    <div v-if="isLoading">
      <FrSpinner class="py-5" />
    </div>
    <template v-else>
      <FrNoData
        v-if="!custodians.length"
        class="border-0 shadow-none"
        icon="person_off"
        body-class="mb-5"
        :subtitle="$t('governance.agents.custodiansTab.noCustodians')" />
      <BTable
        v-else
        :ref="(el) => grid = el"
        class="mb-0"
        responsive
        no-select-on-click
        selectable
        :fields="fields"
        :items="custodians"
        @row-selected="onRowSelected">
        <template #head(selected)>
          <BFormCheckbox
            class="pl-3"
            :checked="allRowsSelected"
            @change="toggleSelectAll">
            <span class="sr-only">
              {{ $t('common.select') }}
            </span>
          </BFormCheckbox>
        </template>
        <template #cell(selected)="data">
          <BFormCheckbox
            class="pl-3"
            :id="`custodian-checkbox-${data.index}`"
            v-model="data.rowSelected"
            @change="onCheckboxClicked(data)">
            <span class="sr-only">
              {{ $t('common.selectSelection', { selection: data.item.fullName || '' }) }}
            </span>
          </BFormCheckbox>
        </template>
        <template #cell(name)="{ item }">
          <BMedia
            class="align-items-center"
            no-body>
            <BImg
              class="mr-3 rounded-circle size-28"
              :alt="item.fullName"
              :src="item.profileImage || require('@forgerock/platform-shared/src/assets/images/avatar.png')" />
            <BMediaBody class="align-self-center text-truncate">
              <div class="mb-0 h5">
                {{ item.fullName || item.name }}
              </div>
              <div
                v-if="item.userName"
                class="text-secondary m-0">
                {{ item.userName }}
              </div>
            </BMediaBody>
          </BMedia>
        </template>
      </BTable>
      <FrPagination
        v-if="totalCount > pageSize"
        :value="currentPage"
        :per-page="pageSize"
        :total-rows="totalCount"
        @input="loadPage" />
    </template>
  </BCard>

  <!-- Add Custodians Modal -->
  <BModal
    id="addCustodiansModal"
    no-close-on-backdrop
    no-close-on-esc
    size="lg"
    title-class="h5"
    title-tag="h2"
    :ok-disabled="!selectedUsers.length || isSaving"
    :ok-title="$t('common.save')"
    :title="$t('governance.agents.custodiansTab.addCustodians')"
    @ok="addCustodians"
    @hidden="onAddModalHidden">
    <BListGroup
      v-if="selectedUsers.length"
      class="mb-3">
      <BListGroupItem
        v-for="user in selectedUsers"
        :key="user._id"
        class="d-flex align-items-center justify-content-between">
        <BMedia
          class="align-items-center"
          no-body>
          <BImg
            class="mr-3 rounded-circle size-28"
            :alt="user.fullName"
            :src="user.profileImage || require('@forgerock/platform-shared/src/assets/images/avatar.png')" />
          <BMediaBody>
            <div class="mb-0 font-weight-bold">
              {{ user.fullName }}
            </div>
            <small class="text-muted">
              {{ user.userName }}
            </small>
          </BMediaBody>
        </BMedia>
        <BButton
          variant="link"
          class="p-0 text-dark"
          :aria-label="$t('common.remove')"
          @click="toggleUserSelection(user)">
          <FrIcon name="close" />
        </BButton>
      </BListGroupItem>
    </BListGroup>
    <FrSearchInput
      v-model="userSearchQuery"
      :placeholder="$t('governance.agents.custodiansTab.searchPlaceholder')"
      @input="debouncedSearchUsers"
      @search="searchUsers"
      @clear="clearUserSearch" />
    <div
      v-if="isSearching"
      class="py-3 text-center">
      <FrSpinner />
    </div>
    <BListGroup
      v-else-if="userSearchResults.length"
      class="mt-3">
      <BListGroupItem
        v-for="user in userSearchResults"
        :key="user._id"
        button
        :active="isUserSelected(user)"
        @click="toggleUserSelection(user)">
        <BMedia
          class="align-items-center"
          no-body>
          <BImg
            class="mr-3 rounded-circle size-28"
            :alt="user.fullName"
            :src="user.profileImage || require('@forgerock/platform-shared/src/assets/images/avatar.png')" />
          <BMediaBody>
            <div class="mb-0 font-weight-bold">
              {{ user.fullName }}
            </div>
            <small class="text-muted">
              {{ user.userName }}
            </small>
          </BMediaBody>
        </BMedia>
      </BListGroupItem>
    </BListGroup>
    <p
      v-else-if="userSearchQuery && !isSearching"
      class="mt-3 text-muted">
      {{ $t('governance.agents.custodiansTab.noResults') }}
    </p>
  </BModal>

  <!-- Remove Custodians Confirmation Modal -->
  <BModal
    id="removeCustodiansModal"
    no-close-on-backdrop
    no-close-on-esc
    cancel-variant="outline-secondary"
    ok-variant="danger"
    :ok-disabled="isSaving"
    :ok-title="$t('common.remove')"
    :title="$t('common.removeObject', { object: $t('governance.agents.custodians') })"
    @ok="removeCustodians">
    {{ $t('governance.agents.custodiansTab.removeConfirm') }}
  </BModal>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { debounce } from 'lodash';
import {
  BButton,
  BButtonToolbar,
  BCard,
  BCardHeader,
  BFormCheckbox,
  BImg,
  BListGroup,
  BListGroupItem,
  BMedia,
  BMediaBody,
  BModal,
  BTable,
} from 'bootstrap-vue';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import FrSearchInput from '@forgerock/platform-shared/src/components/SearchInput';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import { displayNotification, showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { getManagedResourceList } from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import { queryParamFunction } from '@forgerock/platform-shared/src/components/FormEditor/utils/govObjectSelect';
import { getAgentCustodians, getAgentGlossaryAttributesData, saveAgentGlossaryAttributesData } from '@forgerock/platform-shared/src/api/governance/AgentApi';
import store from '@/store';
import i18n from '@/i18n';

const props = defineProps({
  agentId: {
    type: String,
    required: true,
  },
  accountId: {
    type: String,
    default: '',
  },
});

const { bvModal } = useBvModal();

const isLoading = ref(true);
const isSaving = ref(false);
const isSearching = ref(false);
const custodians = ref([]);
const totalCount = ref(0);
const currentPage = ref(1);
const pageSize = 10;
const grid = ref(null);
const selectedCustodians = ref([]);
const allRowsSelected = ref(false);
const userSearchQuery = ref('');
const userSearchResults = ref([]);
const selectedUsers = ref([]);

const fields = [
  {
    key: 'selected',
    label: '',
    class: 'checkbox-column',
  },
  {
    key: 'name',
    label: i18n.global.t('common.name'),
  },
  {
    key: 'givenName',
    label: i18n.global.t('common.user.givenName'),
  },
  {
    key: 'sn',
    label: i18n.global.t('common.user.lastName'),
  },
];

function mapCustodian(custodian) {
  const givenName = custodian.givenName || '';
  const sn = custodian.sn || '';
  const fullName = i18n.global.t('common.userFullName', { givenName, sn }).trim();
  return { ...custodian, fullName: fullName || custodian.name };
}

async function loadPage(page = 1) {
  currentPage.value = page;
  isLoading.value = true;
  selectedCustodians.value = [];
  allRowsSelected.value = false;
  try {
    const { data } = await getAgentCustodians(props.agentId, {
      pageSize,
      pageNumber: page - 1,
    });
    custodians.value = (data?.result || []).map(mapCustodian);
    totalCount.value = data?.totalCount || 0;
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.agents.custodiansTab.loadError'));
  } finally {
    isLoading.value = false;
  }
}

function onRowSelected(rows) {
  selectedCustodians.value = rows;
  allRowsSelected.value = rows.length === custodians.value.length && custodians.value.length > 0;
}

function onCheckboxClicked(row) {
  if (row.rowSelected) {
    grid.value.selectRow(row.index);
  } else {
    grid.value.unselectRow(row.index);
  }
}

/**
 * Select/deselect every custodian row. Fired from the header checkbox; the
 * checked arg is the checkbox's new state, which can disagree with
 * allRowsSelected when rows were selected one-by-one first.
 * @param {boolean} checked - New checked state of the header checkbox.
 */
function toggleSelectAll(checked) {
  if (checked) {
    grid.value.selectAllRows();
  } else {
    grid.value.clearSelected();
  }
}

async function searchUsers() {
  if (!userSearchQuery.value) return;
  isSearching.value = true;
  try {
    const realm = store.state.realm || 'alpha';
    const resourceType = `${realm}_user`;
    const queryParams = queryParamFunction(userSearchQuery.value, resourceType);
    const { data } = await getManagedResourceList(resourceType, queryParams);
    userSearchResults.value = (data?.result || []).map((u) => ({
      ...u,
      fullName: i18n.global.t('common.userFullName', { givenName: u.givenName || '', sn: u.sn || '' }).trim() || u.userName,
    }));
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.agents.custodiansTab.noResults'));
  } finally {
    isSearching.value = false;
  }
}

const debouncedSearchUsers = debounce(searchUsers, 300);

function clearUserSearch() {
  userSearchQuery.value = '';
  userSearchResults.value = [];
}

function isUserSelected(user) {
  return selectedUsers.value.some((u) => u._id === user._id);
}

function toggleUserSelection(user) {
  const idx = selectedUsers.value.findIndex((u) => u._id === user._id);
  if (idx === -1) {
    selectedUsers.value.push(user);
  } else {
    selectedUsers.value.splice(idx, 1);
  }
}

function onAddModalHidden() {
  userSearchQuery.value = '';
  userSearchResults.value = [];
  selectedUsers.value = [];
}

const glossaryId = computed(() => props.accountId || props.agentId);

async function addCustodians() {
  const usersToAdd = [...selectedUsers.value];
  isSaving.value = true;
  try {
    const { data: glossary } = await getAgentGlossaryAttributesData(glossaryId.value);
    const realm = store.state.realm || 'alpha';
    const existingActors = glossary?.actors || [];
    const newRefs = usersToAdd.map((u) => `managed/${realm}_user/${u._id}`);
    const mergedActors = [...new Set([...existingActors, ...newRefs])];
    await saveAgentGlossaryAttributesData(glossaryId.value, { ...glossary, actors: mergedActors });
    displayNotification('success', i18n.global.t('governance.agents.custodiansTab.addCustodianSuccess'));
    await loadPage(1);
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.agents.custodiansTab.addCustodianError'));
  } finally {
    isSaving.value = false;
  }
}

async function removeCustodians() {
  isSaving.value = true;
  try {
    const { data: glossary } = await getAgentGlossaryAttributesData(glossaryId.value);
    const idsToRemove = new Set(selectedCustodians.value.map((c) => c.id));
    const updatedActors = (glossary?.actors || []).filter((actorRef) => !idsToRemove.has(actorRef.split('/').pop()));
    await saveAgentGlossaryAttributesData(glossaryId.value, { ...glossary, actors: updatedActors });
    displayNotification('success', i18n.global.t('governance.agents.custodiansTab.removeCustodianSuccess'));
    await loadPage(1);
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.agents.custodiansTab.removeCustodianError'));
  } finally {
    isSaving.value = false;
    selectedCustodians.value = [];
  }
}

onMounted(() => loadPage(1));
</script>
