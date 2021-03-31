<!-- Copyright (c) 2020-2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <FrLayout
      :menu-items="menuItems"
      :is-enduser="true"
      :version="version">
      <RouterView :key="this.$route.fullPath" />
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
import { mapState } from 'vuex';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import LoginMixin from '@forgerock/platform-shared/src/mixins/LoginMixin';
import FrLayout from '@forgerock/platform-shared/src/components/Layout';
import { getIdmServerInfo } from '@forgerock/platform-shared/src/api/ServerinfoApi';
import ThemeInjector from '@forgerock/platform-shared/src/components/ThemeInjector/';
import './scss/main.scss';

export default {
  name: 'App',
  mixins: [
    NotificationMixin,
    RestMixin,
    LoginMixin,
  ],
  components: {
    FrLayout,
    ThemeInjector,
  },
  computed: {
    ...mapState({
      accessObj: (state) => state.UserStore.access,
    }),
  },
  data() {
    return {
      menuItems: [{
        routeName: 'Dashboard',
        displayName: this.$t('sideMenu.dashboard'),
        icon: 'dashboard',
      }, {
        routeName: 'Profile',
        displayName: this.$t('sideMenu.profile'),
        icon: 'account_circle',
      }],
      version: '',
      theme: null,
    };
  },
  created() {
    // if this is a dns alias making this call will get the true realm when no realm param is provided
    this.getConfigurationInfo().then((config) => {
      this.setTheme(config.data.realm);
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
          routeName: 'ListResource',
          resourceName: splitObj[1],
          resourceType: splitObj[0],
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
