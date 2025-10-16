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
import { getUserApprovals } from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import { getBasicFilter } from '@forgerock/platform-shared/src/utils/governance/filters';
import useTheme from '@forgerock/platform-shared/src/composables/theme';
import { removeThemeIdFromLocalStorage } from '@forgerock/platform-shared/src/utils/themeUtils';
import { getManagedResourceList } from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import {
  buildMenuItemsFromTheme,
  generateEndUserMenuItems,
  getAllEndUserMenuItems,
} from '@forgerock/platform-shared/src/utils/endUserMenu/endUserMenu';
import { mapState } from 'pinia';
import { getCertificationItems } from '@/api/governance/AccessReviewApi';
import { getUserFulfillmentTasks } from '@/api/governance/TasksApi';
import { getViolations } from '@/api/governance/ViolationsApi';
import i18n from '@/i18n';
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
    return {
      governanceEnabled,
      version: '',
      menuItems: [],
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
      if (!this.theme?.name) {
        removeThemeIdFromLocalStorage(themeId);
        await this.loadTheme(realm);
      }
      if (this.localizedFavicon) {
        document.getElementById('favicon').href = this.localizedFavicon;
      }
    } catch (error) {
      this.showErrorMessage(error, this.$t('errors.themeSetError'));
    }

    // Generate the end user menu items
    await this.loadMenuItems();
  },
  mounted() {
    getIdmServerInfo().then((results) => {
      if (results && results.data) {
        this.version = results.data.productVersion;
      }
    }, (error) => {
      this.showErrorMessage(error, this.$t('errors.couldNotRetrieveVersion'));
    });

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
    theme: {
      deep: true,
      handler(theme) {
        if (!this.theme.accountFooterScriptTagEnabled || !theme.accountFooterScriptTag) return;
        const scriptContainer = document.getElementById('user-theme-script-container');

        try {
          // Note: if the user provides invalid html that is unable to be parsed, this could cause an error which we need to catch
          const scripts = createScriptTags(theme.accountFooterScriptTag);

          scripts.forEach((scriptTag) => {
            scriptContainer.appendChild(scriptTag);
          });
        } catch (error) {
          this.showErrorMessage(error, this.$t('errors.userScriptError'));
        }
      },
    },
  },
  methods: {
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
     * Fetches and sets the application's side navigation menu items asynchronously.
     * This function is responsible for obtaining the menu data from theme configuration.
     * It checks if the theme has predefined end user menu items; if not, it fetches them
     * from the default menu items based on current environment and user privileges.
     *
     * @returns {Promise<void>} Resolves when the menu items have been successfully loaded and set.
     */
    async loadMenuItems() {
      let configuredMenuItems;
      try {
        const allEndUserMenuItems = await getAllEndUserMenuItems({ store: this.$store, getTranslations: true });
        if (!('endUserMenuItems' in this.theme)) {
          // If the theme does not have endUserMenuItems, use allEndUserMenuItems
          configuredMenuItems = allEndUserMenuItems;
        } else {
          // If the theme has endUserMenuItems, build menu items from the theme intersecting with allEndUserMenuItems
          configuredMenuItems = buildMenuItemsFromTheme(this.theme.endUserMenuItems, allEndUserMenuItems);
        }
      } catch (error) {
        configuredMenuItems = [];
        this.showErrorMessage(error, this.$t('errors.errorLoadingMenuItems'));
      }

      // if governance user lcm is enabled, we hide the standard menu item for alpha users
      const hideAlphaUsersMenuItem = this.$store.state.govLcmUser;
      const hideAlphaRolesMenuItem = this.$store.state.govLcmRole;
      const endUserMenuItems = generateEndUserMenuItems({
        configuredMenuItems,
        hideAlphaUsersMenuItem,
        hideAlphaRolesMenuItem,
        isEndUserUI: true,
        privileges: this.$store.state.privileges,
        store: this.$store,
      });
      this.menuItems = endUserMenuItems;
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
      }).then((res) => {
        if (res === false) this.setIDMUsersViewPrivilege(false);
        else this.setIDMUsersViewPrivilege(true);
      }).catch((error) => {
        if (error.response?.status === 403) {
          this.setIDMUsersViewPrivilege(false);
        }
      });
    },
  },
};
</script>
