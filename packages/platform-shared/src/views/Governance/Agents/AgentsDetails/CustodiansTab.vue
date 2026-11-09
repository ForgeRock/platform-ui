<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BCard
    no-body>
    <BCardHeader
      v-if="readOnly"
      class="p-0">
      <h5 class="p-3 mb-0">
        {{ $t('governance.agents.custodians') }}
      </h5>
    </BCardHeader>
    <BCardHeader
      v-else
      class="p-0">
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
    <div v-if="isLoading || isSaving">
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
        :selectable="!readOnly"
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
    v-if="!readOnly"
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
    <FrGovResourceMultiselect
      name="custodian-select"
      resource="user"
      :label="$t('governance.agents.custodiansTab.selectUsers')"
      :option-function="getDefaultGovOption"
      :value="selectedUsers"
      @input="selectedUsers = $event" />
  </BModal>

  <!-- Remove Custodians Confirmation Modal -->
  <BModal
    v-if="!readOnly"
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
import {
  BButton,
  BButtonToolbar,
  BCard,
  BCardHeader,
  BFormCheckbox,
  BImg,
  BMedia,
  BMediaBody,
  BModal,
  BTable,
} from 'bootstrap-vue';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrGovResourceMultiselect from '@forgerock/platform-shared/src/components/governance/GovResourceMultiselect';
import { getDefaultGovOption } from '@forgerock/platform-shared/src/utils/governance/select';
import { displayNotification, showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { getAgentCustodians, getAgentGlossaryAttributesData, saveAgentGlossaryAttributesData } from '@forgerock/platform-shared/src/api/governance/AgentApi';
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
  readOnly: {
    type: Boolean,
    default: false,
  },
});

const { bvModal } = useBvModal();

const isLoading = ref(true);
const isSaving = ref(false);
const custodians = ref([]);
const totalCount = ref(0);
const currentPage = ref(1);
const pageSize = 10;
const grid = ref(null);
const selectedCustodians = ref([]);
const allRowsSelected = ref(false);
const selectedUsers = ref([]);

const baseFields = [
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
// The checkbox column only exists in edit mode; read-only tables show data columns alone.
const fields = computed(() => (props.readOnly
  ? baseFields
  : [
    {
      key: 'selected',
      label: '',
      class: 'checkbox-column',
    },
    ...baseFields,
  ]));

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

function onAddModalHidden() {
  selectedUsers.value = [];
}

const glossaryId = computed(() => props.accountId || props.agentId);

async function addCustodians() {
  const usersToAdd = [...selectedUsers.value];
  isSaving.value = true;
  try {
    const { data: glossary } = await getAgentGlossaryAttributesData(glossaryId.value);
    const existingActors = glossary?.actors || [];
    // Same ref format as the glossary editor's object selects (managed/user/<id>), realm-independent
    const newRefs = usersToAdd.map((id) => `managed/user/${id}`);
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
