<!-- Copyright 2025-2026 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <BContainer
    fluid>
    <div class="mt-5">
      <template v-if="tableData === null">
        <FrSpinner class="py-5" />
      </template>
      <template v-else-if="tableData.length || queryFilter !== null">
        <FrHeader
          :title="$t('governance.events.listView.title')"
          :subtitle="$t('governance.events.listView.subtitle')" />
        <BCard no-body>
          <BButtonToolbar class="py-3 px-4 justify-content-between">
            <BButton
              variant="primary"
              @click="openNewEventModal">
              <FrIcon
                icon-class="mr-2"
                name="add">
                {{ $t('common.newObject', { object: $t('governance.events.event') }) }}
              </FrIcon>
            </BButton>
            <FrSearchInput
              v-model="queryFilter"
              role="searchbox"
              :placeholder="$t('common.search')"
              @clear="search('')"
              @search="search(queryFilter)"
              @search-input-blur="pressEnterToSearch = false"
              @search-input-focus="pressEnterToSearch = true">
              <template #append>
                <BInputGroupText
                  v-if="pressEnterToSearch"
                  class="border-none">
                  <small class="d-none d-md-block text-muted">
                    {{ $t('listResource.searchActiveText') }}
                  </small>
                </BInputGroupText>
              </template>
            </FrSearchInput>
          </BButtonToolbar>
          <BTable
            class="mb-0"
            v-resizable-table="{ persistKey: 'governance-events' }"
            hover
            no-local-sorting
            no-sort-reset
            responsive
            show-empty
            :empty-text="$t('common.noRecordsToShow')"
            tbody-tr-class="cursor-pointer"
            :busy="isLoading"
            :fields="tableColumns"
            :items="tableData"
            :per-page="pageSize"
            @row-clicked="navigateToEdit($event.id)"
            @sort-changed="sortChanged">
            <template #table-busy>
              <div class="text-center text-danger p-3">
                <FrSpinner />
              </div>
            </template>
            <template #cell(entityType)="{ item }">
              {{ $t(`governance.events.listView.eventTypeValue`, { entityType: capitalize(item.entityType), mutationType: $t(`governance.events.listView.${item.mutationType}`) }) }}
            </template>
            <template #cell(action)="{ item }">
              <BMedia
                class="align-items-center"
                no-body>
                <div
                  class="rounded-circle d-flex align-items-center justify-content-center mr-3 size-28"
                  :class="getClass(item.action.type)">
                  <FrIcon :name="getIcon(item.action.type)" />
                </div>
                <BMediaBody class="text-truncate">
                  <div>
                    <small class="text-body">
                      {{ $t(`governance.events.listView.${item.action.type}`) }}
                    </small>
                  </div>
                  {{ item.action.name || getDisplayNamefromName(item.action.template.name) }}
                </BMediaBody>
              </BMedia>
            </template>
            <template #cell(status)="{ item }">
              <BBadge
                v-if="item.status === 'active'"
                variant="success">
                {{ $t('common.active') }}
              </BBadge>
              <BBadge
                v-else
                variant="light">
                {{ $t('common.inactive') }}
              </BBadge>
            </template>
            <template #cell(actions)="{ item }">
              <FrActionsCell
                @delete-clicked="showDeleteConfirmModal(item.id)"
                @edit-clicked="navigateToEdit(item.id)">
                <template #custom-bottom-actions>
                  <BDropdownItem @click="toggleEvent(item.id, item.status)">
                    <template v-if="item.status === 'active'">
                      <FrIcon
                        icon-class="mr-2"
                        name="power_settings_new">
                        {{ $t('common.deactivate') }}
                      </FrIcon>
                    </template>
                    <template v-else>
                      <FrIcon
                        icon-class="mr-2"
                        name="check_circle">
                        {{ $t('common.activate') }}
                      </FrIcon>
                    </template>
                  </BDropdownItem>
                </template>
              </FrActionsCell>
            </template>
          </BTable>
          <FrPagination
            :value="currentPage"
            :total-rows="totalRows"
            :per-page="pageSize"
            @input="currentPage = $event; getData();"
            @on-page-size-change="pageSize = $event; getData();" />
        </BCard>
      </template>
      <FrNoData
        v-else
        icon="event"
        body-class="mb-5"
        :title="$t('governance.events.listView.noProperties')"
        :subtitle="$t('governance.events.listView.subtitle')">
        <BButton
          variant="primary"
          @click="openNewEventModal">
          <FrIcon
            icon-class="mr-2"
            name="add">
            {{ $t('common.newObject', { object: $t('governance.events.event') }) }}
          </FrIcon>
        </BButton>
      </FrNoData>
    </div>
    <FrNewEventModal />
    <FrDeleteModal
      :is-deleting="isUpdatingEvent"
      id="deleteEventModal"
      @hidden="hideDeleteConfirmModal"
      @delete-item="deleteEventItem"
      :translated-item-type="$t('governance.events.event')" />
    <BModal
      id="deactivateModalEvent"
      :title="$t('governance.events.listView.actions.deactivateEvent')"
      no-close-on-backdrop
      no-close-on-esc>
      <p>
        {{ $t('governance.events.listView.actions.deactivateEventConfirm') }}
      </p>
      <template #modal-footer="{ cancel }">
        <BButton
          variant="link"
          class="text-danger ml-auto mr-2"
          @click="cancel()">
          {{ $t('common.cancel') }}
        </BButton>
        <FrButtonWithSpinner
          variant="danger"
          :button-text="$t('common.deactivate')"
          :disabled="isUpdatingEvent"
          :show-spinner="isUpdatingEvent"
          :spinner-text="$t('common.deactivate')"
          @click="updateStatusEventItem('inactive')" />
      </template>
    </BModal>
  </BContainer>
</template>

<script setup>
import { capitalize } from 'lodash';
import {
  BModal,
  BBadge,
  BButton,
  BButtonToolbar,
  BCard,
  BContainer,
  BDropdownItem,
  BInputGroupText,
  BMedia,
  BMediaBody,
  BTable,
} from 'bootstrap-vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import FrActionsCell from '@forgerock/platform-shared/src/components/cells/ActionsCell';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import FrSearchInput from '@forgerock/platform-shared/src/components/SearchInput';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';
import FrDeleteModal from '@forgerock/platform-shared/src/components/DeleteModal';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner/';
import { showErrorMessage, displayNotification } from '@forgerock/platform-shared/src/utils/notification';
import { getDisplayNamefromName } from '@forgerock/platform-shared/src/views/Governance/utils/events';
import { getEventList, deleteEvent, updateEvent } from '@forgerock/platform-shared/src/api/governance/EventApi';
import FrNewEventModal from './modals/NewEvent';
import i18n from '@/i18n';

// composables
const { bvModal } = useBvModal();
const router = useRouter();

// Data
const currentPage = ref(1);
const isLoading = ref(false);
const isUpdatingEvent = ref(false);
const pageSize = ref(10);
const pressEnterToSearch = ref(false);
const queryFilter = ref(null);
let actionEventId = null;
let sortKeys = '';
const tableColumns = [
  {
    key: 'name',
    label: i18n.global.t('common.name'),
    sortable: true,
  },
  {
    key: 'entityType',
    label: i18n.global.t('governance.events.listView.eventType'),
    sortable: true,
  },
  {
    key: 'action',
    label: i18n.global.t('governance.events.listView.action'),
  },
  {
    key: 'status',
    label: i18n.global.t('common.status'),
    sortable: true,
  },
  {
    key: 'actions',
    label: i18n.global.t('common.actions'),
    class: 'w-120px fr-no-resize sticky-right',
  },
];
const tableData = ref(null);
const totalRows = ref(0);

/**
 * shows the confirm modal to delete an event
 * @param {String} eventId unique id of event
 */
function showDeleteConfirmModal(eventId) {
  actionEventId = eventId;
  bvModal.value.show('deleteEventModal');
}

/**
 * shows the confirm modal to deactivate an event
 * @param {String} eventId unique id of event
 */
function showDeactivateConfirmModal(eventId) {
  actionEventId = eventId;
  bvModal.value.show('deactivateModalEvent');
}

/**
 * hides the deactivate confirm modal
 */
function hideDeactivateConfirmModal() {
  actionEventId = null;
  bvModal.value.hide('deactivateModalEvent');
}

/**
 * hides the delete confirm modal
 */
function hideDeleteConfirmModal() {
  actionEventId = null;
  bvModal.value.hide('deleteEventModal');
}

/**
 * Returns class for event type provided
 * @param {String} EventType action type of event
 */
function getClass(EventType) {
  return EventType === 'orchestration' ? 'color-blue bg-lightblue' : 'color-yellow bg-lightyellow';
}

/**
 * Returns icon for event type provided
 * @param {String} EventType action type of event
 */
function getIcon(EventType) {
  return EventType === 'orchestration' ? 'account_tree' : 'grading';
}

/**
 * Sends off api request to pull event list data
 */
async function getData() {
  isLoading.value = true;
  const searchParams = {
    pageSize: pageSize.value,
    pagedResultsOffset: (currentPage.value - 1) * pageSize.value,
  };
  if (queryFilter.value) {
    searchParams.queryFilter = `name co '${queryFilter.value}'`;
  }
  if (sortKeys) {
    searchParams.sortKeys = sortKeys;
  }
  try {
    const { data } = await getEventList(searchParams);
    tableData.value = data.result;
    totalRows.value = data.totalCount;
  } catch (error) {
    tableData.value = [];
    showErrorMessage(error, i18n.global.t('governance.events.listView.errorGetData'));
  }
  isLoading.value = false;
}

/**
 * Deletes event using provided event id
 */
async function deleteEventItem() {
  isUpdatingEvent.value = true;
  try {
    await deleteEvent(actionEventId);
    displayNotification('success', i18n.global.t('governance.events.listView.actions.deleteEventSuccessfully'));
    getData();
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.events.listView.actions.deleteEventError'));
  }
  isUpdatingEvent.value = false;
  hideDeleteConfirmModal();
}

/**
 * Activate/Deactivate an event by passing the status
 *  * @param {String} status new status to be updated
 */
async function updateStatusEventItem(status) {
  isUpdatingEvent.value = true;
  try {
    await updateEvent(actionEventId, [{ operation: 'replace', field: '/status', value: status }]);
    const localLabel = status === 'active' ? 'activateEventSuccessfully' : 'deactivateEventSuccessfully';
    displayNotification('success', i18n.global.t(`governance.events.listView.actions.${localLabel}`));
    getData();
  } catch (error) {
    const localLabel = status === 'active' ? 'activateEventError' : 'deactivateEventError';
    showErrorMessage(error, i18n.global.t(`governance.events.listView.actions.${localLabel}`));
  }
  isUpdatingEvent.value = false;
  hideDeactivateConfirmModal();
}

/**
 * Navigates to edit view using provided event id
 * @param {String} eventId unique id of event
 */
function navigateToEdit(eventId) {
  router.push({
    name: 'GovernanceEventEdit',
    params: { eventId },
  });
}

/**
 * Toggles event between active and inactive using provided event id
 * @param {String} eventId unique id of event
 * @param {String} toggleState Whether event is currently active or inactive
 */
function toggleEvent(eventId, toggleState) {
  actionEventId = eventId;
  if (toggleState === 'active') {
    showDeactivateConfirmModal(eventId);
  } else if (toggleState === 'inactive') {
    updateStatusEventItem('active');
  }
}

/**
 * Open modal to create new event
 */
function openNewEventModal() {
  bvModal.value.show('newEventModal');
}

/**
 * Update local state of search filter and call to get updated data
 * @param {String} value Search filter value
 */
function search(value) {
  pressEnterToSearch.value = false;
  queryFilter.value = value;
  getData();
}

/**
 * Update the sorting used in the table and call to get updated data
 * @event sort-changed
 * @param {Object} sortContext Current context of table sorting
 */
function sortChanged(sortContext) {
  sortKeys = sortContext.sortDesc ? sortContext.sortBy : `-${sortContext.sortBy}`;
  getData();
}

getData();
</script>
