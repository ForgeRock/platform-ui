<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrAccordion
    accordion-group="trustedDevices"
    class="mb-4"
    :items="devices"
    @section-expanded="handleSectionExpanded">
    <template #accordionHeader>
      <div class="p-4">
        <h2 class="h4">
          {{ i18n.global.t('pages.profile.trustedDevices.title') }}
        </h2>
        <p class="m-0">
          {{ i18n.global.t('pages.profile.trustedDevices.subtitle') }}
        </p>
      </div>
    </template>
    <template #header="slotData">
      <BRow>
        <BCol
          cols="10">
          <BRow class="align-items-center">
            <BCol
              md="6">
              <BMedia
                class="align-items-center"
                no-body>
                <div
                  :data-device-type="slotData.deviceType"
                  data-testid="device-type"
                  class="device device-xs mr-4" />
                <BMediaBody>
                  <h3 class="h5 mb-0">
                    {{ slotData.alias }}
                  </h3>
                  <BButton
                    class="p-0"
                    variant="link"
                    v-if="slotData.open$"
                    @click.stop="handleEditButtonClick"
                    @keydown.enter.stop="handleEditButtonClick"
                    @keydown.space.prevent.stop="handleEditButtonClick">
                    {{ i18n.global.t('common.edit') }}
                  </BButton>
                </BMediaBody>
              </BMedia>
            </BCol>
            <BCol md="6">
              <span
                v-if="slotData.isCurrent"
                data-testid="current-item">
                <FrIcon
                  icon-class="mr-2 text-success"
                  :outlined="false"
                  name="check_circle">
                  {{ i18n.global.t('pages.profile.trustedDevices.currentDevice') }}
                </FrIcon>
              </span>
              <span
                v-else
                data-testid="locality-item">
                {{ slotData.locality }}{{ slotData.locality && ',' }} {{ slotData.lastLogin }}
              </span>
            </BCol>
          </BRow>
        </BCol>
      </BRow>
    </template>
    <template #body="slotData">
      <FrDeviceDetails :device="slotData" />
      <div
        class="d-flex justify-content-start"
        v-if="!slotData.isCurrent">
        <BButton
          variant="outline-danger"
          class="w-100"
          @click="handleDeleteButtonClick">
          <FrIcon
            icon-class="mr-2"
            name="block">
            {{ i18n.global.t('pages.profile.trustedDevices.remove') }}
          </FrIcon>
        </BButton>
      </div>
    </template>
  </FrAccordion>
  <FrDeleteModal
    id="delete-device-modal"
    :is-deleting="isDeleting"
    :translated-item-type="i18n.global.t('pages.profile.trustedDevices.device')"
    @delete-item="handleDeleteItem" />
  <FrEditTrustedDeviceModal
    :is-saving="isSaving"
    :device-alias="deviceAlias"
    @save-device="handleEditItem" />
</template>

<script setup>
import {
  computed, onMounted, ref, watch,
} from 'vue';
import {
  BButton, BRow, BCol, BMedia, BMediaBody,
} from 'bootstrap-vue';
import FrAccordion from '@forgerock/platform-shared/src/components/Accordion';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import i18n from '@forgerock/platform-shared/src/i18n';
import FrDeviceDetails from '@forgerock/platform-shared/src/components/profile/TrustedDevices/DeviceDetails';
import FrDeleteModal from '@forgerock/platform-shared/src/components/DeleteModal';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import { type } from '@forgerock/platform-shared/src/utils/typeof';
import store from '@/store';
import FrEditTrustedDeviceModal from './EditTrustedDeviceModal';
import useFetchTrustedDevices from './composables/FetchTrustedDevicesData';
import useDeleteTrustedDevice from './composables/DeleteTrustedDevice';
import useEditTrustedDevice from './composables/EditTrustedDevice';

/**
* @description List of Trusted Devices in an Accordion Component
*/

const props = defineProps({
  // Used for admin user
  forceRootRealm: {
    type: Boolean,
    default: false,
  },
});

const devices = ref([]);
const selectedIndex = ref();
const realm = props.forceRootRealm ? 'root' : store.state.realm;

const { bvModal } = useBvModal();
const { userSearchAttribute } = useUserStore();
const { error: fetchError, fetchData } = useFetchTrustedDevices();
const { error: deleteError, deleteData, isDeleting } = useDeleteTrustedDevice();
const { error: editError, editData, isSaving } = useEditTrustedDevice();

const deviceId = computed(() => devices.value[selectedIndex.value]?.deviceId);
const deviceAlias = computed(() => devices.value[selectedIndex.value]?.alias);

/**
 * Shows the Delete modal
 */
function handleDeleteButtonClick() {
  bvModal.value.show('delete-device-modal');
}

/**
 * Shows the Edit modal
 */
function handleEditButtonClick() {
  bvModal.value.show('edit-trusted-device-modal');
}

/**
 * Deletes the currently selected Trusted Device
 */
async function handleDeleteItem() {
  await deleteData(realm, userSearchAttribute, deviceId.value);
  bvModal.value.hide('delete-device-modal');
  devices.value = await fetchData(realm, userSearchAttribute);
}

/**
 * Updates the Trusted Device alias
 *
 * @param {string} newName - Updated name from edit modal
 */
async function handleEditItem(newName) {
  await editData(realm, userSearchAttribute, { alias: newName }, deviceId.value);
  bvModal.value.hide('edit-trusted-device-modal');
  devices.value = await fetchData(realm, userSearchAttribute);
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
 * Shows the error notification when a delete error occurs
 */
watch(editError, (newVal) => {
  if (type(newVal) === 'AxiosError') {
    showErrorMessage(newVal, i18n.global.t('pages.profile.trustedDevices.updateDeviceAliasError'));
  }
});

/**
 * Sets the currently selected accordion item's index
 *
 * @param {{key: string}} deviceData - Parameter description.
 */
function handleSectionExpanded({ key }) {
  selectedIndex.value = key;
}

onMounted(async () => {
  const deviceData = await fetchData(realm, userSearchAttribute);
  if (Array.isArray(deviceData)) {
    devices.value = deviceData;
  }
});
</script>
