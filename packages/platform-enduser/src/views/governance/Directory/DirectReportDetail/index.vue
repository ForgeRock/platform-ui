<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

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
              icon-class="mr-2"
              :name="tabItems[tabIndex].icon">
              {{ pluralizeValue(tabItems[tabIndex].displayName) }}
            </FrIcon>
          </template>
          <BDropdownItem
            v-for="(tab, index) in tabItems"
            :key="index"
            :active="index === tabIndex"
            @click="tabIndex = index">
            <FrIcon
              icon-class="mr-3"
              :name="tab.icon">
              {{ pluralizeValue(tab.displayName) }}
            </FrIcon>
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
                icon-class="mr-3"
                :name="tab.icon">
                {{ tab.displayName }}
              </FrIcon>
            </template>
            <FrGovResourceTable
              v-if="directReportUserInfo.userId && tab.active"
              :fields="getTableFields(tab.grantType)"
              :grant-type="tab.grantType"
              :items="resourceItems"
              :require-request-justification="requireRequestJustification"
              :total-count="resourceTotalCount"
              :modal-id="`${tab.displayName}-modal`"
              @load-data="queryResource"
              @revoke-items="revokeResourcesAndCloseModal($event, directReportUserInfo.userId, `${tab.displayName}-modal-revoke`)" />
          </BTab>
        </BTabs>
      </BCard>
    </BContainer>
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
import { mapState } from 'pinia';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import { pluralizeValue } from '@forgerock/platform-shared/src/utils/PluralizeUtils';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import useBreadcrumb from '@forgerock/platform-shared/src/composables/breadcrumb';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import { getIgaAccessRequest } from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import FrGovResourceTable from '@forgerock/platform-shared/src/components/governance/GovResourceTable';
import { getGovernanceGrants, revokeResourcesFromIGA } from '@forgerock/platform-shared/src/utils/governance/resource';
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
    FrGovResourceTable,
  },
  mixins: [
    NotificationMixin,
  ],
  setup() {
    const { setBreadcrumb } = useBreadcrumb();
    return { setBreadcrumb };
  },
  data() {
    return {
      directReportUserInfo: {},
      requireRequestJustification: false,
      resourceItems: [],
      resourceTotalCount: 0,
      tabItems: [
        {
          displayName: this.$t('common.accounts'),
          icon: 'apps',
          routeName: 'Application',
          grantType: 'account',
        },
        {
          displayName: this.$t('common.entitlements'),
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
      userId: this.$route.params.resourceId || useUserStore().userId,
    };
  },
  async created() {
    await this.getUserProfile();
  },
  async mounted() {
    this.setBreadcrumb('/my-reports', this.$t('governance.directReports.title'));
    this.tabItems.find((item, index) => {
      if (item.grantType === this.$route.params.grantType) {
        item.active = true;
        this.tabIndex = index;
        return true;
      }
      return false;
    });
    try {
      const { data } = await getIgaAccessRequest();
      this.requireRequestJustification = data.requireRequestJustification;
    } catch {
      // We don't need to show an error here
    }
  },
  computed: {
    ...mapState(useUserStore, ['userId']),
  },
  methods: {
    pluralizeValue,
    getTableFields(grantType) {
      const sharedFields = [
        {
          key: 'assignment',
          label: this.$t('common.assignment'),
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
      await getDirectReportUserInfo(this.userId, this.$route.params.userId).then(({ data }) => {
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
    /**
     * Request grants for governance resource
     * @param {Object} params query parameters to pass to request
     */
    async queryResource(params) {
      const response = await getGovernanceGrants(params.grantType, this.directReportUserInfo.userId, params);
      this.resourceItems = response.items;
      this.resourceTotalCount = response.totalCount;
    },
    async revokeResourcesAndCloseModal(requestPayload, resourceId, modalId) {
      try {
        await revokeResourcesFromIGA(requestPayload, resourceId, false);
        this.$bvModal.hide(modalId);
      } catch {
        // no catch statement needed
      }
    },
    tabActivated(tabIndex, prevTabIndex) {
      if (tabIndex > -1) {
        this.$route.params.grantType = this.tabItems[tabIndex].grantType;
        this.tabItems[prevTabIndex].active = false;
        this.tabItems[tabIndex].active = true;
        const { grantType, userId } = this.$route.params;
        window.history.pushState(window.history.state, '', `#/my-reports/${userId}/${grantType}`);
      }
    },
  },
};
</script>
