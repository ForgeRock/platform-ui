<!-- Copyright (c) 2020-2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
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
          :journey-footer="journeyFooter"
          :journey-footer-enabled="journeyFooterEnabled"
          :journey-header="journeyHeader"
          :journey-header-enabled="journeyHeaderEnabled"
          :journey-theater-mode="journeyTheaterMode"
          :journey-justified-content="journeyJustifiedContent"
          :journey-justified-content-enabled="journeyJustifiedContentEnabled"
          :journey-layout="journeyLayout"
          :logo-alt-text="logoAltText"
          :logo-enabled="logoEnabled"
          :logo-height="logoHeight"
          :logo-path="logo"
          :key="$route.fullPath"
          @set-theme="setupTheme" />
      </Transition>
    </div>
    <!-- Application View -->
    <!-- eslint-disable-next-line vue/component-name-in-template-casing -->
    <notifications
      class="ml-3"
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
import ThemeMixin from '@forgerock/platform-shared/src/mixins/ThemeMixin';
import ValidationRules from '@forgerock/platform-shared/src/utils/validationRules';
import i18n from './i18n';
import './scss/main.scss';

export default {
  name: 'App',
  components: {
    FrAlert: Alert,
    ThemeInjector,
  },
  mixins: [
    RestMixin,
    ThemeMixin,
  ],
  created() {
    // add vee-validate rules
    const rules = ValidationRules.getRules(i18n);
    ValidationRules.extendRules(rules);
  },
  methods: {
    setupTheme(realm, tree) {
      const themeId = localStorage.getItem('theme-id');
      const themeOpts = { tree, themeId };
      this.setTheme(realm, themeOpts).then(() => {
        if (this.favicon) {
          document.getElementById('favicon').href = this.favicon;
        }
      });
    },
  },
};
</script>
