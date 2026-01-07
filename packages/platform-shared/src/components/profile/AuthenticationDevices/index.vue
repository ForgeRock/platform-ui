<!-- Copyright (c) 2020-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="mt-5 w-100">
    <div class="pl-0">
      <BContainer fluid>
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
            <BCard
              no-body
              v-if="authenticationDevicesArray.length">
              <template
                v-for="(device, deviceIndex) in authenticationDevicesArray"
                :key="device.uuid">
                <BCardBody class="border-bottom">
                  <BRow class="px-4">
                    <BMedia
                      class="w-100 align-items-center"
                      no-body>
                      <FrIcon
                        icon-class="md-36 mr-3"
                        name="qr_code_scanner" />
                      <BMediaBody class="d-lg-flex justify-content-between align-items-center">
                        <div>
                          <h2 class="h5 m-0">
                            {{ getTranslation(device.deviceName) }}
                          </h2>
                          <div v-if="device.lastAccessDate">
                            <span class="text-body">
                              {{ $t('pages.authenticationDevices.lastSignIn') }}
                              <FrRelativeTime
                                :timestamp="device.lastAccessDate"
                                include-ago />
                            </span>
                          </div>
                          <div v-if="device.createdDate">
                            <span class="text-body">
                              {{ $t('pages.authenticationDevices.added') }}
                              <FrRelativeTime
                                :timestamp="device.createdDate"
                                include-ago />
                            </span>
                          </div>
                        </div>
                        <div
                          v-if="deviceIndex === 0"
                          class="px-lg-4 px-xl-5 mt-2 mt-lg-0">
                          <FrIcon
                            icon-class="mr-2 text-success"
                            name="check_circle"
                            :outlined="false">
                            <span class="text-dark">
                              {{ $t('pages.authenticationDevices.currentDevice') }}
                            </span>
                          </FrIcon>
                        </div>
                      </BMediaBody>
                      <BDropdown
                        variant="link"
                        no-caret
                        right
                        toggle-class="pr-0 text-decoration-none">
                        <template #button-content>
                          <FrIcon
                            icon-class="md-24 text-muted"
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
                    </BMedia>
                  </BRow>
                </BCardBody>
              </template>
            </BCard>
          </BCol>
        </BRow>
      </BContainer>
      <BModal
        ref="fsModal"
        no-close-on-backdrop
        no-close-on-esc
        :title="modalInfo.title"
        title-class="h5"
        title-tag="h2"
        @close="setModalData('', {})">
        <FrField
          v-if="modalType === 'edit'"
          v-model="deviceName"
          autofocus
          name="name"
          :label="$t('pages.authenticationDevices.editModalInput')" />
        <template v-else>
          {{ modalText }}
        </template>
        <template #modal-footer="{ cancel }">
          <BButton
            v-show="modalInfo.showCancel"
            variant="link"
            :class="[{ 'text-danger': modalType === 'delete' }, 'mr-2']"
            @click="cancel()">
            {{ $t('common.cancel') }}
          </BButton>
          <BButton
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
  BCard,
  BCardBody,
  BCol,
  BContainer,
  BDropdown,
  BDropdownDivider,
  BDropdownItemButton,
  BRow,
  BMedia,
  BMediaBody,
  BModal,
  BButton,
} from 'bootstrap-vue';
import { mapState } from 'pinia';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import { deleteAuthenticationDevice, getAuthenticationDevices, updateAuthenticationDevice } from '@forgerock/platform-shared/src/api/DevicesApi';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import useBreadcrumb from '@forgerock/platform-shared/src/composables/breadcrumb';
import TranslationMixin from '@forgerock/platform-shared/src/mixins/TranslationMixin';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrRelativeTime from '@forgerock/platform-shared/src/components/RelativeTime';

/**
 * @description If fullstack (AM/IDM) is configured will work with authorized devices endpoiint (AM) and display a list of currently of authorized devices for the current
 * user. This will also allow a user to remove an authorized device, causing the next login session of that device to trigger the appropriate device authorization flow from AM.
 */

const AUTH_TYPES = ['oath', 'push', 'webauthn'];

export default {
  name: 'AuthenticationDevices',
  mixins: [
    NotificationMixin,
    TranslationMixin,
  ],
  components: {
    BButton,
    BCard,
    BCardBody,
    BCol,
    BContainer,
    BDropdown,
    BDropdownDivider,
    BDropdownItemButton,
    BMedia,
    BMediaBody,
    BModal,
    BRow,
    FrField,
    FrIcon,
    FrRelativeTime,
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
    modalText() {
      switch (this.modalType) {
        case 'delete':
          return this.$t('pages.authenticationDevices.deleteModalText');
        case 'errorEdit':
          return this.$t('pages.authenticationDevices.unableToEditModalText');
        case 'errorDelete':
          return this.$t('pages.authenticationDevices.unableToDeleteModalText');
        default:
          return '';
      }
    },
  },
  methods: {
    /**
     * Add relevant dropdown objects for each authentication device
     *
     * @param {Object[]} items authentication devices
     * @returns {Object[]} authentication devices with dropdown information for each device
     */
    addDropdown(items) {
      return [...items].sort((cur, next) => next.lastAccessDate - cur.lastAccessDate).map((item) => {
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
     * Get all authentication devices for all types for a user
     */
    async loadAuthenticationDevices() {
      const authPromises = AUTH_TYPES.map((authType) => getAuthenticationDevices(this.forceRoot ? 'root' : this.$store.state.realm, this.userSearchAttribute, authType));
      try {
        const responseArray = await Promise.all(authPromises);
        const flattenedArray = responseArray.reduce((acc, response, index) => {
          const devicesWithAuthType = response.data.result.map((device) => ({ ...device, authType: AUTH_TYPES[index] }));
          return acc.concat(devicesWithAuthType);
        }, []);
        if (!flattenedArray.length) {
          this.$router.push({ path: '/profile' });
        }
        this.authenticationDevicesArray = this.addDropdown(flattenedArray);
      } catch (error) {
        this.showErrorMessage(error, this.$t('pages.authenticationDevices.loadError'));
      }
    },
    /**
     * Delete an authentication device from a user
     *
     * @param {String} authType 'oauth', 'push', or 'webauthn'
     * @param {String} id device id to remove
     */
    async deleteDevice(authType, id) {
      try {
        await deleteAuthenticationDevice(this.forceRoot ? 'root' : this.$store.state.realm, this.userSearchAttribute, authType, id);
        this.displayNotification('success', this.$t('pages.authenticationDevices.deleteSuccess'));
        this.loadAuthenticationDevices();
        this.$refs.fsModal.hide();
      } catch (error) {
        if (error.response.data.message.toUpperCase() === 'USER NOT PERMITTED.') {
          this.setModalData('errorDelete', {});
        } else {
          this.showErrorMessage(error, this.$t('pages.authenticationDevices.deleteError'));
        }
      }
    },
    /**
     * Update a device with a new name
     *
     * @param {String} authType 'oauth', 'push', or 'webauthn'
     * @param {String} id device id to update
     * @param {String} newName new device name
     */
    async updateDeviceName(authType, id, newName) {
      const payload = { deviceName: newName };
      try {
        await updateAuthenticationDevice(this.forceRoot ? 'root' : this.$store.state.realm, this.userSearchAttribute, authType, id, payload);
        this.displayNotification('success', this.$t('pages.authenticationDevices.editSuccess'));
        this.loadAuthenticationDevices();
        this.$refs.fsModal.hide();
      } catch (error) {
        if (error.response.data.message.toUpperCase() === 'USER NOT PERMITTED.') {
          this.setModalData('errorEdit', {});
        } else {
          this.showErrorMessage(error, this.$t('pages.authenticationDevices.editError'));
        }
      }
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
    this.loadAuthenticationDevices();
    this.setBreadcrumb('/profile', this.$t('routeNames.Profile'));
  },
};
</script>
