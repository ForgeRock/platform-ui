<!-- Copyright 2019 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
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
        <template v-slot:list-item-header>
          <div class="d-inline-flex w-100">
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
              {{ $t('common.remove') }}
            </a>
          </div>
        </template>
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
      <template v-slot:modal-header>
        <div class="d-flex w-100 h-100">
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
      </template>
      {{ $t('pages.profile.oauthApplications.removeConfirmation', {applicationName: confirmApplication.name }) }}
      <template v-slot:modal-footer="{ cancel }">
        <BBtn
          variant="outline-secondary mr-2"
          @click="cancel()">
          {{ $t('common.cancel') }}
        </BBtn>
        <BBtn
          type="button"
          variant="danger"
          @click="removeApplication(confirmApplication.id)">
          {{ $t('common.remove') }}
        </BBtn>
      </template>
    </BModal>
  </FrListGroup>
</template>

<script>
import { mapState } from 'vuex';
import ListGroup from '@forgerock/platform-shared/src/components/ListGroup/';
import ListItem from '@forgerock/platform-shared/src/components/ListItem/';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';

/**
* @description If fullstack (AM/IDM) is configured will work with authorized applications endpoiint (AM) and display a list of currently tied applications.
* It is possible to also remove these applications though if you attempt to remove openIDM it will always re-add since this is needed to ensure fullstack works.
*
*/
export default {
  name: 'AuthorizedApplications',
  mixins: [
    RestMixin,
    NotificationMixin,
  ],
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
      const selfServiceInstance = this.getRequestService();
      // TODO This will fail until updated with reliable endpoint
      const url = '';// this.amDataEndpoints.baseUrl + this.userId + this.amDataEndpoints.oauthApplications + query;

      // by default CORS requests don't allow cookies, the 'withCredentials: true' flag allows it
      selfServiceInstance.get(url, { withCredentials: true }).then((response) => {
        this.oauthApplications = response.data.result;
      })
        .catch((error) => {
          this.displayNotification('IDMMessages', 'error', error.response.data.message);
        });
    },
    showConfirmationModal(application) {
      // eslint-disable-next-line no-underscore-dangle
      this.confirmApplication.id = application._id;
      this.$refs.fsModal.show();
    },
    removeApplication(applicationId) {
      const selfServiceInstance = this.getRequestService();
      // TODO This will fail until updated
      const url = `${applicationId}`; // this.amDataEndpoints.baseUrl + this.userId + this.amDataEndpoints.oauthApplications + applicationId;

      // by default CORS requests don't allow cookies, the 'withCredentials: true' flag allows it
      selfServiceInstance.delete(url, { withCredentials: true }).then(() => {
        this.displayNotification('IDMMessages', 'success', this.$t('pages.profile.oauthApplications.removeSuccess', { applicationName: this.confirmApplication.id }));
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
