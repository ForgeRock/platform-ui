<!-- Copyright 2019-2020 ForgeRock AS. All Rights Reserved

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
  window.location.href = `${store.state.loginURL}/${encodeURIComponent(window.location.href)}`;
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
/**
  * @param {string} url - current url after successful login
  * If the url contains either a 'goto' query (i.e. ?goto=www.test.com)
  * or a 'goto' param (i.e. ../Login/http%3A%2F%2Ftest.com)
  * validate the goto url.
  *
  * If it has been registered in AM, redirect the user to the url
  * Else redirect to the default login url.
  */
export function verifyGotoUrlAndRedirect(url) {
  const isNotDefaultPath = (path) => path !== '/am/console';

  if (this.$route.params.gotoUrl || this.$route.query.goto) {
    const gotoUrl = JSON.stringify({ goto: decodeURIComponent(this.$route.params.gotoUrl || this.$route.query.goto) });

    this.getRequestService({
      context: 'AM',
      apiVersion: 'protocol=2.1,resource=3.0',
    }).post('/users?_action=validateGoto',
      gotoUrl,
      { withCredentials: true })
      .then((res) => {
        if (isNotDefaultPath(res.data.successURL)) {
          window.location.href = res.data.successURL;
        } else {
          window.location.href = url;
        }
      })
      .catch(() => {
        // validation failed - no need to display error - attempt to redirect to url
        window.location.href = url;
      });
  } else {
    // no goto - redirect to url
    window.location.href = url;
  }
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
    verifyGotoUrlAndRedirect,
  },
};
</script>
