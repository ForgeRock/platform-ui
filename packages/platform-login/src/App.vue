<!-- Copyright (c) 2020-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div
    id="app"
    :class="{ invisible: hideAppOnTransition }">
    <ThemeInjector
      :theme="theme"
      v-if="theme !== null && Object.keys(theme).length > 0" />
    <div
      id="appContentWrapper"
      class="h-100">
      <RouterView v-slot="{ Component }">
        <Transition
          name="fade"
          mode="out-in">
          <Component
            :is="Component"
            :journey-a11y-add-fallback-error-heading="theme.journeyA11yAddFallbackErrorHeading"
            :journey-floating-labels="theme.journeyFloatingLabels"
            :journey-focus-first-focusable-item-enabled="theme.journeyFocusFirstFocusableItemEnabled"
            :journey-focus-element="theme.journeyFocusElement"
            :journey-footer="localizedFooter"
            :journey-footer-enabled="theme.journeyFooterEnabled"
            :journey-header="localizedHeader"
            :journey-header-enabled="theme.journeyHeaderEnabled"
            :journey-header-skip-link-enabled="theme.journeyHeaderSkipLinkEnabled"
            :journey-remember-me-enabled="theme.journeyRememberMeEnabled"
            :journey-remember-me-label="theme.journeyRememberMeLabel"
            :journey-theater-mode="theme.journeyTheaterMode"
            :journey-justified-content="localizedJustifiedContent"
            :journey-justified-content-enabled="theme.journeyJustifiedContentEnabled"
            :journey-justified-content-mobile-view-enabled="theme.journeyJustifiedContentMobileViewEnabled"
            :journey-layout="theme.journeyLayout"
            :journey-sign-in-button-position="theme.journeySignInButtonPosition"
            :key="$route.fullPath"
            :logo-alt-text="localizedLogoAltText"
            :logo-enabled="theme.logoEnabled"
            :logo-height="theme.logoHeight"
            :logo-path="localizedLogo"
            :theme-loading="theme === null"
            @component-ready="themeTransitionHandler"
            @set-theme="setupTheme" />
        </Transition>
      </RouterView>
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
import TranslationMixin from '@forgerock/platform-shared/src/mixins/TranslationMixin';
import ValidationRules from '@forgerock/platform-shared/src/utils/validationRules';
import createScriptTags from '@forgerock/platform-shared/src/utils/externalScriptUtils';
import useTheme from '@forgerock/platform-shared/src/composables/theme';
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
    TranslationMixin,
  ],
  setup() {
    const {
      getAllThemes,
      loadTheme,
      localizedFavicon,
      realmThemes,
      theme,
    } = useTheme();
    return {
      getAllThemes,
      loadTheme,
      localizedFavicon,
      realmThemes,
      theme,
    };
  },
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
    /** Save to localStorage to override default theme on subsequent requests until explicitly
     * changed by another node or tree. Checks if web storage exists before saving to it (IAM-1873)
     * @param {string} themeId - the theme id to save to local storage
     */
    saveToLocalStorage(themeId) {
      if (this.$store.state.SharedStore.webStorageAvailable) {
        localStorage.setItem('theme-id', themeId);
      }
    },
    /**
     * Determines if the current theme should be set from a page node (if the page node
     * has a theme attached to it), a journey (as a fallback and if the journey has a theme
     * attached to it), or the default theme for the realm. If either a node or tree theme is used,
     * it is saved to local storage to then be the theme used by enduser after logging in.
     * @param realm The current realm
     * @param treeId unique id of the tree/journey we are viewing
     * @param nodeThemeId unique id of the theme attached to the current node
     */
    async setupTheme(realm, treeId, nodeThemeId) {
      let cleanRealm = realm === 'root' ? '/' : realm;
      if (cleanRealm.length > 1 && cleanRealm.charAt(0) === '/') {
        cleanRealm = cleanRealm.substring(1);
      }
      this.journeyFocusElement = undefined;
      let themeId = this.$store.state.SharedStore.webStorageAvailable ? localStorage.getItem('theme-id') : null;
      if (nodeThemeId) {
        // Prioritize node themes over tree themes
        themeId = nodeThemeId;
      } else if (treeId) {
        // Next priority is theme assigned to tree, so we need to check if the tree is linked to a theme
        await this.getAllThemes();
        const treeTheme = this.realmThemes[cleanRealm]?.find((realmTheme) => (realmTheme.linkedTrees?.includes(treeId)));
        if (treeTheme) {
          themeId = treeTheme._id;
        }
      }
      if (themeId) {
        // A theme was set by a node or tree, so save it to local storage
        this.saveToLocalStorage(themeId);
      }

      const useStaticTheme = this.$store.state.SharedStore.isFraas && cleanRealm === '/';
      await this.loadTheme(cleanRealm, themeId, false, useStaticTheme);
      if (this.localizedFavicon) {
        document.getElementById('favicon').href = this.localizedFavicon;
      }
      this.hideAppOnTransition = false;
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
      handler(theme) {
        this.localizedFooter = this.getLocalizedString(theme.journeyFooter, i18n.global.locale, i18n.global.fallbackLocale);
        this.localizedHeader = this.getLocalizedString(theme.journeyHeader, i18n.global.locale, i18n.global.fallbackLocale);
        this.localizedJustifiedContent = this.getLocalizedString(theme.journeyJustifiedContent, i18n.global.locale, i18n.global.fallbackLocale);
        this.localizedLogo = this.getLocalizedString(theme.logo, i18n.global.locale, i18n.global.fallbackLocale);
        this.localizedLogoAltText = this.getLocalizedString(theme.logoAltText, i18n.global.locale, i18n.global.fallbackLocale);
        // Adds the given script tags to the script container
        if (!theme.journeyFooterScriptTagEnabled || !theme.journeyFooterScriptTag) return;
        const scriptContainer = document.getElementById('user-theme-script-container');

        try {
          // Note: if the user provides invalid html that is unable to be parsed, this could cause an error which we need to catch
          const scripts = createScriptTags(theme.journeyFooterScriptTag);

          scripts.forEach((scriptTag) => {
            scriptContainer.appendChild(scriptTag);
          });
        } catch (error) {
          this.showErrorMessage(error, this.$t('errors.userScriptError'));
        }
      },
    },
  },
};
</script>
