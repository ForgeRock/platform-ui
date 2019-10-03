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
              fallback="fa-tv m-auto pt-1 pb-1" />
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
            {{ $t('common.form.remove') }}
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
          {{ $t('common.form.confirm') }}
        </h6>
        <button
          type="button"
          aria-label="Close"
          class="close"
          @click="$refs.fsModal.hide()">
          <i class="fa fa-times" />
        </button>
      </div>
      {{ $t('pages.profile.trustedDevices.removeConfirmation', {deviceName: confirmDevice.name }) }}
      <div slot="modal-footer">
        <div class="float-right">
          <BBtn
            variant="outline-secondary mr-2"
            @click="$refs.fsModal.hide()">
            {{ $t('common.form.cancel') }}
          </BBtn>
          <BBtn
            type="button"
            variant="danger"
            @click="removeDevice(confirmDevice.id)">
            {{ $t('common.form.remove') }}
          </BBtn>
        </div>
      </div>
    </BModal>
  </FrListGroup>
</template>

<script>
import { mapState } from 'vuex';
import ListGroup from '@forgerock/platform-components/src/components/listGroup/';
import ListItem from '@forgerock/platform-components/src/components/listItem/';
import FallbackImage from '@/components/utils/FallbackImage';

/**
 * @description If fullstack (AM/IDM) is configured will work with authorized devices endpoiint (AM) and display a list of currently of authorized devices for the current
 * user. This will also allow a user to remove an authorized device, causing the next login session of that device to trigger the appropriate device authorization flow from AM.
 *
 */
export default {
	name: 'TrustedDevices',
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
			userId: state => state.UserStore.userId,
			amDataEndpoints: state => state.ApplicationStore.amDataEndpoints,
		}),
	},
	mounted() {
		/* istanbul ignore next */
		this.loadData();
	},
	methods: {
		loadData() {
			/* istanbul ignore next */
			const query = '?_queryId=*';
			const selfServiceInstance = this.getRequestService();
			const url = this.amDataEndpoints.baseUrl + this.userId + this.amDataEndpoints.trustedDevices + query;

			/* istanbul ignore next */
			// by default CORS requests don't allow cookies, the 'withCredentials: true' flag allows it
			selfServiceInstance.get(url, { withCredentials: true }).then((response) => {
				this.devices = response.data.result;
			})
				.catch((error) => {
					/* istanbul ignore next */
					this.displayNotification('error', error.response.data.message);
				});
		},
		showConfirmationModal(device) {
			this.confirmDevice.id = device.uuid;
			this.confirmDevice.name = device.name;
			this.$refs.fsModal.show();
		},
		removeDevice(deviceId) {
			/* istanbul ignore next */
			const selfServiceInstance = this.getRequestService();
			const url = this.amDataEndpoints.baseUrl + this.userId + this.amDataEndpoints.trustedDevices + deviceId;

			/* istanbul ignore next */
			// by default CORS requests don't allow cookies, the 'withCredentials: true' flag allows it
			selfServiceInstance.delete(url, { withCredentials: true }).then(() => {
				this.displayNotification('success', this.$t('pages.profile.trustedDevices.removeSuccess', { deviceName: this.confirmDevice.name }));
				this.loadData();
				this.$refs.fsModal.hide();
			})
				.catch((error) => {
					/* istanbul ignore next */
					this.displayNotification('error', error.response.data.message);
				});
		},
	},
};
</script>

<style scoped>
</style>
