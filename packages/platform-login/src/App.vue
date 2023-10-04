<!-- Copyright (c) 2020-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div
    id="app"
    :class="{ invisible: hideAppOnTransition }">
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
          :journey-floating-labels="journeyFloatingLabels"
          :journey-footer="localizedFooter"
          :journey-footer-enabled="journeyFooterEnabled"
          :journey-footer-script-tag="journeyFooterScriptTag"
          :journey-footer-script-tag-enabled="journeyFooterScriptTagEnabled"
          :journey-header="localizedHeader"
          :journey-header-enabled="journeyHeaderEnabled"
          :journey-header-skip-link-enabled="journeyHeaderSkipLinkEnabled"
          :journey-theater-mode="journeyTheaterMode"
          :journey-justified-content="localizedJustifiedContent"
          :journey-justified-content-enabled="journeyJustifiedContentEnabled"
          :journey-justified-content-mobile-view-enabled="journeyJustifiedContentMobileViewEnabled"
          :journey-layout="journeyLayout"
          :journey-sign-in-button-position="journeySignInButtonPosition"
          :logo-alt-text="localizedLogoAltText"
          :logo-enabled="logoEnabled"
          :logo-height="logoHeight"
          :logo-path="localizedLogo"
          :key="$route.fullPath"
          :theme-loading="theme === null"
          @set-theme="setupTheme"
          @component-ready="themeTransitionHandler" />
      </Transition>
    </div>
    <!-- Application View -->
    <notifications
      class="ml-3"
      position="bottom left"
      width="320"
      :duration="4000">
      <template #body="props">
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
import TranslationMixin from '@forgerock/platform-shared/src/mixins/TranslationMixin';
import ValidationRules from '@forgerock/platform-shared/src/utils/validationRules';
import createScriptTags from '@forgerock/platform-shared/src/utils/externalScriptUtils';
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
    TranslationMixin,
  ],
  data() {
    return {
      hideAppOnTransition: false,
      localizedFooter: '',
      localizedHeader: '',
      localizedJustifiedContent: '',
      localizedLogo: '',
      localizedLogoAltText: '',
    };
  },
  created() {
    // add vee-validate rules
    const rules = ValidationRules.getRules(i18n);
    ValidationRules.extendRules(rules);
  },
  methods: {
    setupTheme(realm, treeId, nodeThemeId) {
      // Check if web storage exists before trying to use it. This allows
      // theming to gracefully fail in the case it doesn't exist - see
      // IAM-1873
      const { webStorageAvailable } = this.$store.state.SharedStore;
      const themeId = webStorageAvailable ? localStorage.getItem('theme-id') : null;
      const themeOpts = { treeId, themeId, nodeThemeId };
      this.setTheme(realm, themeOpts).then(() => {
        if (this.favicon) {
          document.getElementById('favicon').href = this.localizedFavicon;
        }
      });
    },
    themeTransitionHandler(val) {
      if (val === 'error') {
        this.hideAppOnTransition = false;
        return;
      }
      this.hideAppOnTransition = true;
    },
  },
  watch: {
    theme: {
      deep: true,
      handler() {
        this.hideAppOnTransition = false;
        this.localizedFooter = this.getLocalizedString(this.journeyFooter, i18n.locale, i18n.fallbackLocale);
        this.localizedHeader = this.getLocalizedString(this.journeyHeader, i18n.locale, i18n.fallbackLocale);
        this.localizedJustifiedContent = this.getLocalizedString(this.journeyJustifiedContent, i18n.locale, i18n.fallbackLocale);
        this.localizedLogo = this.getLocalizedString(this.logo, i18n.locale, i18n.fallbackLocale);
        this.localizedLogoAltText = this.getLocalizedString(this.logoAltText, i18n.locale, i18n.fallbackLocale);
      },
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
};
</script>
