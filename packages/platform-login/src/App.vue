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
  mounted() {
    const urlParams = new URLSearchParams(window.location.search);
    const idmRequestService = this.getRequestService({
      'X-OpenIDM-NoSession': true,
      'X-OpenIDM-Password': 'anonymous',
      'X-OpenIDM-Username': 'anonymous',
      'cache-control': 'no-cache',
    });

    const realm = urlParams.get('realm') || '/';

    idmRequestService.get('/config/ui/themelogin').then((results) => {
      // Set all realm related themeing here
      if (results.data.realmTheme[realm]) {
        this.theme = results.data.realmTheme[realm];
        this.logo = results.data.realmTheme[realm].logo;
      } else {
        this.theme = null;
      }
    }).catch(() => {
      this.theme = null;
    });
  },
};
</script>
