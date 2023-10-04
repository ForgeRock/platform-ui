<!-- Copyright (c) 2020-2023 ForgeRock. All rights reserved.

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
      <RouterView
        :key="$route.fullPath"
        :theme="theme" />
    </FrLayout>
    <ThemeInjector
      :theme="theme"
      :is-enduser="true"
      v-if="theme !== null" />
    <FrSessionTimeoutWarning />
  </div>
</template>

<script>
import {
  capitalize,
  cloneDeep,
} from 'lodash';
import { mapState } from 'pinia';
import { useEnduserStore } from '@forgerock/platform-shared/src/stores/enduser';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import ThemeMixin from '@forgerock/platform-shared/src/mixins/ThemeMixin';
import TranslationMixin from '@forgerock/platform-shared/src/mixins/TranslationMixin';
import ValidationRules from '@forgerock/platform-shared/src/utils/validationRules';
import createScriptTags from '@forgerock/platform-shared/src/utils/externalScriptUtils';
import FrLayout from '@forgerock/platform-shared/src/components/Layout';
import FrSessionTimeoutWarning from '@forgerock/platform-shared/src/components/SessionTimeoutWarning/SessionTimeoutWarning';
import { getIdmServerInfo } from '@forgerock/platform-shared/src/api/ServerinfoApi';
import ThemeInjector from '@forgerock/platform-shared/src/components/ThemeInjector/';
import { getDefaultProcess } from '@forgerock/platform-shared/src/views/AutoAccess/RiskConfig/api/RiskConfigAPI';
import { getConfig } from '@forgerock/platform-shared/src/views/AutoAccess/Shared/utils/api';
import i18n from '@/i18n';
import './scss/main.scss';

export default {
  name: 'App',
  mixins: [
    NotificationMixin,
    RestMixin,
    ThemeMixin,
    TranslationMixin,
  ],
  components: {
    FrLayout,
    FrSessionTimeoutWarning,
    ThemeInjector,
  },
  computed: {
    accountFooter() {
      if (this.theme && this.theme.accountFooterEnabled) {
        return this.$sanitize(this.getLocalizedString(this.theme.accountFooter, i18n.locale, i18n.fallbackLocale));
      }
      return '';
    },
    ...mapState(useEnduserStore, { accessObj: 'access' }),
  },
  data() {
    return {
      menuItems: [
        {
          routeTo: { name: 'Dashboard' },
          displayName: 'sideMenu.dashboard',
          icon: 'dashboard',
        },
        (this.$store.state.SharedStore.governanceEnabled === true
          ? {
            menuGroup: true,
            displayName: 'sideMenu.inbox',
            icon: 'inbox',
            subItems: [
              {
                showBadgeWithContentFromStore: 'approvalsCount',
                displayName: 'sideMenu.approvals',
                routeTo: {
                  name: 'Approvals',
                },
              },
              {
                showBadgeWithContentFromStore: 'certificationCount',
                displayName: 'sideMenu.accessReviews',
                routeTo: {
                  name: 'AccessReviews',
                },
              },
            ],
          }
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
        (this.$store.state.SharedStore.governanceEnabled === true
          ? {
            displayName: 'sideMenu.myAccess',
            icon: 'badge',
            subItems: [
              {
                displayName: 'sideMenu.accounts',
                routeTo: { name: 'Accounts' },
              },
              {
                displayName: 'sideMenu.roles',
                routeTo: { name: 'Roles' },
              },
              {
                displayName: 'sideMenu.entitlements',
                routeTo: { name: 'Entitlements' },
              },
            ],
          }
          : {}),
        (this.$store.state.SharedStore.governanceEnabled === true
          ? {
            menuGroup: true,
            displayName: 'sideMenu.directory',
            icon: 'people',
            subItems: [
              {
                displayName: 'sideMenu.delegates',
                routeTo: { name: 'Delegates' },
              },
              {
                displayName: 'sideMenu.directReports',
                routeTo: { name: 'DirectReports' },
              },
            ],
          }
          : {}),
        (this.$store.state.SharedStore.governanceEnabled === true
          ? {
            routeTo: { name: 'MyRequests' },
            displayName: 'sideMenu.requests',
            icon: 'person_add',
          }
          : {}),
        {
          routeTo: { name: 'Profile' },
          displayName: 'sideMenu.profile',
          icon: 'account_circle',
        },
      ],
      version: '',
    };
  },
  created() {
    // add vee-validate rules
    const rules = ValidationRules.getRules(i18n);
    ValidationRules.extendRules(rules);

    // if this is a dns alias making this call will get the true realm when no realm param is provided
    this.setTheme(this.$store.state.realm, { themeId: localStorage.getItem('theme-id') }).then(() => {
      if (this.favicon) {
        document.getElementById('favicon').href = this.localizedFavicon;
      }
    }).catch((error) => {
      this.showErrorMessage(error, this.$t('errors.themeSetError'));
    });
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
  },
  watch: {
    /**
     * when we receive user-saved data of managed resources,
     * add them to iterated selectable menu items (Mainly used for Delegated Admin)
     */
    accessObj() {
      const accessObj = cloneDeep(this.accessObj);
      accessObj.sort((a, b) => {
        if (a.title > b.title) {
          return 1;
        }
        if (a.title < b.title) {
          return -1;
        }
        return 0;
      });
      accessObj.forEach((obj) => {
        const splitObj = obj.privilegePath.split('/');
        this.menuItems.push({
          displayName: this.getTranslation(capitalize(obj.title)),
          icon: this.accessIcon(obj),
          routeTo: {
            name: 'ListResource',
            params: { resourceName: splitObj[1], resourceType: splitObj[0] },
          },
        });
      });
    },
    /**
     * Adds the given script tags to the script container
     */
    journeyFooterScriptTag(scriptStr) {
      if (!this.journeyFooterScriptTagEnabled || !scriptStr) return;
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
    accessIcon(accessObject) {
      let matIcon = 'check_box_outline_blank';
      if (accessObject['mat-icon'] && accessObject['mat-icon'].length && accessObject['mat-icon'].substring(0, 3) !== 'fa-') {
        matIcon = accessObject['mat-icon'];
      }

      return matIcon;
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
          menuGroup: true,
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
      this.menuItems.splice(6, 0, autoAccessAdminMenu);
    },
    showRiskDashboad() {
      const autoAccessDashboardMenu = [
        {
          displayName: 'sideMenu.riskDashboard',
          routeTo: { name: 'RiskDashboard' },
          icon: 'show_chart',
        },
      ];
      this.menuItems.splice(1, 0, autoAccessDashboardMenu);
    },
  },
};
</script>
