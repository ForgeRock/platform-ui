<!--
Copyright (c) 2020 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details.
-->

<template>
  <div v-if="devices.length">
    <FrAccordion
      class="mb-4"
      :items="devices"
      accordion-group="trustedDevices">
      <template v-slot:accordionHeader>
        <div class="p-4">
          <h4>
            {{ $t('pages.profile.trustedDevices.title') }}
          </h4>
          <p class="m-0">
            {{ $t('pages.profile.trustedDevices.subtitle') }}
          </p>
        </div>
      </template>
      <template
        v-slot:header="slotData">
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
              <BCol
                md="6">
                <span v-if="slotData.isCurrent">
                  <i class="material-icons mr-2 text-success">
                    check_circle
                  </i>
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
      <template v-slot:body="slotData">
        <BRow>
          <BCol
            v-if="slotData.map"
            md="5">
            <div class="w-100">
              <div class="mb-2">
                <small>{{ $t('pages.profile.trustedDevices.recentActivity') }}</small>
              </div>
              <img
                class="mb-3 w-100"
                :src="slotData.map">
              <div class="media">
                <i class="material-icons-outlined mr-2 mt-1 text-muted">
                  place
                </i>
                <div class="media-body">
                  <div class="bold">
                    {{ slotData.formattedAddress }}
                  </div>
                  <p class="text-muted">
                    {{ slotData.lastLogin }}
                  </p>
                </div>
              </div>
            </div>
          </BCol>
          <BCol>
            <div>
              <div
                v-if="slotData.os"
                class="mb-3">
                <small>{{ $t('pages.profile.trustedDevices.os') }}</small>
                <p class="bold">
                  {{ slotData.os }}
                </p>
              </div>
              <div
                v-if="slotData.browser"
                class="mb-3">
                <small>{{ $t('pages.profile.trustedDevices.browser') }}</small>
                <p class="bold">
                  {{ slotData.browser }}
                </p>
              </div>
              <div v-if="slotData.cpu">
                <small>{{ $t('pages.profile.trustedDevices.cpu') }}</small>
                <p class="bold">
                  {{ slotData.cpu }}
                </p>
              </div>
            </div>
          </BCol>
        </BRow>
        <div
          class="d-flex justify-content-start"
          v-if="!slotData.isCurrent">
          <BButton
            variant="outline-danger"
            class="w-100"
            v-b-modal.trusted-devices-modal
            @click="setModalData('remove', slotData)">
            <i class="material-icons-outlined mr-2">
              block
            </i> {{ $t('pages.profile.trustedDevices.remove') }}
          </BButton>
        </div>
      </template>
    </FrAccordion>

    <BModal
      id="trusted-devices-modal"
      ref="fsModal"
      cancel-variant="outline-secondary"
      @close="setModalData('', {})">
      <template v-slot:modal-header="{ close }">
        <div class="d-flex w-100 h-100">
          <h5
            class="modal-title my-0">
            {{ modalDevice.title }}
          </h5>
          <button
            type="button"
            aria-label="Close"
            class="close"
            @click="close()">
            <i class="material-icons-outlined font-weight-bolder md-24 mb-1">
              close
            </i>
          </button>
        </div>
      </template>
      <FrField
        v-if="modalType === 'edit'"
        :field="editModal"
        :autofocus="true" />
      <template
        v-if="modalType === 'remove'">
        {{ $t('pages.profile.trustedDevices.removeModalText') }}
      </template>
      <template v-slot:modal-footer="{ cancel }">
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

import { mapState } from 'vuex';
import {
  BButton, BCol, BModal, BRow,
} from 'bootstrap-vue';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import Field from '@forgerock/platform-shared/src/components/Field';
import Accordion from '@forgerock/platform-shared/src/components/Accordion';
import MapMixin from '@forgerock/platform-shared/src/mixins/MapMixin';

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
    FrField: Field,
  },
  data() {
    return {
      devices: [],
      modalType: null,
      modalDevice: {},
      editModal: {
        key: 'name',
        type: 'text',
        title: this.$t('pages.profile.trustedDevices.editModalInput'),
        value: '',
      },
    };
  },
  computed: {
    ...mapState({
      userId: (state) => state.UserStore.userSearchAttribute,
    }),
  },
  mounted() {
    this.loadData();
  },
  methods: {
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
    sortDevicesByDate(devices) {
      return devices.sort((cur, next) => next.lastSelectedDate - cur.lastSelectedDate);
    },
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
        this.editModal.value = data.alias;
        break;
      case 'remove':
        this.modalDevice.title = this.$t('pages.profile.trustedDevices.removeModalTitle', { deviceAlias: data.alias });
        this.modalDevice.primaryButtonText = this.$t('pages.profile.trustedDevices.remove');
        this.editModal.value = undefined;
        break;
      default:
        this.modalDevice.title = '';
        this.modalDevice.primaryButtonText = '';
        this.editModal.value = undefined;
        break;
      }
    },
    handleModalPrimaryButton(type) {
      const { id, index } = this.modalDevice;
      const newAlias = this.editModal.value;
      if (type === 'edit') {
        this.updateDeviceAlias(id, newAlias, index);
      } else if (type === 'remove') {
        this.removeDevice(id);
      }
    },
    loadData() {
      const query = '?_queryFilter=true';
      const selfServiceInstance = this.getRequestService({ context: 'AM' });
      const url = `/users/${this.userId}/devices/profile${query}`;

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
          this.displayNotification('IDMMessages', 'error', error.response.data.message);
        });
    },
    updateDeviceAlias(id, newAlias, index) {
      const selfServiceInstance = this.getRequestService({ context: 'AM' });
      const url = `/users/${this.userId}/devices/profile/${id}`;
      const payload = { alias: newAlias };

      selfServiceInstance.put(url, payload, { withCredentials: true })
        .then((response) => {
          this.displayNotification('IDMMessages', 'success', this.$t('pages.profile.trustedDevices.editSuccess'));
          this.$set(this.devices, index, { ...this.devices[index], ...this.parseDevice(response.data) });
          this.$refs.fsModal.hide();
        })
        .catch((error) => {
          this.displayNotification('IDMMessages', 'error', error.response.data.message);
        });
    },

    removeDevice(id) {
      const selfServiceInstance = this.getRequestService({ context: 'AM' });
      const url = `/users/${this.userId}/devices/profile/${id}`;

      selfServiceInstance.delete(url, { withCredentials: true })
        .then(() => {
          this.displayNotification('IDMMessages', 'success', this.$t('pages.profile.trustedDevices.removeSuccess'));
          this.loadData();
          this.$refs.fsModal.hide();
        })
        .catch((error) => {
          this.displayNotification('IDMMessages', 'error', error.response.data.message);
        });
    },
  },
};
</script>
<style lang="scss" scoped>
.bold {
  color: $gray-900;
}
</style>
