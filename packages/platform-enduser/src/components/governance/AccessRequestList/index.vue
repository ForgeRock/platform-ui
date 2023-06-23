<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BTable
    v-if="items.length"
    class="access-request-list"
    thead-class="d-none"
    tbody-tr-class="cursor-pointer"
    hover
    :fields="fields"
    :items="items">
    <template #cell(details)="{ item }">
      <div class="mb-2">
        <small data-testid="request-type">
          {{ item.details.type }}
        </small>
      </div>
      <BMedia
        no-body
        class="mb-2">
        <BMediaAside class="align-self-center">
          <FrIcon
            v-if="getRequestObjectType(item.rawData.requestType) === 'role'"
            class="mr-1 md-28 rounded-circle"
            :name="item.details.icon" />
          <BImg
            v-else
            width="24"
            height="24"
            class="align-self-center"
            :src="item.details.icon"
            :alt="$t('common.logo')" />
        </BMediaAside>
        <BMediaBody>
          <h2
            class="m-0 h5"
            data-testid="request-item-name">
            {{ item.details.name }}
          </h2>
          <small
            class="text-muted"
            data-testid="request-item-description">
            {{ item.details.description }}
          </small>
        </BMediaBody>
      </BMedia>
      <BMedia
        no-body
        class="mb-2">
        <BMediaAside class="align-self-center mr-2">
          <BImg
            class="rounded-circle"
            height="18"
            width="18"
            :alt="item.details.requesteeInfo.givenName"
            :aria-hidden="true"
            :src="item.details.requesteeInfo.profileImage || require('@forgerock/platform-shared/src/assets/images/avatar.png')" />
        </BMediaAside>
        <BMediaBody class="align-self-center">
          <div
            class="text-truncate"
            data-testid="request-item-user">
            {{ item.details.requesteeInfo.givenName }} {{ item.details.requesteeInfo.sn }}
          </div>
        </BMediaBody>
      </BMedia>
      <div class="d-flex align-items-center">
        <div>
          <small
            class="text-muted"
            data-testid="request-item-date">
            {{ getDateString(item.details.date) }}
          </small>
        </div>
        <span
          style="padding-bottom: 5px;"
          class="mx-2 opacity-50">
          .
        </span>
        <div>
          <small
            class="text-muted"
            data-testid="request-item-id">
            {{ $t('governance.accessRequest.idLabel', { id: item.details.id }) }}
          </small>
        </div>
        <div class="ml-2">
          <BImg
            height="24"
            :src="getPriorityImageSrc(item.details.priority)" />
        </div>
      </div>
    </template>
    <template #cell(actions)="{ item }">
      <slot
        :item="item"
        name="actions" />
    </template>
  </BTable>
</template>

<script>
import {
  BImg,
  BMedia,
  BMediaAside,
  BMediaBody,
  BTable,
} from 'bootstrap-vue';
import dayjs from 'dayjs';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import AppSharedUtilsMixin from '@forgerock/platform-shared/src/mixins/AppSharedUtilsMixin';

/**
 * A table that displays an array of access request objects
 */
export default {
  name: 'AccessRequestList',
  components: {
    BImg,
    BMedia,
    BMediaAside,
    BMediaBody,
    BTable,
    FrIcon,
  },
  mixins: [AppSharedUtilsMixin],
  props: {
    requests: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      items: [],
      fields: [
        {
          key: 'details',
          label: '',
        },
        {
          key: 'actions',
          label: '',
          class: 'w-175px',
        },
      ],
    };
  },
  watch: {
    requests: {
      immediate: true,
      handler(requestList) {
        if (requestList.length) this.items = this.buildRequestDisplay(requestList);
      },
    },
  },
  methods: {
    /**
     * Converts access request objects to have information at the top level
     * that is necessary for the table display
     * @param {Object[]} requests Access request objects
     * @returns {Object[]} request objects
     */
    buildRequestDisplay(requests) {
      const requestDisplay = requests.map((request) => {
        const objectType = this.getRequestObjectType(request.requestType);
        const formattedRequest = this.getFormattedRequest(request, objectType);
        return formattedRequest;
      });
      return requestDisplay;
    },
    /**
     * Given any access request, return the relevant request display object
     * @param {Object} request access request
     * @param {String} objectType the type of object the request is for: application, entitlment, role.
     * @returns {Object} access request that is formatted for display
     */
    getFormattedRequest(request, objectType) {
      if ((objectType) === 'application') return this.getApplicationRequest(request);
      if ((objectType) === 'entitlement') return this.getEntitlementRequest(request);
      if ((objectType) === 'role') return this.getRoleRequest(request);
      return null;
    },
    /**
     * Get the base object type of the access request
     * @param {String} requestType the request type of the access request
     * @returns {String} the base object type of the request: application, entitlment, role.
     */
    getRequestObjectType(requestType) {
      if (requestType.includes('account')) return 'application';
      if (requestType.includes('entitlement')) return 'entitlement';
      if (requestType.includes('role')) return 'role';
      return '';
    },
    /**
     * Given an application access request, return the object used for displaying in the table
     * @param {Object} request application access request
     * @returns {Object} application request formatted for display
     */
    getApplicationRequest(request) {
      return {
        details: {
          id: request.id,
          type: this.getTypeString(request.requestType),
          name: request.application?.name,
          description: request.application?.description,
          priority: request.request?.common?.priority,
          date: request.request?.common?.startDate,
          requesteeInfo: request.user,
          icon: this.getApplicationLogo(request.application),
        },
        rawData: request,
      };
    },
    /**
     * Given an entitlement access request, return the object used for displaying in the table
     * @param {Object} request entitlement access request
     * @returns {Object} entitilement request formatted for display
     */
    getEntitlementRequest(request) {
      return {
        details: {
          id: request.id,
          type: this.getTypeString(request.requestType),
          name: request.entitlement?.displayName,
          description: request.entitlement?.description,
          priority: request.request?.common?.priority,
          date: request.request?.common?.startDate,
          requesteeInfo: request.user,
          icon: this.getApplicationLogo(request.application),
        },
        rawData: request,
      };
    },
    /**
     * Given a role access request, return the object used for displaying in the table
     * @param {Object} request role access request
     * @returns {Object} role request formatted for display
     */
    getRoleRequest(request) {
      return {
        details: {
          id: request.id,
          type: this.getTypeString(request.requestType),
          name: request.role?.name,
          description: request.role?.description,
          priority: request.request?.common?.priority,
          date: request.request?.common?.startDate,
          requesteeInfo: request.user,
          icon: 'assignment_ind',
        },
        rawData: request,
      };
    },
    /**
     * Gets a user friendly date string from an ISO date
     * @param {String} date ISO formatted date string
     * @returns {String} user friendly formatted string
     */
    getDateString(date) {
      if (!date) return '';
      return dayjs(date).format('MMM D, YYYY');
    },
    /**
     * Gets image source for the priority icons based on priority level
     * @param {String} priority access request priority: high, medium, low
     * @returns {String} image src for the given priority
     */
    getPriorityImageSrc(priority) {
      const images = require.context('@forgerock/platform-shared/src/assets/images/priorities/', false, /\.svg$/);
      let imageName = '';
      if (priority === 'high') imageName = 'priority-high.svg';
      if (priority === 'medium') imageName = 'priority-med.svg';
      if (priority === 'low') imageName = 'priority-low.svg';
      return images(`./${imageName}`);
    },
    /**
     * Get translated text of the request type
     * @param {String} requestType access request type: accountGrant, roleGrant, etc.
     * @returns {String} text to display as the request type
     */
    getTypeString(requestType) {
      return this.$t(`governance.accessRequest.requestTypes.${requestType}`);
    },
  },
};
</script>
<style lang="scss" scoped>
::v-deep {
  .w-175px {
    width: 175px;
  }
}
</style>
