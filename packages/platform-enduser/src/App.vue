<!-- Copyright (c) 2020-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <FrLayout
      :footer="accountFooter"
      :is-enduser="true"
      :is-fraas="$store.state.isFraas"
      :menu-items="menuItems"
      :version="version"
      :class="{invisible: theme === null}">
      <RouterView v-slot="{ Component }">
        <Transition
          name="fade"
          mode="out-in">
          <Component
            :is="Component"
            :key="$route.fullPath"
            :theme="theme" />
        </Transition>
      </RouterView>
    </FrLayout>
    <ThemeInjector
      :theme="theme"
      :is-enduser="true"
      v-if="theme !== null" />
    <FrSessionTimeoutWarning />
  </div>
</template>

<script>
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import TranslationMixin from '@forgerock/platform-shared/src/mixins/TranslationMixin';
import ValidationRules from '@forgerock/platform-shared/src/utils/validationRules';
import createScriptTags from '@forgerock/platform-shared/src/utils/externalScriptUtils';
import FrLayout from '@forgerock/platform-shared/src/components/Layout';
import FrSessionTimeoutWarning from '@forgerock/platform-shared/src/components/SessionTimeoutWarning/SessionTimeoutWarning';
import { getIdmServerInfo } from '@forgerock/platform-shared/src/api/ServerinfoApi';
import ThemeInjector from '@forgerock/platform-shared/src/components/ThemeInjector/';
import { getDefaultProcess } from '@forgerock/platform-shared/src/views/AutoAccess/RiskConfig/api/RiskConfigAPI';
import { getConfig } from '@forgerock/platform-shared/src/views/AutoAccess/Shared/utils/api';
import { getUserApprovals } from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import { getBasicFilter } from '@forgerock/platform-shared/src/utils/governance/filters';
import useTheme from '@forgerock/platform-shared/src/composables/theme';
import { mapState } from 'pinia';
import { getManagedResourceList } from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import { getDelegatedAdminMenuItems } from '@forgerock/platform-shared/src/utils/enduserPrivileges';
import { getGovMenuItems } from '@/utils/governance/menuItems';
import { getCertificationItems } from '@/api/governance/AccessReviewApi';
import { getUserFulfillmentTasks } from '@/api/governance/TasksApi';
import { getViolations } from '@/api/governance/ViolationsApi';
import i18n from '@/i18n';
import store from '@/store';
import './scss/main.scss';

export default {
  name: 'App',
  mixins: [
    NotificationMixin,
    RestMixin,
    TranslationMixin,
  ],
  components: {
    FrLayout,
    FrSessionTimeoutWarning,
    ThemeInjector,
  },
  setup() {
    const {
      loadTheme,
      localizedFavicon,
      theme,
    } = useTheme();
    return {
      loadTheme,
      localizedFavicon,
      theme,
    };
  },
  computed: {
    accountFooter() {
      if (this.theme?.accountFooterEnabled) {
        return this.$sanitize(this.getLocalizedString(this.theme.accountFooter, i18n.global.locale, i18n.global.fallbackLocale));
      }
      return '';
    },
    ...mapState(useUserStore, ['userId', 'setIDMUsersViewPrivilege']),
  },
  data() {
    const governanceEnabled = (this.$store.state.SharedStore.governanceEnabled === true) && (this.$store.state.realm === 'alpha');
    const govMenuItems = governanceEnabled
      ? getGovMenuItems(this.$store)
      : {};
    return {
      governanceEnabled,
      menuItems: [
        {
          routeTo: { name: 'Dashboard' },
          displayName: 'sideMenu.dashboard',
          icon: 'dashboard',
        },
        (this.$store.state.SharedStore.autoReportsEnabled === true
          ? {
            routeTo: { name: 'Reports' },
            displayName: 'sideMenu.reports',
            icon: 'analytics',
            showForStoreValues: ['SharedStore.autoReportsEnabled'],
          }
          : {}),
        (governanceEnabled
          ? govMenuItems.inboxMenuItem
          : {}),
        (this.$store.state.SharedStore.workforceEnabled === true
          ? {
            isDivider: true,
          }
          : {}),
        (this.$store.state.SharedStore.workforceEnabled === true
          ? {
            routeTo: { name: 'Applications' },
            displayName: 'sideMenu.applications',
            icon: 'apps',
          }
          : {}),
        (governanceEnabled
          ? govMenuItems.myAccessMenuItem
          : {}),
        (governanceEnabled
          ? govMenuItems.directoryMenuItem
          : {}),
        (governanceEnabled
          ? govMenuItems.myRequestsMenuItem
          : {}),
        {
          routeTo: { name: 'Profile' },
          displayName: 'sideMenu.profile',
          icon: 'account_circle',
        },
        (governanceEnabled
          ? govMenuItems.lcmMenuItem
          : {}),
      ],
      version: '',
    };
  },
  async created() {
    // add vee-validate rules
    const rules = ValidationRules.getRules(i18n);
    ValidationRules.extendRules(rules);

    // if this is a dns alias making this call will get the true realm when no realm param is provided
    const realm = this.$store.state.realm === 'root' ? '/' : this.$store.state.realm;
    const themeId = this.$store.state.SharedStore.webStorageAvailable ? localStorage.getItem('theme-id') : null;
    try {
      await this.loadTheme(realm, themeId);
      if (this.localizedFavicon) {
        document.getElementById('favicon').href = this.localizedFavicon;
      }
    } catch (error) {
      this.showErrorMessage(error, this.$t('errors.themeSetError'));
    }

    this.setupDelegatedAdminMenuItems(store.state.privileges);
  },
  mounted() {
    getIdmServerInfo().then((results) => {
      if (results && results.data) {
        this.version = results.data.productVersion;
      }
    }, (error) => {
      this.showErrorMessage(error, this.$t('errors.couldNotRetrieveVersion'));
    });

    if (this.$store.state.SharedStore && this.$store.state.SharedStore.autoAccessEnabled) {
      this.checkAutoAccess();
    }

    if (this.governanceEnabled) {
      this.getAccessReviewsCount();
      this.getPendingApprovalsCount();
      this.getFulfillmentTasksCount();
      this.getViolationsCount();
      this.getEnduserPrivileges();
    }
  },
  watch: {
    /**
     * Adds the given script tags to the script container
     */
    accountFooterScriptTag(scriptStr) {
      if (!this.theme.accountFooterScriptTagEnabled || !scriptStr) return;
      const scriptContainer = document.getElementById('user-theme-script-container');

      try {
        // Note: if the user provides invalid html that is unable to be parsed, this could cause an error which we need to catch
        const scripts = createScriptTags(scriptStr);

        scripts.forEach((scriptTag) => {
          scriptContainer.appendChild(scriptTag);
        });
      } catch (error) {
        this.showErrorMessage(error, this.$t('errors.userScriptError'));
      }
    },
  },
  methods: {
    /**
     * Uses the passed privileges to extend the menu items (Mainly used for Delegated Admin)
     * @param {Array} privileges - the privileges that dictate the additional mentu items to be shown
     */
    setupDelegatedAdminMenuItems(privileges) {
      // if governance user lcm is enabled, we hide the standard da menu item for alpha users
      const hideAlphaUsersMenuItem = this.$store.state.govlcmuser;
      this.menuItems.push(...getDelegatedAdminMenuItems(privileges, hideAlphaUsersMenuItem, true));
    },
    /**
      * Tries to get Auto access info and if found adds menu items for Data_Analyst and/or Fraud_Analyst.
      */
    checkAutoAccess() {
      // Risk Dashboard / Fraud Analyst
      getConfig().then(() => {
        this.showRiskDashboad();
      }).catch(() => {});
      // Risk Administration / Data Analyst
      getDefaultProcess().then(() => {
        this.showRiskAdministration();
      }).catch(() => {});
    },
    showRiskAdministration() {
      const autoAccessAdminMenu = [
        {
          displayName: 'sideMenu.riskAdministration',
          icon: 'settings',
          subItems: [
            {
              displayName: 'sideMenu.dataSources',
              routeTo: { name: 'AutoAccessDataSources' },
            },
            {
              displayName: 'sideMenu.pipelines',
              routeTo: { name: 'AutoAccessPipelines' },
            },
            {
              displayName: 'sideMenu.riskConfig',
              routeTo: { name: 'AutoAccessRiskConfig' },
            },
          ],
        },
      ];
      this.menuItems.splice(6, 0, ...autoAccessAdminMenu);
    },
    showRiskDashboad() {
      const autoAccessDashboardMenu = [
        {
          displayName: 'sideMenu.riskDashboard',
          routeTo: { name: 'RiskDashboard' },
          icon: 'show_chart',
        },
      ];
      this.menuItems.splice(1, 0, ...autoAccessDashboardMenu);
    },
    /**
     * Retrieves the count of active access reviews and commits the count to the Vuex store.
     * The value stored here is used in the side bar panel and in the Governance dashboard
     *
     * @returns {void} Does not return a value. The result of the operation is a side-effect (Vuex store update or error message display).
     */
    getAccessReviewsCount() {
      let count = 0;
      getCertificationItems({ status: 'active' }).then((resourceData) => {
        count = resourceData?.data?.totalCount || 0;
      }).catch((error) => {
        this.showErrorMessage(error, this.$t('pages.dashboard.errorRetrievingAccesReviews'));
      }).finally(() => {
        this.$store.commit('setCertificationCount', count);
      });
    },
    /**
     * Retrieves the count of pending approvals and commits the count to the Vuex store.
     * The value stored here is used in the side bar panel and in the Governance dashboard
     *
     * @returns {void} Does not return a value. The result of the operation is a side-effect (Vuex store update or error message display).
     */
    getPendingApprovalsCount() {
      let count = 0;
      getUserApprovals(this.userId, {
        pageSize: 0,
        actorStatus: 'active',
      }).then((resourceData) => {
        count = resourceData?.data?.totalCount || 0;
      }).catch((error) => {
        this.showErrorMessage(error, this.$t('pages.dashboard.errorRetrievingPendingApprovals'));
      }).finally(() => {
        this.$store.commit('setApprovalsCount', count);
      });
    },
    /**
     * Retrieves the count of fulfillment tasks.
     *
     * @returns {void} Does not return a value. The result of the operation is a side-effect (Vuex store update or error message display).
     */
    getFulfillmentTasksCount() {
      let count = 0;
      getUserFulfillmentTasks(this.userId, {
        pageSize: 0,
        actorStatus: 'active',
      }).then((resourceData) => {
        count = resourceData?.data?.totalCount || 0;
      }).catch((error) => {
        this.showErrorMessage(error, this.$t('pages.dashboard.errorRetrievingPendingFulfillmentTasks'));
      }).finally(() => {
        this.$store.commit('setFulfillmentTasksCount', count);
      });
    },
    /**
     * Retrieves the count of pending violations and commits the count to the Vuex store.
     * The value stored here is used in the side bar panel and in the Governance dashboard
     *
     * @returns {void} Does not return a value. The result of the operation is a side-effect (Vuex store update or error message display).
     */
    getViolationsCount() {
      let count = 0;

      const targetFilter = getBasicFilter('AND', 'decision.status', 'in-progress');
      const params = { fields: 'id' };

      getViolations(targetFilter, params).then((resourceData) => {
        count = resourceData?.data?.totalCount || 0;
      }).catch((error) => {
        this.showErrorMessage(error, this.$t('pages.dashboard.errorRetrievingPendingViolations'));
      }).finally(() => {
        this.$store.commit('setViolationsCount', count);
      });
    },
    /**
     * Retrieves the IDM users and save the privilege of view users depending of the result of this call
     * The value stored here is used in the delegates view and in the new request modal
     */
    getEnduserPrivileges() {
      getManagedResourceList(`${this.$store.state.realm}_user`, {
        queryFilter: true,
        pageSize: 1,
        fields: '_id',
      }).then(() => {
        this.setIDMUsersViewPrivilege(true);
      }).catch((error) => {
        if (error.response?.status === 403) {
          this.setIDMUsersViewPrivilege(false);
        }
      });
    },
  },
};
</script>
