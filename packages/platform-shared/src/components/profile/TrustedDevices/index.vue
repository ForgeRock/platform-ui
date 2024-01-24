<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div v-if="devices.length">
    <FrAccordion
      accordion-group="trustedDevices"
      class="mb-4"
      :items="devices">
      <template #accordionHeader>
        <div class="p-4">
          <h1 class="h4">
            {{ $t('pages.profile.trustedDevices.title') }}
          </h1>
          <p class="m-0">
            {{ $t('pages.profile.trustedDevices.subtitle') }}
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
                <div class="media align-items-center">
                  <div
                    :data-device-type="slotData.deviceType"
                    class="device device-xs mr-4" />
                  <div class="media-body">
                    <h5 class="mb-0">
                      {{ slotData.alias }}
                    </h5>
                    <small
                      v-if="slotData.open$"
                      class="text-muted">
                      <a
                        href="#"
                        v-b-modal.trusted-devices-modal
                        @click.stop.prevent="setModalData('edit', slotData)">
                        {{ $t('common.edit') }}
                      </a>
                    </small>
                  </div>
                </div>
              </BCol>
              <BCol md="6">
                <span v-if="slotData.isCurrent">
                  <FrIcon
                    class="mr-2 text-success"
                    :outlined="false"
                    name="check_circle"
                  />
                  {{ $t('pages.profile.trustedDevices.currentDevice') }}
                </span>
                <span v-else>
                  {{ slotData.locality }}{{ slotData.locality && ',' }} {{ slotData.lastLogin }}
                </span>
              </BCol>
            </BRow>
          </BCol>
        </BRow>
      </template>
      <template #body="slotData">
        <FrDeviceDetails
          :device="slotData"
          @removeDevice="(slotData) => setModalData('remove', slotData)" />
      </template>
    </FrAccordion>

    <BModal
      id="trusted-devices-modal"
      ref="fsModal"
      cancel-variant="outline-secondary"
      :title="modalDevice.title"
      @close="setModalData('', {})">
      <FrField
        v-if="modalType === 'edit'"
        v-model="editModal"
        autofocus
        :label="$t('pages.profile.trustedDevices.editModalInput')" />
      <template v-if="modalType === 'remove'">
        {{ $t('pages.profile.trustedDevices.removeModalText') }}
      </template>
      <template #modal-footer="{ cancel }">
        <BButton
          variant="btn-link mr-2"
          :class="modalType === 'remove' && 'text-danger'"
          @click="cancel()">
          {{ $t('common.cancel') }}
        </BButton>
        <BButton
          :variant="modalType === 'remove' ? 'danger' : 'primary'"
          @click="handleModalPrimaryButton(modalType)">
          {{ modalDevice.primaryButtonText }}
        </BButton>
      </template>
    </BModal>
  </div>
</template>

<script>
import UAParser from 'ua-parser-js';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { get } from 'lodash';
import { mapState } from 'pinia';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import {
  BButton, BCol, BModal, BRow, VBModal,
} from 'bootstrap-vue';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import Accordion from '@forgerock/platform-shared/src/components/Accordion';
import MapMixin from '@forgerock/platform-shared/src/mixins/MapMixin';
import FrDeviceDetails from '@forgerock/platform-shared/src/components/profile/TrustedDevices/DeviceDetails';

dayjs.extend(relativeTime);

/**
 * @description If fullstack (AM/IDM) is configured will work with authorized devices endpoiint (AM) and display a list of currently of authorized devices for the current
 * user. This will also allow a user to remove an authorized device, causing the next login session of that device to trigger the appropriate device authorization flow from AM.
 *
 */

export default {
  name: 'TrustedDevices',
  mixins: [
    RestMixin,
    NotificationMixin,
    MapMixin,
  ],
  components: {
    BButton,
    BCol,
    BModal,
    BRow,
    FrAccordion: Accordion,
    FrField,
    FrIcon,
    FrDeviceDetails,
  },
  directives: {
    'b-modal': VBModal,
  },
  props: {
    /**
     * Force api calls to go to root realm
     */
    forceRoot: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      devices: [],
      modalType: null,
      modalDevice: {},
      editModal: '',
    };
  },
  computed: {
    ...mapState(useUserStore, ['userSearchAttribute']),
  },
  mounted() {
    this.loadData();
  },
  methods: {
    /**
     * Parse device data to get relevent properties
     *
     * @param {Object} deviceData device information
     * @returns {Object} relevant device information
     */
    parseDevice(deviceData) {
      const ua = get(deviceData, 'metadata.browser.userAgent', '');
      const { browser, os } = ua ? UAParser(ua) : { browser: {}, os: {} };
      const profileId = localStorage.getItem('profile-id');
      return {
        alias: deviceData.alias,
        browser: (`${get(browser, 'name', '')} ${get(browser, 'version', '')}`).trim(),
        cpu: `${get(deviceData, 'metadata.platform.platform', '')}`,
        deviceId: deviceData.identifier,
        isCurrent: deviceData.identifier === profileId,
        lastLogin: dayjs(deviceData.lastSelectedDate).fromNow(),
        lastSelectedDate: deviceData.lastSelectedDate,
        os: (`${get(os, 'name', '')} ${get(os, 'version', '')}`).trim(),
        deviceType: get(os, 'name', '').replace(/ /g, '').toLowerCase(),
      };
    },
    /**
     * Parse device location to get formatted address, locality, and map
     *
     * @param {Object} obj
     * @param {String} obj.latitude - location latitude
     * @param {String} obj.longitude - location longitude
     * @returns {Promise} Location object
     */
    parseLocation({ latitude, longitude }) {
      return new Promise((resolve) => {
        if (latitude && longitude) {
          this.reverseGeocode({ latitude, longitude })
            .then((results) => {
              const formattedAddress = results.getFormattedAddress('locality');
              const locality = results.getAddressComponent('locality');

              const urlFormatedAddress = formattedAddress.replace(/ /g, '+');
              resolve({
                formattedAddress,
                locality: locality.long_name,
                map: this.staticMap({
                  size: { width: 300, height: 200 },
                  center: urlFormatedAddress,
                  markers: urlFormatedAddress,
                  zoom: 10,
                }),
              });
            });
        } else {
          resolve({});
        }
      });
    },
    /**
     * Sort devices by lastSelected date beginning with the most recent
     *
     * @param {Object[]} devices array of device objects
     * @returns {Object[]} array of device objects sorted by lastSelectedDate
     */
    sortDevicesByDate(devices) {
      return devices.sort((cur, next) => next.lastSelectedDate - cur.lastSelectedDate);
    },
    /**
     * Set modal title, button text, and data.
     * Called when opening or closing a modal.
     *
     * @param {String} type set modal data according to type.
     * @param {Object} obj.alias device alias
     */
    setModalData(type, data) {
      this.modalType = type;
      this.modalDevice = {
        id: data.deviceId,
        index: data.index$,
      };
      switch (type) {
        case 'edit':
          this.modalDevice.title = this.$t('pages.profile.trustedDevices.editModalTitle');
          this.modalDevice.primaryButtonText = this.$t('common.save');
          this.editModal = data.alias;
          break;
        case 'remove':
          this.modalDevice.title = this.$t('pages.profile.trustedDevices.removeModalTitle', { deviceAlias: data.alias });
          this.modalDevice.primaryButtonText = this.$t('pages.profile.trustedDevices.remove');
          this.editModal = undefined;
          break;
        default:
          this.modalDevice.title = '';
          this.modalDevice.primaryButtonText = '';
          this.editModal = undefined;
          break;
      }
    },
    /**
     * Primary button function based on modal type
     * 'edit' will update device name. 'remove' will remove the device
     *
     * @param {String} type type of modal. 'edit' or 'remove'
     */
    handleModalPrimaryButton(type) {
      const { id, index } = this.modalDevice;
      const newAlias = this.editModal;
      if (type === 'edit') {
        this.updateDeviceAlias(id, newAlias, index);
      } else if (type === 'remove') {
        this.removeDevice(id);
      }
    },
    /**
     * Get devices for a user
     */
    loadData() {
      const query = '?_queryFilter=true';
      const configOptions = this.forceRoot ? { context: 'AM', realm: 'root' } : { context: 'AM' };
      const selfServiceInstance = this.getRequestService(configOptions);
      const url = `/users/${this.userSearchAttribute}/devices/profile${query}`;

      selfServiceInstance.get(url, { withCredentials: true })
        .then((response) => {
          this.devices = this.sortDevicesByDate(response.data.result)
            .map((deviceData, index) => {
              const parsedDevice = this.parseDevice(deviceData);
              const self = this;
              this.parseLocation(get(deviceData, 'location', {}))
                .then((parsedLocation) => {
                  self.$set(self.devices, index, { ...parsedDevice, ...parsedLocation });
                });
              return parsedDevice;
            });
        })
        .catch((error) => {
          this.showErrorMessage(error, this.$t('pages.profile.trustedDevices.loadDevicesError'));
        });
    },
    /**
     * Update a device with a new alias
     *
     * @param {String} id device id
     * @param {String} newAlias new device alias
     * @param {String} index index of device in local devices array
     */
    updateDeviceAlias(id, newAlias, index) {
      const configOptions = this.forceRoot ? { context: 'AM', realm: 'root' } : { context: 'AM' };
      const selfServiceInstance = this.getRequestService(configOptions);
      const url = `/users/${this.userSearchAttribute}/devices/profile/${id}`;
      const payload = { alias: newAlias };

      selfServiceInstance.put(url, payload, { withCredentials: true })
        .then((response) => {
          this.displayNotification('success', this.$t('pages.profile.trustedDevices.editSuccess'));
          this.$set(this.devices, index, { ...this.devices[index], ...this.parseDevice(response.data) });
          this.$refs.fsModal.hide();
        })
        .catch((error) => {
          this.showErrorMessage(error, this.$t('ages.profile.trustedDevices.updateDeviceAliasError'));
        });
    },
    /**
     * Remove a device from a user
     *
     * @param {String} id device id
     */
    removeDevice(id) {
      const configOptions = this.forceRoot ? { context: 'AM', realm: 'root' } : { context: 'AM' };
      const selfServiceInstance = this.getRequestService(configOptions);
      const url = `/users/${this.userSearchAttribute}/devices/profile/${id}`;

      selfServiceInstance.delete(url, { withCredentials: true })
        .then(() => {
          this.displayNotification('success', this.$t('pages.profile.trustedDevices.removeDeviceError'));
          this.loadData();
          this.$refs.fsModal.hide();
        })
        .catch((error) => {
          this.showErrorMessage(error, this.$t('common.removeDeviceError'));
        });
    },
  },
};
</script>
<style lang="scss" scoped>
.bold {
  color: $gray-900;
}

h5.small {
  color: $gray-600;
}
</style>
