<!--
Copyright (c) 2020 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details.
-->
<template>
  <div id="app">
    <ThemeInjector
      :theme="theme"
      v-if="theme !== null" />
    <div
      id="appContentWrapper"
      class="h-100">
      <Transition
        name="fade"
        mode="out-in">
        <RouterView
          :logo="logo"
          :key="$route.fullPath" />
      </Transition>
    </div>
    <!-- Application View -->
    <!-- eslint-disable-next-line vue/component-name-in-template-casing -->
    <notifications
      position="bottom left"
      width="320"
      :duration="4000">
      <template v-slot:body="props">
        <FrAlert
          :variant="props.item.type"
          show>
          {{ props.item.text }}
        </FrAlert>
      </template>
    </notifications>
  </div>
</template>

<script>
import Alert from '@forgerock/platform-shared/src/components/Alert/';
import ThemeInjector from '@forgerock/platform-shared/src/components/ThemeInjector/';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import './scss/main.scss';

export default {
  name: 'App',
  components: {
    FrAlert: Alert,
    ThemeInjector,
  },
  mixins: [
    RestMixin,
  ],
  data() {
    return {
      logo: `${process.env.BASE_URL}images/vertical-logo.svg`,
      theme: null,
    };
  },
  created() {
    const urlParams = new URLSearchParams(window.location.search);
    const idmRequestService = this.getRequestService({
      'X-OpenIDM-NoSession': true,
      'X-OpenIDM-Password': 'anonymous',
      'X-OpenIDM-Username': 'anonymous',
      'cache-control': 'no-cache',
    });

    const realm = urlParams.get('realm') || '/';

    idmRequestService.get('/config/ui/themerealm').then((results) => {
      let cleanRealm = realm;

      // If there is a / we need to remove it so that
      // both test and /test result in the same realm theme
      if (results.data.realm[cleanRealm] === undefined && cleanRealm.charAt(0) === '/') {
        cleanRealm = cleanRealm.substring(1);
      }

      // Set all realm related themeing here
      if (results.data.realm[cleanRealm]) {
        this.theme = results.data.realm[cleanRealm];
        this.logo = results.data.realm[cleanRealm].logo;
      } else {
        this.theme = null;
      }
    }).catch(() => {
      this.theme = null;
    });
  },
};
</script>
