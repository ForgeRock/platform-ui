<!--
Copyright (c) 2020 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details.
-->
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
                v-for="device in authenticationDevicesArray">
                <div
                  :key="device.uuid"
                  class="card-body border-bottom">
                  <BRow class="px-4">
                    <div class="w-100 media align-items-center">
                      <i
                        class="material-icons-outlined md-24 mr-3">
                        stay_primary_portrait
                      </i>
                      <div class="media-body">
                        <h5 class="m-0">
                          {{ device.deviceName }}
                        </h5>
                      </div>
                      <BDropdown
                        variant="link"
                        no-caret
                        right
                        toggle-class="pr-0 text-decoration-none">
                        <template #button-content>
                          <i class="material-icons-outlined text-muted">
                            more_horiz
                          </i>
                        </template>
                        <template
                          v-for="(button, index) in device.dropdown">
                          <div
                            :key="button.text">
                            <BDropdownDivider v-if="index > 0" />
                            <BDropdownItemButton @click="button.action">
                              <i class="material-icons-outlined text-muted mr-2">
                                {{ button.icon }}
                              </i>
                              {{ button.text }}
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
        <template v-slot:modal-header="{ close }">
          <div class="d-flex w-100 h-100">
            <h5
              class="modal-title my-0">
              {{ modalInfo.title }}
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
        <template v-slot:modal-footer="{ cancel }">
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
  BCol, BDropdown, BDropdownDivider, BDropdownItemButton, BRow,
} from 'bootstrap-vue';
import { mapState } from 'vuex';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import BreadcrumbMixin from '@forgerock/platform-shared/src/mixins/BreadcrumbMixin';
import Field from '@forgerock/platform-shared/src/components/Field';

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
    BreadcrumbMixin,
  ],
  components: {
    BCol,
    BDropdown,
    BDropdownDivider,
    BDropdownItemButton,
    BRow,
    FrField: Field,
  },
  data() {
    return {
      authenticationDevicesArray: [],
      modalType: null,
      modalItem: {},
      modalInfo: {},
      editModal: {
        key: 'name',
        type: 'text',
        title: this.$t('pages.authenticationDevices.editModalInput'),
        value: '',
      },
    };
  },
  computed: {
    ...mapState({
      userId: (state) => state.UserStore.userSearchAttribute,
    }),
  },
  methods: {
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
    get2faUrl(authType) {
      return `/users/${this.userId}/devices/2fa/${authType}`;
    },
    loadAuthenicationDevices() {
      const query = '_queryId=*';
      const selfServiceInstance = this.getRequestService({ context: 'AM' });

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
          this.authenticationDevicesArray = this.addDropdown(flattenedArray);
        });
    },
    deleteDevice(authType, id) {
      const selfServiceInstance = this.getRequestService({ context: 'AM' });
      const url = `${this.get2faUrl(authType)}/${id}`;

      selfServiceInstance.delete(url, { withCredentials: true })
        .then(() => {
          this.displayNotification('IDMMessages', 'success', this.$t('pages.authenticationDevices.deleteSuccess'));
          this.loadAuthenicationDevices();
          this.$refs.fsModal.hide();
        })
        .catch((error) => {
          if (error.response.data.message.toUpperCase() === 'USER NOT PERMITTED.') {
            this.setModalData('errorDelete', {});
          } else {
            this.displayNotification('IDMMessages', 'error', error.response.data.message);
          }
        });
    },
    updateDeviceName(authType, id, newName) {
      const selfServiceInstance = this.getRequestService({ context: 'AM' });
      const url = `${this.get2faUrl(authType)}/${id}`;
      const payload = { deviceName: newName };

      selfServiceInstance.put(url, payload, { withCredentials: true })
        .then(() => {
          this.displayNotification('IDMMessages', 'success', this.$t('pages.authenticationDevices.editSuccess'));
          this.loadAuthenicationDevices();
          this.$refs.fsModal.hide();
        })
        .catch((error) => {
          if (error.response.data.message.toUpperCase() === 'USER NOT PERMITTED.') {
            this.setModalData('errorEdit', {});
          } else {
            this.displayNotification('IDMMessages', 'error', error.response.data.message);
          }
        });
    },
    setModalData(type, data) {
      this.modalType = type;
      this.modalItem = { ...data };
      switch (type) {
      case 'delete':
        this.modalInfo.title = this.$t('pages.authenticationDevices.deleteModalTitle', { deviceAlias: data.alias });
        this.modalInfo.primaryButtonText = this.$t('pages.authenticationDevices.delete');
        this.modalInfo.showCancel = true;
        this.editModal.value = undefined;
        break;
      case 'edit':
        this.modalInfo.title = this.$t('pages.authenticationDevices.editModalTitle');
        this.modalInfo.primaryButtonText = this.$t('common.save');
        this.modalInfo.showCancel = true;
        this.editModal.value = data.deviceName;
        break;
      case 'errorEdit':
        this.modalInfo.title = this.$t('pages.authenticationDevices.unableToEditModalTitle');
        this.modalInfo.primaryButtonText = this.$t('common.done');
        this.modalInfo.showCancel = false;
        this.editModal.value = undefined;
        break;
      case 'errorDelete':
        this.modalInfo.title = this.$t('pages.authenticationDevices.unableToDeleteModalTitle');
        this.modalInfo.primaryButtonText = this.$t('common.done');
        this.modalInfo.showCancel = false;
        this.editModal.value = undefined;
        break;
      default:
        this.modalInfo.title = '';
        this.modalInfo.primaryButtonText = '';
        this.editModal.value = undefined;
        break;
      }
      this.$bvModal.show('authentication-devices-modal');
    },
    handleModalPrimaryButton(type) {
      const { uuid, authType } = this.modalItem;
      const newName = this.editModal.value;
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
