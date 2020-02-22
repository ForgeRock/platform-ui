<!-- Copyright 2019 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <FrListGroup
    v-show="devices"
    :title="$t('pages.profile.trustedDevices.title')"
    :subtitle="$t('pages.profile.trustedDevices.subtitle')">
    <template v-if="devices.length > 0">
      <FrListItem
        v-for="(device, id) in devices"
        :key="id"
        :collapsible="false"
        :panel-shown="false">
        <div
          slot="list-item-header"
          class="d-inline-flex w-100">
          <div class="d-flex mr-3 align-self-top">
            <FrFallbackImage
              :src="device.logo_uri"
              fallback="close"
              input-class="m-auto pt-1 pb-1 font-weight-bolder md-36" />
          </div>
          <div class="flex-grow-1">
            <div>
              {{ device.name }}
            </div>
            <small class="text-muted subtext">
              {{ device.lastSelectedDate }}
            </small>
          </div>
          <a
            class="align-self-center flex-grow-2 text-right"
            @click.prevent="showConfirmationModal(device)"
            href="#">
            {{ $t('common.remove') }}
          </a>
        </div>
      </FrListItem>
    </template>
    <template v-else>
      <BListGroupItem class="noncollapse text-center">
        {{ $t('pages.profile.trustedDevices.noDevices') }}
      </BListGroupItem>
    </template>

    <BModal
      id="trustedDevicesConfirmationModal"
      class=""
      ref="fsModal"
      cancel-variant="outline-secondary">
      <div
        slot="modal-header"
        class="d-flex w-100 h-100">
        <h6 class="my-0">
          {{ $t('common.confirm') }}
        </h6>
        <button
          type="button"
          aria-label="Close"
          class="close"
          @click="$refs.fsModal.hide()">
          <i class="material-icons-outlined font-weight-bolder md-24 mb-1">
            close
          </i>
        </button>
      </div>
      {{ $t('pages.profile.trustedDevices.removeConfirmation', {deviceName: confirmDevice.name }) }}
      <div slot="modal-footer">
        <div class="float-right">
          <BBtn
            variant="outline-secondary mr-2"
            @click="$refs.fsModal.hide()">
            {{ $t('common.cancel') }}
          </BBtn>
          <BBtn
            type="button"
            variant="danger"
            @click="removeDevice(confirmDevice.id)">
            {{ $t('common.remove') }}
          </BBtn>
        </div>
      </div>
    </BModal>
  </FrListGroup>
</template>

<script>
import { mapState } from 'vuex';
import ListGroup from '@forgerock/platform-shared/src/components/ListGroup/';
import ListItem from '@forgerock/platform-shared/src/components/ListItem/';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import FallbackImage from '@/components/utils/FallbackImage';

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
  ],
  components: {
    FrListGroup: ListGroup,
    FrListItem: ListItem,
    FrFallbackImage: FallbackImage,
  },
  data() {
    return {
      devices: {},
      confirmDevice: {
        name: '',
        id: null,
      },
    };
  },
  computed: {
    ...mapState({
      userId: (state) => state.UserStore.userId,
    }),
  },
  mounted() {
    this.loadData();
  },
  methods: {
    loadData() {
      const query = '?_queryId=*';
      const selfServiceInstance = this.getRequestService();
      // TODO This will fail until updated
      const url = `${query}`; // this.amDataEndpoints.baseUrl + this.userId + this.amDataEndpoints.trustedDevices + query;

      // by default CORS requests don't allow cookies, the 'withCredentials: true' flag allows it
      selfServiceInstance.get(url, { withCredentials: true }).then((response) => {
        this.devices = response.data.result;
      })
        .catch((error) => {
          this.displayNotification('IDMMessages', 'error', error.response.data.message);
        });
    },
    showConfirmationModal(device) {
      this.confirmDevice.id = device.uuid;
      this.confirmDevice.name = device.name;
      this.$refs.fsModal.show();
    },
    removeDevice(deviceId) {
      const selfServiceInstance = this.getRequestService();
      // TODO This will fail until fixed
      const url = `${deviceId}`; // this.amDataEndpoints.baseUrl + this.userId + this.amDataEndpoints.trustedDevices + deviceId;

      // by default CORS requests don't allow cookies, the 'withCredentials: true' flag allows it
      selfServiceInstance.delete(url, { withCredentials: true }).then(() => {
        this.displayNotification('IDMMessages', 'success', this.$t('pages.profile.trustedDevices.removeSuccess', { deviceName: this.confirmDevice.name }));
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
