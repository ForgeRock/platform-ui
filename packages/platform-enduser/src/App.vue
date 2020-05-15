<!-- Copyright 2019-2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <Layout
    @logout="this.logoutUser"
    :menu-items="menuItems"
    :user-details="userDetails">
    <RouterView :key="this.$route.fullPath" />
  </Layout>
</template>

<script>
import {
  capitalize,
  cloneDeep,
} from 'lodash';
import { mapState } from 'vuex';
import LoginMixin from '@forgerock/platform-shared/src/mixins/LoginMixin';
import Layout from '@forgerock/platform-shared/src/components/Layout';
import './scss/main.scss';

export default {
  name: 'App',
  mixins: [
    LoginMixin,
  ],
  components: {
    Layout,
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
    };
  },
  mounted() {
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
          adminURL: state.ApplicationStore.adminURL,
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
          icon: this.accessIcon(obj.icon),
          routeName: 'ListResource',
          resourceName: splitObj[1],
          resourceType: splitObj[0],
        });
      });
    },
  },
  methods: {
    accessIcon(icon) {
      let matIcon = 'check_box_outline_blank';
      if (icon && icon.length && icon.substring(0, 3) !== 'fa-') {
        matIcon = icon;
      }

      return matIcon;
    },
  },
};
</script>
