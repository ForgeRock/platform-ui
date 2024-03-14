<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BCard
    no-body
    class="shadow-none border-0">
    <BCardHeader>
      <BRow>
        <BCol>
          <div class="d-md-inline-block mb-3 ml-md-3 mb-md-0">
            <BButton
              v-if="checkedId"
              class="text-nowrap flex-shrink-0"
              variant="outline-primary"
              block
              @click="handleDeleteDeviceRequest(checkedId)">
              {{ i18n.global.t('pages.profile.trustedDevices.remove') }}
            </BButton>
          </div>
        </BCol>
      </BRow>
    </BCardHeader>
    <BCardBody>
      <BTable
        hover
        tbody-tr-class="cursor-pointer"
        :fields="fields"
        :items="devices"
        show-empty
        @row-clicked="handleRowClicked">
        <template #empty>
          <div class="text-center my-2">
            {{ i18n.global.t('common.noRecordsToShow') }}
          </div>
        </template>
        <template #cell(selected)="data">
          <BFormCheckbox
            class="pl-3"
            :value="data.item.deviceId"
            v-model="checkedId" />
        </template>
        <template #cell(device)="data">
          <BMedia class="align-items-center">
            <template #aside>
              <div
                :data-device-type="data.item.deviceType"
                class="device device-xs mr-4" />
            </template>
            <h5>{{ data.item.alias }}</h5>
          </BMedia>
        </template>
      </BTable>
      <FrDeviceDetailsModal
        :device="selectedDevice"
        @delete-device="handleDeleteDeviceRequest" />
      <FrDeleteModal
        id="delete-device-modal"
        :is-deleting="isDeleting"
        :translated-item-type="i18n.global.t('pages.profile.trustedDevices.device')"
        @delete-item="handleDeleteItem" />
    </BCardBody>
  </BCard>
</template>

<script setup>
import {
  defineProps, onMounted, ref, watch,
} from 'vue';
import i18n from '@forgerock/platform-shared/src/i18n';
import {
  BButton, BCard, BCardBody, BCardHeader, BCol, BFormCheckbox, BMedia, BRow, BTable,
} from 'bootstrap-vue';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import FrDeleteModal from '@forgerock/platform-shared/src/components/DeleteModal';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { type } from '@forgerock/platform-shared/src/utils/typeof';
import store from '@/store';
import FrDeviceDetailsModal from './DeviceDetailsModal';
import useFetchTrustedDevices from './composables/FetchTrustedDevicesData';
import useDeleteTrustedDevice from './composables/DeleteTrustedDevice';

/**
* @description List of Trusted Devices in a Table List View
*/

const props = defineProps({
  userId: {
    type: String,
    default: '',
  },
});

const { bvModal } = useBvModal();
const { error: fetchError, fetchData } = useFetchTrustedDevices();
const { error: deleteError, deleteData, isDeleting } = useDeleteTrustedDevice();
const { realm } = store.state;

const deleteItemId = ref('');
const checkedId = ref(false);
const devices = ref([]);
const selectedDevice = ref({});

const fields = [{
  key: 'selected', label: '', sortable: false, class: 'checkbox-column',
}, {
  key: 'device', label: i18n.global.t('pages.profile.trustedDevices.device'),
}];

/**
 * Callback for when a user clicks on a row
 *
 * @param {object} row - Parameter description.
 */
function handleRowClicked(row) {
  selectedDevice.value = row;
  bvModal.value.show('device-modal');
}

/**
 * Shows the Delete modal
 *
 * @param {string} id id of device to delete
 */
function handleDeleteDeviceRequest(id) {
  deleteItemId.value = id;
  bvModal.value.hide('device-modal');
  bvModal.value.show('delete-device-modal');
}

/**
 * Deletes the currently selected Trusted Device, on complete closes the modal & fetches updated data
 */
async function handleDeleteItem() {
  await deleteData(realm, props.userId, deleteItemId.value);
  bvModal.value.hide('delete-device-modal');
  devices.value = await fetchData(realm, props.userId);
  deleteItemId.value = '';
  checkedId.value = false;
}

/**
 * Shows the error notification when a fetch error occurs
 */
watch(fetchError, (newVal) => {
  if (type(newVal) === 'AxiosError') {
    showErrorMessage(newVal, i18n.global.t('pages.profile.trustedDevices.loadDevicesError'));
  }
});

/**
 * Shows the error notification when a delete error occurs
 */
watch(deleteError, (newVal) => {
  if (type(newVal) === 'AxiosError') {
    showErrorMessage(newVal, i18n.global.t('pages.profile.trustedDevices.removeDevicesError'));
  }
});

/**
 * Mount and fetch
 */
onMounted(async () => {
  devices.value = await fetchData(realm, props.userId);
});
</script>

<style lang="scss" scoped>
  :deep {
    .checkbox-column {
      width: 15px;
      padding-right: 0;
      vertical-align: middle;
    }
  }
</style>
