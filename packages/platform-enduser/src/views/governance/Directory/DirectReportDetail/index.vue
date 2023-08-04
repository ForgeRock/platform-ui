<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <BContainer class="mt-5">
      <BMedia
        no-body
        data-testid="detail-report-header">
        <BMediaAside vertical-align="start">
          <BImg
            class="rounded-circle"
            height="104"
            width="104"
            :alt="directReportUserInfo.name"
            :aria-hidden="true"
            :src="directReportUserInfo.profileImage || require('@forgerock/platform-shared/src/assets/images/avatar.png')" />
        </BMediaAside>
        <BMediaBody class="text-truncate">
          <FrHeader
            :top-text="$t('common.user.user')"
            :title="directReportUserInfo.name"
            :subtitle="directReportUserInfo.userName" />
        </BMediaBody>
      </BMedia>
      <BCard
        no-body
        class="card-tabs-vertical">
        <BDropdown
          v-if="tabItems.length"
          variant="white"
          block
          menu-class="w-100"
          class="d-md-none border-bottom mobile-dropdown-menu">
          <template #button-content>
            <FrIcon
              class="mr-1"
              aria-hidden="true"
              :name="tabItems[tabIndex].icon" />
            {{ tabItems[tabIndex].displayName | pluralizeFilter }}
          </template>
          <BDropdownItem
            v-for="(tab, index) in tabItems"
            :key="index"
            :active="index === tabIndex"
            @click="tabIndex = index">
            <FrIcon
              class="mr-3"
              aria-hidden="true"
              :name="tab.icon" />
            {{ tab.displayName | pluralizeFilter }}
          </BDropdownItem>
        </BDropdown>
        <BTabs
          v-if="tabIndex !== null"
          v-model="tabIndex"
          data-testid="access-tabs"
          @activate-tab="tabActivated"
          nav-wrapper-class="d-none d-md-block"
          content-class="overflow-hidden position-inherit"
          pills
          vertical>
          <BTab
            v-for="(tab, index) in tabItems"
            class="nav-item"
            :active="tab.active"
            :key="`${tab.grantType}_${index}`"
            :title="tab.displayName"
            :title-link-attributes="{'data-testid':`access-tab-${tab.grantType}`}">
            <template #title>
              <FrIcon
                class="mr-3"
                :name="tab.icon" />
              {{ tab.displayName }}
            </template>
            <FrMyAccessReviewTable
              v-if="directReportUserInfo.userId"
              :default-sort="getDefaultSort(tab.grantType)"
              :fields="getTableFields(tab.grantType)"
              :grant-type="tab.grantType"
              resource-name="directReportDetail"
              :user-id="directReportUserInfo.userId"
              @revoke-request="showRevokeRequestModal" />
          </BTab>
        </BTabs>
      </BCard>
    </BContainer>
    <FrRevokeRequestModal
      :show-spinner="isSubmittingRevokeRequest"
      @hidden="resetRevokeRequestModal"
      @submission="submitRevokeRequest" />
  </div>
</template>

<script>
import {
  BCard,
  BContainer,
  BDropdown,
  BDropdownItem,
  BImg,
  BMedia,
  BMediaAside,
  BMediaBody,
  BTabs,
  BTab,
} from 'bootstrap-vue';
import PluralizeFilter from '@forgerock/platform-shared/src/filters/PluralizeFilter';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import BreadcrumbMixin from '@forgerock/platform-shared/src/mixins/BreadcrumbMixin';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import FrMyAccessReviewTable from '../../MyAccessReview/MyAccessReviewTable';
import FrRevokeRequestModal from './RevokeRequestModal';
import { saveNewRequest } from '@/api/governance/AccessRequestApi';
import { getDirectReportUserInfo } from '@/api/governance/DirectoryApi';

/**
 * DirectReports base container component. This component renders a vertical tab menu for application, entitlement and role options
 * Each tab displays corresponding list of My Access attributes defined in the system.
 */
export default {
  name: 'DirectReportDetail',
  components: {
    BCard,
    BContainer,
    BDropdown,
    BDropdownItem,
    BImg,
    BMedia,
    BMediaAside,
    BMediaBody,
    BTabs,
    BTab,
    FrHeader,
    FrIcon,
    FrMyAccessReviewTable,
    FrRevokeRequestModal,
  },
  mixins: [
    BreadcrumbMixin,
    NotificationMixin,
  ],
  filters: {
    PluralizeFilter,
  },
  async created() {
    await this.getUserProfile();
  },
  data() {
    return {
      directReportUserInfo: {},
      isSubmittingRevokeRequest: false,
      requestToRevoke: {},
      tabItems: [
        {
          displayName: this.$t('common.accounts'),
          icon: 'apps',
          routeName: 'Application',
          grantType: 'account',
        },
        {
          displayName: this.$t('pages.myAccess.entitlement.tabTitle'),
          icon: 'assignment_turned_in',
          routeName: 'Entitlement',
          grantType: 'entitlement',
        },
        {
          displayName: this.$t('pages.myAccess.role.tabTitle'),
          icon: 'assignment_ind',
          routeName: 'Role',
          grantType: 'role',
        },
      ],
      tabIndex: 0,
    };
  },
  mounted() {
    this.setBreadcrumb('/my-reports', this.$t('governance.directReports.title'));
    this.tabItems.find((item, index) => {
      if (item.grantType === this.$route.params.grantType) {
        item.active = true;
        this.tabIndex = index;
        return true;
      }
      return false;
    });
  },
  computed: {
    revokeRequestCatalog() {
      if (Object.keys(this.requestToRevoke).length) {
        const { item } = this.requestToRevoke;
        // TODO: IGA is adding a catalog id property which is being implemented in IGA-2229
        // that would be used to fill in the value for the following grant id's. I created
        // IAM-4501 as a follow-up to implement this property once IGA makes it available.
        if (item.type === 'entitlementGrant') {
          return [{ type: 'entitlement', id: '' }];
        }
        if (item.type === 'accountGrant') {
          return [{ type: 'application', id: '' }];
        }
        if (item.type === 'roleMembership') {
          return [{ type: 'role', id: '' }];
        }
      }
      return [];
    },
  },
  methods: {
    getDefaultSort(grantType) {
      switch (grantType) {
        case 'account':
        case 'entitlement':
        default:
          return 'application.name';
        case 'role':
          return 'role.name';
      }
    },
    getTableFields(grantType) {
      const sharedFields = [
        {
          key: 'assignment',
          label: this.$t('pages.myAccess.assignment'),
          sortable: false,
          thClass: 'w-150px',
        },
        {
          key: 'actions',
          label: '',
          class: 'p-3',
          sortable: false,
          thClass: 'w-100px',
        },
      ];
      switch (grantType) {
        case 'account':
          return [
            {
              key: 'appName',
              label: this.$t('common.name'),
              sortable: true,
            },
            {
              key: 'accountName',
              label: this.$t('pages.myAccess.accountName'),
              sortable: true,
            },
            ...sharedFields,
          ];
        case 'role':
          return [
            {
              key: 'roleName',
              label: this.$t('common.name'),
              sortable: true,
            },
            {
              key: 'timeConstraint',
              label: this.$t('pages.myAccess.timeConstraint'),
            },
            ...sharedFields,
          ];
        case 'entitlement':
          return [
            {
              key: 'appName',
              label: this.$t('common.application'),
              sortable: true,
            },
            {
              key: 'entitlementName',
              label: this.$t('common.name'),
              sortable: true,
            },
            {
              key: 'accountName',
              label: this.$t('pages.myAccess.accountName'),
              sortable: true,
            },
            ...sharedFields,
          ];
        default:
          return [];
      }
    },
    async getUserProfile() {
      await getDirectReportUserInfo(this.$store.state.UserStore.userId, this.$route.params.userId).then(({ data }) => {
        this.directReportUserInfo = {
          name: `${data.givenName} ${data.sn}`,
          userName: data.userName,
          userId: data._refResourceId,
          profileImage: data.profileImage,
        };
      }).catch((err) => {
        this.showErrorMessage(err, this.$t('governance.directReports.errorGettingDirectReportUserInfo'));
      });
    },
    resetRevokeRequestModal() {
      this.isSubmittingRevokeRequest = false;
      this.requestToRevoke = {};
    },
    showRevokeRequestModal(request) {
      this.requestToRevoke = request;
      this.$root.$emit('bv::show::modal', 'revoke-request-modal');
    },
    async submitRevokeRequest(payload) {
      this.isSubmittingRevokeRequest = true;
      try {
        payload.accessModifier = 'remove';
        payload.catalogs = this.revokeRequestCatalog;
        payload.users = [this.directReportUserInfo.userId];
        await saveNewRequest(payload);
        this.displayNotification('success', this.$t('governance.accessRequest.newRequest.requestSuccess'));
      } catch (error) {
        this.showErrorMessage(error, this.$t('governance.accessRequest.newRequest.requestErrorTitle'));
      } finally {
        this.$root.$emit('bv::hide::modal', 'revoke-request-modal');
      }
    },
    tabActivated(tabIndex) {
      if (tabIndex > -1) {
        this.$route.params.grantType = this.tabItems[tabIndex].grantType;
        const { grantType, userId } = this.$route.params;
        window.history.pushState(window.history.state, '', `#/my-reports/${userId}/${grantType}`);
      }
    },
  },
};
</script>
