<!--
Copyright (c) 2020 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details.
-->
<template>
  <FrLayout
    :menu-items="menuItems"
    :user-details="userDetails"
    :version="version">
    <RouterView :key="this.$route.fullPath" />
  </FrLayout>
</template>

<script>
import {
  capitalize,
  cloneDeep,
} from 'lodash';
import { mapState } from 'vuex';
import LoginMixin from '@forgerock/platform-shared/src/mixins/LoginMixin';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import FrLayout from '@forgerock/platform-shared/src/components/Layout';
import { getIdmServerInfo } from '@forgerock/platform-shared/src/api/ServerinfoApi';
import './scss/main.scss';

export default {
  name: 'App',
  mixins: [
    LoginMixin,
    NotificationMixin,
  ],
  components: {
    FrLayout,
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
    };
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
  computed: {
    ...mapState({
      internalUser: (state) => state.UserStore.internalUser,
      userId: (state) => state.UserStore.userId,
      adminUser: (state) => state.UserStore.adminUser,
      accessObj: (state) => state.UserStore.access,
      adminURL: (state) => state.ApplicationStore.adminURL,
      userDetails: (state) => {
        let userFullName;
        const {
          givenName,
          sn,
          userName,
          company,
          email,
          adminUser,
          userId,
        } = state.UserStore;
        if (givenName || sn) {
          userFullName = `${givenName} ${sn}`;
        } else {
          userFullName = userName || userId;
        }
        return {
          name: userFullName,
          company: company || 'ForgeRock',
          email,
          adminUser,
          adminURL: `${state.ApplicationStore.adminURL}?realm=${state.realm}`,
          roles: [],
        };
      },
    }),
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
