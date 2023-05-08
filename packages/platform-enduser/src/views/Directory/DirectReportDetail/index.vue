<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
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
            :user-id="directReportUserInfo.userId" />
        </BTab>
      </BTabs>
    </BCard>
  </BContainer>
</template>

<script>
import {
  BCard,
  BContainer,
  BImg,
  BMedia,
  BMediaAside,
  BMediaBody,
  BTabs,
  BTab,
} from 'bootstrap-vue';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import BreadcrumbMixin from '@forgerock/platform-shared/src/mixins/BreadcrumbMixin';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import FrMyAccessReviewTable from '../../MyAccessReview/MyAccessReviewTable';
import { getDirectReportUserInfo } from '@/api/GovernanceEnduserApi';

/**
 * DirectReports base container component. This component renders a vertical tab menu for application, entitlement and role options
 * Each tab displays corresponding list of My Access attributes defined in the system.
 */
export default {
  name: 'DirectReportDetail',
  components: {
    BCard,
    BContainer,
    BImg,
    BMedia,
    BMediaAside,
    BMediaBody,
    BTabs,
    BTab,
    FrHeader,
    FrIcon,
    FrMyAccessReviewTable,
  },
  mixins: [
    BreadcrumbMixin,
    NotificationMixin,
  ],
  async created() {
    await this.getUserProfile();
  },
  data() {
    return {
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
      tabIndex: null,
      directReportUserInfo: {},
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
      switch (grantType) {
        case 'account':
          return [{
            key: 'appName',
            label: this.$t('common.name'),
            sortable: true,
          },
          {
            key: 'accountName',
            label: this.$t('pages.myAccess.accountName'),
            sortable: true,
          }];
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
