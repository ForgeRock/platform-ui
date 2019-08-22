<template>
  <FrListGroup
    v-show="oauthApplications"
    :title="$t('pages.profile.oauthApplications.title')"
    :subtitle="$t('pages.profile.oauthApplications.subtitle')">
    <template v-if="oauthApplications.length > 0">
      <FrListItem
        v-for="(application, id) in oauthApplications"
        :key="id"
        :collapsible="false"
        :panel-shown="false">
        <div
          slot="list-item-header"
          class="d-inline-flex w-100">
          <div class="d-flex mr-3 align-self-top">
            <img
              :src="application.logo_uri || require('@/assets/images/authorized-app.svg')"
              width="25">
          </div>
          <div class="flex-grow-1">
            <div>
              {{ application._id }}
            </div>
            <small class="text-muted subtext">
              {{ $t('pages.profile.oauthApplications.expires') }} {{ new Date(application.expiryDateTime).toUTCString() }}
            </small>
          </div>
          <a
            class="align-self-center flex-grow-2 text-right"
            @click.prevent="showConfirmationModal(application)"
            href="#">
            {{ $t('common.form.remove') }}
          </a>
        </div>
      </FrListItem>
    </template>
    <template v-else>
      <BListGroupItem class="noncollapse text-center">
        {{ $t('pages.profile.oauthApplications.noApplications') }}
      </BListGroupItem>
    </template>

    <BModal
      id="authAppConfirmationModal"
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
      {{ $t('pages.profile.oauthApplications.removeConfirmation', {applicationName: confirmApplication.name }) }}
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
            @click="removeApplication(confirmApplication.id)">
            {{ $t('common.form.remove') }}
          </BBtn>
        </div>
      </div>
    </BModal>
  </FrListGroup>
</template>

<script>
import ListGroup from '@/components/utils/ListGroup';
import ListItem from '@/components/utils/ListItem';

/**
* @description If fullstack (AM/IDM) is configured will work with authorized applications endpoiint (AM) and display a list of currently tied applications.
* It is possible to also remove these applications though if you attempt to remove openIDM it will always re-add since this is needed to ensure fullstack works.
*
*/
export default {
	name: 'AuthorizedApplications',
	components: {
		FrListGroup: ListGroup,
		FrListItem: ListItem,
	},
	data() {
		return {
			oauthApplications: {},
			confirmApplication: {
				name: '',
				id: null,
			},
		};
	},
	mounted() {
		/* istanbul ignore next */
		this.loadData();
	},
	methods: {
		loadData() {
			/* istanbul ignore next */
			const { userId } = this.$root.userStore.state;
			const query = '?_queryId=*';
			const selfServiceInstance = this.getRequestService();
			const url = this.$root.applicationStore.state.amDataEndpoints.baseUrl + userId + this.$root.applicationStore.state.amDataEndpoints.oauthApplications + query;

			/* istanbul ignore next */
			// by default CORS requests don't allow cookies, the 'withCredentials: true' flag allows it
			selfServiceInstance.get(url, { withCredentials: true }).then((response) => {
				this.oauthApplications = response.data.result;
			})
				.catch((error) => {
					/* istanbul ignore next */
					this.displayNotification('error', error.response.data.message);
				});
		},
		showConfirmationModal(application) {
			// eslint-disable-next-line no-underscore-dangle
			this.confirmApplication.id = application._id;
			this.$refs.fsModal.show();
		},
		removeApplication(applicationId) {
			/* istanbul ignore next */
			const { userId } = this.$root.userStore.state;
			const selfServiceInstance = this.getRequestService();
			const url = this.$root.applicationStore.state.amDataEndpoints.baseUrl + userId + this.$root.applicationStore.state.amDataEndpoints.oauthApplications + applicationId;

			/* istanbul ignore next */
			// by default CORS requests don't allow cookies, the 'withCredentials: true' flag allows it
			selfServiceInstance.delete(url, { withCredentials: true }).then(() => {
				this.displayNotification('success', this.$t('pages.profile.oauthApplications.removeSuccess', { applicationName: this.confirmApplication.id }));
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
