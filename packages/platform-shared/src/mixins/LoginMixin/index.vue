<!-- Copyright 2019 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<script>
import {
  isNull,
} from 'lodash';
import AppAuthHelper from 'appauthhelper';
import store from '../../store/index';
import i18n from '../../i18n';

export function redirectToLogin() {
  window.location.href = store.state.loginURL;
}

export function appAuthLogout() {
  AppAuthHelper.logout().then(() => {
    if (store.state.loginURL) {
      redirectToLogin();
    } else {
      AppAuthHelper.getTokens();
    }
  },
  () => {
    this.displayNotification({
      group: 'AdminMessage',
      type: 'danger',
      text: i18n.t('application.errors.failedLogout'),
    });
  });
}

export default {
  name: 'LoginMixin',
  methods: {
    logoutUser() {
      window.logout();
    },
    // One location for checking and redirecting a completed login for a user
    completeLogin() {
      if (!isNull(store.state.ApplicationStore.loginRedirect)) {
        this.$router.push(store.state.ApplicationStore.loginRedirect);
        store.dispatch('ApplicationStore/clearLoginRedirect');
      } else {
        this.$router.push('/');
      }
    },
    systemLogout() {
      appAuthLogout();
    },
  },
};
</script>
