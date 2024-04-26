<!-- Copyright (c) 2020-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="mt-5 w-100">
    <div class="pl-0">
      <div class="container">
        <BRow>
          <BCol
            md="8"
            offset-md="2">
            <h1>
              {{ $t('pages.authenticationDevices.title') }}
            </h1>
            <p class="mb-4">
              {{ $t('pages.authenticationDevices.subtitle') }}
            </p>
            <div
              class="card"
              v-if="authenticationDevicesArray.length">
              <template
                v-for="device in authenticationDevicesArray"
                :key="device.uuid">
                <div class="card-body border-bottom">
                  <BRow class="px-4">
                    <div class="w-100 media align-items-center">
                      <FrIcon
                        icon-class="md-24 mr-3"
                        name="stay_primary_portrait" />
                      <div class="media-body">
                        <h2 class="h5 m-0">
                          {{ getTranslation(device.deviceName) }}
                        </h2>
                      </div>
                      <BDropdown
                        variant="link"
                        no-caret
                        right
                        toggle-class="pr-0 text-decoration-none">
                        <template #button-content>
                          <FrIcon
                            icon-class="text-muted"
                            name="more_horiz" />
                        </template>
                        <template
                          v-for="(button, index) in device.dropdown"
                          :key="button.text">
                          <div>
                            <BDropdownDivider v-if="index > 0" />
                            <BDropdownItemButton @click="button.action">
                              <FrIcon
                                icon-class="text-muted mr-2"
                                :name="button.icon">
                                {{ button.text }}
                              </FrIcon>
                            </BDropdownItemButton>
                          </div>
                        </template>
                      </BDropdown>
                    </div>
                  </BRow>
                </div>
              </template>
            </div>
          </BCol>
        </BRow>
      </div>
      <BModal
        id="authentication-devices-modal"
        ref="fsModal"
        cancel-variant="outline-secondary"
        @close="setModalData('', {})">
        <template #modal-header="{ close }">
          <div class="d-flex w-100 h-100">
            <h2
              class="h5 modal-title my-0">
              {{ modalInfo.title }}
            </h2>
            <button
              type="button"
              :aria-label="$t('common.close')"
              class="close"
              @click="close()">
              <FrIcon
                icon-class="font-weight-bolder md-24 mb-1"
                name="close" />
            </button>
          </div>
        </template>
        <FrField
          v-if="modalType === 'edit'"
          v-model="deviceName"
          autofocus
          name="name"
          :label="$t('pages.authenticationDevices.editModalInput')" />
        <template
          v-if="modalType === 'delete'">
          {{ $t('pages.authenticationDevices.deleteModalText') }}
        </template>
        <template
          v-if="modalType === 'errorEdit'">
          {{ $t('pages.authenticationDevices.unableToEditModalText') }}
        </template>
        <template
          v-if="modalType === 'errorDelete'">
          {{ $t('pages.authenticationDevices.unableToDeleteModalText') }}
        </template>
        <template #modal-footer="{ cancel }">
          <BButton
            v-show="modalInfo.showCancel"
            variant="btn-link mr-2"
            :class="modalType === 'delete' && 'text-danger'"
            @click="cancel()">
            {{ $t('common.cancel') }}
          </BButton>
          <BButton
            type="button"
            :variant="modalType === 'delete' ? 'danger' : 'primary'"
            @click="handleModalPrimaryButton(modalType)">
            {{ modalInfo.primaryButtonText }}
          </BButton>
        </template>
      </BModal>
    </div>
  </div>
</template>

<script>
import {
  BCol, BDropdown, BDropdownDivider, BDropdownItemButton, BRow, BModal, BButton,
} from 'bootstrap-vue';
import { mapState } from 'pinia';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import useBreadcrumb from '@forgerock/platform-shared/src/composables/breadcrumb';
import TranslationMixin from '@forgerock/platform-shared/src/mixins/TranslationMixin';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';

/**
 * @description If fullstack (AM/IDM) is configured will work with authorized devices endpoiint (AM) and display a list of currently of authorized devices for the current
 * user. This will also allow a user to remove an authorized device, causing the next login session of that device to trigger the appropriate device authorization flow from AM.
 *
 */

const AUTH_TYPES = ['oath', 'push', 'webauthn'];

export default {
  name: 'AuthenticationDevices',
  mixins: [
    RestMixin,
    NotificationMixin,
    TranslationMixin,
  ],
  components: {
    BButton,
    BCol,
    BDropdown,
    BDropdownDivider,
    BDropdownItemButton,
    BModal,
    BRow,
    FrField,
    FrIcon,
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
  setup() {
    const { setBreadcrumb } = useBreadcrumb();
    return { setBreadcrumb };
  },
  data() {
    return {
      authenticationDevicesArray: [],
      modalType: null,
      modalItem: {},
      modalInfo: {},
      deviceName: '',
    };
  },
  computed: {
    ...mapState(useUserStore, ['userSearchAttribute']),
  },
  methods: {
    /**
     * Add relevant dropdown objects for each authentication device
     *
     * @param {Object[]} items authentication devices
     * @returns {Object[]} authentication devices with dropdown information for each device
     */
    addDropdown(items) {
      return items.map((item) => {
        const dropdownEdit = {
          icon: 'edit',
          text: this.$t('common.editName'),
          action: () => this.setModalData('edit', { ...item }),
        };
        const dropdownDelete = {
          icon: 'delete',
          text: this.$t('common.delete'),
          action: () => this.setModalData('delete', { ...item }),
        };
        const dropdown = item.authType === 'webauthn' ? [dropdownEdit, dropdownDelete] : [dropdownDelete];
        return {
          ...item,
          dropdown,
        };
      });
    },
    /**
     * Get URL for managing 2FA
     *
     * @param {String} authType 'oauth', 'push', or 'webauthn'
     * @returns {String} 2FA url
     */
    get2faUrl(authType) {
      return `/users/${this.userSearchAttribute}/devices/2fa/${authType}`;
    },
    /**
     * Get all authentication devices for all types for a user
     */
    loadAuthenicationDevices() {
      const query = '_queryId=*';
      const configOptions = this.forceRoot ? { context: 'AM', realm: 'root' } : { context: 'AM' };
      const selfServiceInstance = this.getRequestService(configOptions);

      const authPromises = AUTH_TYPES.map((authType) => {
        const url = `${this.get2faUrl(authType)}?${query}`;
        return selfServiceInstance.get(url, { withCredentials: true });
      });
      Promise.all(authPromises)
        .then((responseArray) => {
          const flattenedArray = responseArray.reduce((acc, response, index) => {
            const devicesWithAuthType = response.data.result.map((device) => ({ ...device, authType: AUTH_TYPES[index] }));
            return acc.concat(devicesWithAuthType);
          }, []);
          if (!flattenedArray.length) {
            this.$router.push({ path: '/profile' });
          }
          this.authenticationDevicesArray = this.addDropdown(flattenedArray);
        });
    },
    /**
     * Delete an authentication device from a user
     *
     * @param {String} authType 'oauth', 'push', or 'webauthn'
     * @param {String} id device id to remove
     */
    deleteDevice(authType, id) {
      const configOptions = this.forceRoot ? { context: 'AM', realm: 'root' } : { context: 'AM' };
      const selfServiceInstance = this.getRequestService(configOptions);
      const url = `${this.get2faUrl(authType)}/${id}`;

      selfServiceInstance.delete(url, { withCredentials: true })
        .then(() => {
          this.displayNotification('success', this.$t('pages.authenticationDevices.deleteSuccess'));
          this.loadAuthenicationDevices();
          this.$refs.fsModal.hide();
        })
        .catch((error) => {
          if (error.response.data.message.toUpperCase() === 'USER NOT PERMITTED.') {
            this.setModalData('errorDelete', {});
          } else {
            this.showErrorMessage(error, this.$t('pages.authenticationDevices.deleteError'));
          }
        });
    },
    /**
     * Update a device with a new name
     *
     * @param {String} authType 'oauth', 'push', or 'webauthn'
     * @param {String} id device id to update
     * @param {String} newName new device name
     */
    updateDeviceName(authType, id, newName) {
      const configOptions = this.forceRoot ? { context: 'AM', realm: 'root' } : { context: 'AM' };
      const selfServiceInstance = this.getRequestService(configOptions);
      const url = `${this.get2faUrl(authType)}/${id}`;
      const payload = { deviceName: newName };

      selfServiceInstance.put(url, payload, { withCredentials: true })
        .then(() => {
          this.displayNotification('success', this.$t('pages.authenticationDevices.editSuccess'));
          this.loadAuthenicationDevices();
          this.$refs.fsModal.hide();
        })
        .catch((error) => {
          if (error.response.data.message.toUpperCase() === 'USER NOT PERMITTED.') {
            this.setModalData('errorEdit', {});
          } else {
            this.showErrorMessage(error, this.$t('pages.authenticationDevices.editError'));
          }
        });
    },
    /**
     * Set data for modal based on modal type and device data
     * Shows the modal after setting the data.
     *
     * @param {String} type modal type
     * @param {Object} data device data
     * @param {String} data.alias device name
     */
    setModalData(type, data) {
      this.modalType = type;
      this.modalItem = { ...data };
      switch (type) {
        case 'delete':
          this.modalInfo.title = this.$t('pages.authenticationDevices.deleteModalTitle', { deviceAlias: data.alias });
          this.modalInfo.primaryButtonText = this.$t('pages.authenticationDevices.delete');
          this.modalInfo.showCancel = true;
          this.deviceName = undefined;
          break;
        case 'edit':
          this.modalInfo.title = this.$t('pages.authenticationDevices.editModalTitle');
          this.modalInfo.primaryButtonText = this.$t('common.save');
          this.modalInfo.showCancel = true;
          this.deviceName = data.deviceName;
          break;
        case 'errorEdit':
          this.modalInfo.title = this.$t('pages.authenticationDevices.unableToEditModalTitle');
          this.modalInfo.primaryButtonText = this.$t('common.done');
          this.modalInfo.showCancel = false;
          this.deviceName = undefined;
          break;
        case 'errorDelete':
          this.modalInfo.title = this.$t('pages.authenticationDevices.unableToDeleteModalTitle');
          this.modalInfo.primaryButtonText = this.$t('common.done');
          this.modalInfo.showCancel = false;
          this.deviceName = undefined;
          break;
        default:
          this.modalInfo.title = '';
          this.modalInfo.primaryButtonText = '';
          this.deviceName = undefined;
          break;
      }
      this.$refs.fsModal.show();
    },
    /**
     * Handler for the primary modal button. Functionality changes based on modal type
     *
     * @param {type} type modal type
     */
    handleModalPrimaryButton(type) {
      const { uuid, authType } = this.modalItem;
      const newName = this.deviceName;
      if (type === 'edit') {
        this.updateDeviceName(authType, uuid, newName);
      } else if (type === 'delete') {
        this.deleteDevice(authType, uuid);
      } else if (type === 'errorDelete' || type === 'errorEdit') {
        this.$refs.fsModal.hide();
      }
    },
  },
  mounted() {
    this.loadAuthenicationDevices();
    this.setBreadcrumb('/profile', this.$t('routeNames.Profile'));
  },
};
</script>
