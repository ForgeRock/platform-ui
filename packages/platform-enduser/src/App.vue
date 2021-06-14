<!-- Copyright (c) 2020-2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <FrLayout
      :footer="accountFooter"
      :is-enduser="true"
      :is-fraas="$store.state.isFraas"
      :menu-items="menuItems"
      :user-details="userDetails"
      :version="version">
      <RouterView
        :key="$route.fullPath"
        :theme="theme" />
    </FrLayout>
    <ThemeInjector
      :theme="theme"
      :is-enduser="true"
      v-if="theme !== null" />
  </div>
</template>

<script>
import {
  capitalize,
  cloneDeep,
} from 'lodash';
import {
  mapGetters,
  mapState,
} from 'vuex';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import ThemeMixin from '@forgerock/platform-shared/src/mixins/ThemeMixin';
import FrLayout from '@forgerock/platform-shared/src/components/Layout';
import { getAmServerInfo, getIdmServerInfo } from '@forgerock/platform-shared/src/api/ServerinfoApi';
import ThemeInjector from '@forgerock/platform-shared/src/components/ThemeInjector/';
import './scss/main.scss';

export default {
  name: 'App',
  mixins: [
    NotificationMixin,
    RestMixin,
    ThemeMixin,
  ],
  components: {
    FrLayout,
    ThemeInjector,
  },
  computed: {
    accountFooter() {
      if (this.theme) {
        return this.theme.accountFooter;
      }
      return '';
    },
    ...mapState({
      accessObj: (state) => state.UserStore.access,
    }),
    ...mapGetters({
      userDetails: 'UserStore/userDetails',
    }),
  },
  data() {
    return {
      menuItems: [{
        routeTo: { name: 'Dashboard' },
        displayName: this.$t('sideMenu.dashboard'),
        icon: 'dashboard',
      }, {
        routeTo: { name: 'Profile' },
        displayName: this.$t('sideMenu.profile'),
        icon: 'account_circle',
      }],
      version: '',
    };
  },
  created() {
    // if this is a dns alias making this call will get the true realm when no realm param is provided
    getAmServerInfo().then(({ data }) => {
      this.setTheme(data.realm).then(() => {
        if (this.favicon) {
          document.getElementById('favicon').href = this.favicon;
        }
      });
    }, (error) => {
      this.showErrorMessage(error, this.$t('errors.couldNotRetrieveConfigurationInfo'));
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
          displayName: capitalize(obj.title),
          icon: this.accessIcon(obj),
          routeTo: {
            name: 'ListResource',
            params: { resourceName: splitObj[1], resourceType: splitObj[0] },
          },
        });
      });
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
  },
};
</script>
