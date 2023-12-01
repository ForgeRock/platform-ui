<!-- Copyright (c) 2020-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer fluid>
    <template v-if="requestsLoaded">
      <BTabs
        class="mt-4"
        v-if="resources.length > 0"
        @click="testForReload">
        <BTab
          title="Resources"
          active>
          <FrResources
            @renderShareModal="renderShareModal"
            @renderUnshareModal="renderUnshareModal"
            :resources="resources" />
        </BTab>
        <BTab
          title="Activity"
          v-if="activity.length > 0"
          @click="testForReload">
          <FrActivity :uma-history="umaHistory" />
        </BTab>
        <BTab
          title="Requests"
          v-if="requests.length > 0">
          <template #title>
            {{ $t('pages.uma.notifications.requests') }} <BBadge
              pill
              variant="danger">
              {{ requests.length }}
            </BBadge>
          </template>
          <FrRequests
            :requests="requests"
            @finalize-resource-access="finalizeResourceAccess" />
        </BTab>
      </BTabs>
      <div v-else>
        <FrCenterCard
          :show-logo="false"
          class="mt-5">
          <template #center-card-body>
            <BCardBody>
              <img
                :src="require('@/assets/images/empty-box.svg')"
                class="mb-4"
                :alt="$t('common.logo')"
                style="width: 150px;">
              <h5 class="h5">
                {{ $t(`pages.uma.resources.noDataState`) }}
              </h5>
            </BCardBody>
          </template>
        </FrCenterCard>
      </div>
      <FrShare
        v-if="resource"
        :resource="resource"
        @shareResource="shareResource"
        @renderUnshareModal="renderUnshareModal"
        @modifyResource="modifyResource" />
      <FrUnshare
        :resource-id="resourceId"
        :resource-name="resourceName"
        @unshareResource="unshareResource" />
    </template>
  </BContainer>
</template>

<script>
import {
  BBadge,
  BCardBody,
  BContainer,
  BTab,
  BTabs,
} from 'bootstrap-vue';
import {
  cloneDeep,
  find,
  has,
  map,
} from 'lodash';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import FrCenterCard from '@forgerock/platform-shared/src/components/CenterCard';
import FrActivity from '@/components/uma/Activity';
import FrRequests from '@/components/uma/Requests';
import FrResources from '@/components/uma/Resources';
import FrShare from '@/components/uma/Share';
import FrUnshare from '@/components/uma/Unshare';

/**
 * @description Controlling component for sharing resources, this UI is primarily focused making use of AM and its UMA features.
 * This UI feature requires full stack (IDM/AM) to be configured and for AM to be properly configured to make use of UMA
 * */
export default {
  name: 'Sharing',
  mixins: [
    RestMixin,
    NotificationMixin,
  ],
  components: {
    BBadge,
    BCardBody,
    BContainer,
    BTab,
    BTabs,
    FrActivity,
    FrCenterCard,
    FrRequests,
    FrResources,
    FrShare,
    FrUnshare,
  },
  data() {
    return {
      requestsLoaded: false,
      resource: null,
      resourceId: '',
      resourceName: '',
      resources: [],
      activity: [],
      requests: [],
      resourcesCount: 0,
      activityCount: 0,
      delayedUpdate: false,
    };
  },
  computed: {
    umaHistory() {
      return map(this.activity, (res) => {
        const resource = find(this.resources, { _id: res.resourceSetId });
        const newRes = cloneDeep(res);

        if (has(resource, 'icon_uri')) {
          newRes.icon_uri = resource.icon_uri;
        }

        return newRes;
      });
    },
  },
  beforeMount() {
    this.loadData();
  },
  methods: {
    loadData() {
      this.getResources();
      this.getActivity();
      this.getRequests();
    },
    getResources() {
      const query = '?_queryId=*';
      const selfServiceInstance = this.getRequestService();
      // TODO Will break until updated
      const url = `${query}`; // this.amDataEndpoints.baseUrl + this.userId + this.amDataEndpoints.resourceSet + query;

      // by default CORS requests don't allow cookies, the 'withCredentials: true' flag allows it
      selfServiceInstance.get(url, { withCredentials: true }).then((response) => {
        this.resources = response.data.result;
        this.requestsLoaded = true;
      })
        .catch((error) => {
          this.resources = [];
          this.requestsLoaded = true;

          this.showErrorMessage(error, error.message);
        });
    },
    getActivity() {
      const query = '?_sortKeys=-eventTime&_queryFilter=true';
      const selfServiceInstance = this.getRequestService();
      // TODO Will break until updated
      const url = `${query}`; // this.amDataEndpoints.baseUrl + this.userId + this.amDataEndpoints.resourceSet + query;
      // by default CORS requests don't allow cookies, the 'withCredentials: true' flag allows it
      selfServiceInstance.get(url, { withCredentials: true }).then((response) => {
        this.activity = response.data.result;
      })
        .catch((error) => {
          this.activity = [];
          this.showErrorMessage(error, error.message);
        });
    },
    getRequests() {
      const query = '?_sortKeys=user&_queryFilter=true';
      const selfServiceInstance = this.getRequestService();
      // TODO Will break until updated
      const url = `${query}`; // this.amDataEndpoints.baseUrl + this.userId + this.amDataEndpoints.resourceSet + query;
      // by default CORS requests don't allow cookies, the 'withCredentials: true' flag allows it
      selfServiceInstance.get(url, { withCredentials: true }).then((response) => {
        this.requests = map(response.data.result, (request) => {
          const resource = find(this.resources, { name: request.resource });
          const requestCopy = cloneDeep(request);

          if (has(resource, 'icon_uri')) {
            requestCopy.icon_uri = resource.icon_uri;
          }

          if (has(resource, 'scopes')) {
            requestCopy.scopes = resource.scopes;
          }

          requestCopy.allowed = false;
          requestCopy.decision = false;

          return requestCopy;
        });
      })
        .catch((error) => {
          this.requests = {};
          this.showErrorMessage(error, error.message);
        });
    },
    renderShareModal(resource) {
      this.resource = resource;
      this.$nextTick(() => {
        this.$bvModal.show('shareModal');
      });
    },
    renderUnshareModal(resourceName, resourceId) {
      this.resourceName = resourceName;
      this.resourceId = resourceId;
      this.$nextTick(() => {
        this.$bvModal.show('unshareModal');
      });
    },
    shareResource(payload, config = {}) {
      const successMsg = this.$t('user.sharing.shareSuccess');
      const selfServiceInstance = this.getRequestService();
      // TODO Will break until updated
      const url = ''; // this.amDataEndpoints.baseUrl + this.userId + this.amDataEndpoints.resourceSet + query;

      selfServiceInstance.put(url, payload, { withCredentials: true }).then(() => {
        if (config.onSuccess) {
          config.onSuccess();
        }
        this.displayNotification('success', successMsg);
        this.loadData();
      })
        .catch((error) => {
          this.showErrorMessage(error, this.$t('user.sharing.shareError'));
        });
    },
    unshareResource(resourceId) {
      const successMsg = this.$t('user.sharing.unshareSuccess');
      const selfServiceInstance = this.getRequestService();
      // TODO Will break until updated
      const url = `${resourceId}`; // this.amDataEndpoints.baseUrl + this.userId + this.amDataEndpoints.resourceSet + query;

      selfServiceInstance.delete(url, { withCredentials: true }).then(() => {
        this.displayNotification('success', successMsg);
        this.loadData();
      })
        .catch((error) => {
          this.showErrorMessage(error, this.$t('user.sharing.unshareError'));
        });
    },
    modifyResource(resourceId, payload, config = {}) {
      const successMsg = config.unshare ? this.$t('user.sharing.unshareSuccess') : this.$t('user.sharing.modifySuccess');
      // TODO Will break until updated
      const url = `${resourceId}`; // this.amDataEndpoints.baseUrl + this.userId + this.amDataEndpoints.resourceSet + query;
      const selfServiceInstance = this.getRequestService();
      const headers = { 'Accept-API-Version': 'protocol=1.0,resource=1.0' };

      selfServiceInstance.put(url, payload, { withCredentials: true, headers })
        .then(() => {
          if (config.onSuccess) {
            config.onSuccess();
          }

          this.displayNotification('success', successMsg);
          this.loadData();
        })
        .catch((error) => {
          this.showErrorMessage(error, config.unshare ? this.$t('user.sharing.unshareError') : this.$t('user.sharing.modifyError'));
        });
    },
    finalizeResourceAccess(id, action, index, config = {}) {
      const successMsg = action === 'approve' ? this.$t('user.sharing.requestAllowedSuccess') : this.$t('user.sharing.requestDeniedSuccess');
      const selfServiceInstance = this.getRequestService();
      const payload = { scopes: config.scopes || {} };
      // TODO Will break until updated
      const url = `${id}`; // this.amDataEndpoints.baseUrl + this.userId + this.amDataEndpoints.resourceSet + query;
      this.requests[index].decision = true;

      selfServiceInstance.post(url, payload, { withCredentials: true }).then(() => {
        if (action === 'approve') {
          this.requests[index].allowed = true;
        }

        this.delayedUpdate = true;
        this.displayNotification('success', successMsg);
      })
        .catch((error) => {
          this.showErrorMessage(error, action === 'approve' ? this.$t('user.sharing.requestAllowedError') : this.$t('user.sharing.requestDeniedError'));
        });
    },
    testForReload() {
      if (this.delayedUpdate === true) {
        this.delayedUpdate = false;

        this.loadData();
      }
    },
  },
};
</script>
