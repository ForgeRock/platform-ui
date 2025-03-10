<!-- Copyright (c) 2021-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<script>
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import TranslationMixin from '@forgerock/platform-shared/src/mixins/TranslationMixin';
import { putConfig } from '@forgerock/platform-shared/src/api/ConfigApi';
import { convertBase64ToString, convertStringToBase64 } from '@forgerock/platform-shared/src/utils/encodeUtils';
import uuid from 'uuid/v4';
import { sortBy, cloneDeep } from 'lodash';
import store from '@forgerock/platform-shared/src/store';
import i18n from '@/i18n';

export default {
  name: 'ThemeMixin',
  mixins: [
    NotificationMixin,
    RestMixin,
    TranslationMixin,
  ],
  data() {
    return {
      defaultThemeParams: {
        accountCardBackgroundColor: '#ffffff',
        accountCardHeaderColor: '#23282e',
        accountCardInnerBorderColor: '#e7eef4',
        accountCardInputBackgroundColor: '#ffffff',
        accountCardInputBorderColor: '#c0c9d5',
        accountCardInputFocusBorderColor: '#324054',
        accountCardInputLabelColor: '#5e6d82',
        accountCardInputSelectColor: '#e4f4fd',
        accountCardInputSelectHoverColor: '#f6f8fa',
        accountCardInputTextColor: '#23282e',
        accountCardOuterBorderColor: '#e7eef4',
        accountCardShadow: 3,
        accountCardTabActiveColor: '#e4f4fd',
        accountCardTabActiveBorderColor: '#109cf1',
        accountCardTextColor: '#5e6d82',
        accountFooter: `<div class="d-flex justify-content-center py-4 w-100"><span class="pr-1">© ${new Date().getFullYear()}</span>\n<a href="#" target="_blank" class="text-body">My Company, Inc</a><a href="#" target="_blank" style="color: #0000ee" class="pl-3 text-body">Privacy Policy</a><a href="#" target="_blank" style="color: #0000ee" class="pl-3 text-body">Terms & Conditions</a></div>`,
        accountFooterEnabled: false,
        accountFooterScriptTag: '',
        accountFooterScriptTagEnabled: false,
        accountNavigationBackgroundColor: '#ffffff',
        accountNavigationTextColor: '#455469',
        accountNavigationToggleBorderColor: '#e7eef4',
        accountTableRowHoverColor: '#f6f8fa',
        backgroundColor: '#324054',
        backgroundImage: '',
        buttonRounded: 5,
        buttonFocusBorderColor: '#0778d6',
        dangerColor: '#f7685b',
        warningColor: '#ffb946',
        infoColor: '#109cf1',
        darkColor: '#23282e',
        lightColor: '#f6f8fa',
        favicon: 'https://cdn.forgerock.com/platform/themes/starter/logo-starter.svg',
        fontFamily: 'Open Sans',
        journeyCardBackgroundColor: '#ffffff',
        journeyCardHeaderBackgroundColor: '#ffffff',
        journeyCardShadow: 3,
        journeyCardBorderRadius: 4,
        journeyCardTextColor: '#5e6d82',
        journeyCardTitleColor: '#23282e',
        journeyFloatingLabels: true,
        journeyFocusElement: 'header',
        journeyFooter: `<div class="d-flex justify-content-center py-4 w-100"><span class="pr-1">© ${new Date().getFullYear()}</span>\n<a href="#" target="_blank" class="text-body">My Company, Inc</a><a href="#" target="_blank" style="color: #0000ee" class="pl-3 text-body">Privacy Policy</a><a href="#" target="_blank" style="color: #0000ee" class="pl-3 text-body">Terms & Conditions</a></div>`,
        journeyFooterEnabled: false,
        journeyFooterScriptTag: '',
        journeyFooterScriptTagEnabled: false,
        journeyHeader: '<div class="d-flex justify-content-center py-4 flex-grow-1">Header Content</div>',
        journeyHeaderEnabled: false,
        journeyHeaderSkipLinkEnabled: false,
        journeyInputBackgroundColor: '#ffffff',
        journeyInputBorderColor: '#c0c9d5',
        journeyInputFocusBorderColor: '#324054',
        journeyInputLabelColor: '#5e6d82',
        journeyInputSelectColor: '#e4f4fd',
        journeyInputSelectHoverColor: '#f6f8fa',
        journeyInputTextColor: '#23282e',
        journeyRememberMeEnabled: false,
        journeyRememberMeLabel: '',
        journeyTheaterMode: false,
        journeyJustifiedContent: '',
        journeyJustifiedContentEnabled: false,
        journeyJustifiedContentMobileViewEnabled: false,
        journeyLayout: 'card',
        journeySignInButtonPosition: 'flex-column',
        linkActiveColor: '#004067',
        linkColor: '#0070b3',
        linkedTrees: [],
        logo: 'https://cdn.forgerock.com/platform/themes/starter/logo-starter.svg',
        logoAltText: 'Logo',
        logoEnabled: true,
        logoHeight: '56',
        logoProfile: 'https://cdn.forgerock.com/platform/themes/starter/logo-starter-full.svg',
        logoProfileAltText: 'Logo',
        logoProfileCollapsed: 'https://cdn.forgerock.com/platform/themes/starter/logo-starter.svg',
        logoProfileCollapsedAltText: 'Logo',
        logoProfileHeight: '24',
        primaryColor: '#324054',
        primaryOffColor: '#242E3C',
        profileBackgroundColor: '#ffffff',
        profileMenuHighlightColor: '#f6f8fa',
        profileMenuTextHighlightColor: '#455469',
        profileMenuHoverColor: '#f6f8fa',
        profileMenuHoverTextColor: '#455469',
        successColor: '#2ed47a',
        textColor: '#ffffff',
        topBarBackgroundColor: '#ffffff',
        topBarBorderColor: '#e7eef4',
        topBarHeaderColor: '#23282e',
        topBarTextColor: '#69788b',
      },
      favicon: '',
      accountFooterScriptTag: '',
      accountFooterScriptTagEnabled: false,
      journeyFloatingLabels: true,
      journeyFocusElement: 'header',
      journeyFooter: '',
      journeyFooterEnabled: false,
      journeyFooterScriptTag: '',
      journeyFooterScriptTagEnabled: false,
      journeyHeader: '',
      journeyHeaderEnabled: false,
      journeyHeaderSkipLinkEnabled: false,
      journeyRememberMeEnabled: false,
      journeyRememberMeLabel: '',
      journeyTheaterMode: false,
      journeyJustifiedContent: '',
      journeyJustifiedContentEnabled: false,
      journeyJustifiedContentMobileViewEnabled: false,
      journeyLayout: 'card',
      journeySignInButtonPosition: 'flex-column',
      logoHeight: '40',
      logoProfileHeight: '40',
      logo: '',
      logoAltText: '',
      logoEnabled: true,
      theme: null,
      themesConfig: { realm: {} },
      realmThemeNames: [],
    };
  },
  computed: {
    localizedFavicon() {
      return this.getLocalizedString(this.favicon, i18n.global.locale, i18n.global.fallbackLocale);
    },
  },
  methods: {
    /**
     * Sets up the current theme based on whether we are using tree, org, existing tree etc.
     * @param {string} realm - The current realm
     * @param {object} themeOptions - the tree/themeId/org/etc data we are using to find the correct theme
     */
    setTheme(realm, themeOptions) {
      const idmRequestService = this.getRequestService({
        timeout: 150000,
      });

      return idmRequestService.get('/config/ui/themerealm').then((results) => {
        const themeResults = results.data.realm;
        let cleanRealm = realm === 'root' ? '/' : realm;

        // If there is a /, remove it so both test and /test result in same realm theme
        if (themeResults[cleanRealm] === undefined && cleanRealm.charAt(0) === '/') {
          cleanRealm = cleanRealm.substring(1);
        }

        let theme = themeResults[cleanRealm];

        if (theme && !theme.backgroundColor) {
          if (themeOptions.nodeThemeId) {
            // Prioritize node themes over tree themes
            themeOptions.themeId = themeOptions.nodeThemeId;
            // Check if web storage exists before trying to use it. This allows
            // theming to gracefully fail in the case it doesn't exist - see
            // IAM-1873
            if (store.state.SharedStore.webStorageAvailable) {
              localStorage.setItem('theme-id', themeOptions.nodeThemeId);
            }
          } else if (themeOptions.treeId) {
            // treeId tells us this invocation is coming from the login ui
            const treeTheme = theme.find((realmTheme) => (realmTheme.linkedTrees && realmTheme.linkedTrees.includes(themeOptions.treeId)));
            if (treeTheme) {
              // If there is a tree theme use that theme as the current theme for display and
              // set localStorage theme-id to override the default theme on any subsequent request
              // on the user's browser until explicitly changed by another node or tree.
              themeOptions.themeId = treeTheme._id;
              // Check if web storage exists before trying to use it. This allows
              // theming to gracefully fail in the case it doesn't exist - see
              // IAM-1873
              if (store.state.SharedStore.webStorageAvailable) {
                localStorage.setItem('theme-id', treeTheme._id);
              }
            }
          }
          if (themeOptions.themeId) {
            // themeId can come from node, journey, or a saved localStorage value. Find by _id or name and use it here.
            theme = theme.find((realmTheme) => realmTheme._id === themeOptions.themeId || realmTheme.name === themeOptions.themeId);
            if (!theme) {
              const defaultTheme = themeResults[cleanRealm].find((realmTheme) => realmTheme.isDefault === true);
              this.journeyFocusElement = defaultTheme.journeyFocusElement;
            }
          } else {
            // Use the default theme
            theme = theme.find((realmTheme) => realmTheme.isDefault);
          }
        }
        // Set all realm related theming here
        if (theme) {
          // eslint-disable-next-line global-require
          const placeholderImage = require('@forgerock/platform-shared/src/assets/images/placeholder.svg');
          this.theme = theme;
          this.favicon = theme.favicon;
          this.journeyA11yAddFallbackErrorHeading = theme.journeyA11yAddFallbackErrorHeading;
          this.journeyFloatingLabels = theme.journeyFloatingLabels;
          this.journeyFocusElement = theme.journeyFocusElement;
          this.journeyFooter = theme.journeyFooter;
          this.journeyFooterEnabled = theme.journeyFooterEnabled;
          this.accountFooterScriptTag = theme.accountFooterScriptTag;
          this.accountFooterScriptTagEnabled = theme.accountFooterScriptTagEnabled;
          this.journeyFooterScriptTag = theme.journeyFooterScriptTag;
          this.journeyFooterScriptTagEnabled = theme.journeyFooterScriptTagEnabled;
          this.journeyHeader = theme.journeyHeader;
          this.journeyHeaderEnabled = theme.journeyHeaderEnabled;
          this.journeyHeaderSkipLinkEnabled = theme.journeyHeaderSkipLinkEnabled;
          this.journeyTheaterMode = theme.journeyTheaterMode;
          this.journeyJustifiedContent = theme.journeyJustifiedContent;
          this.journeyJustifiedContentEnabled = theme.journeyJustifiedContentEnabled;
          this.journeyJustifiedContentMobileViewEnabled = theme.journeyJustifiedContentMobileViewEnabled;
          this.journeyLayout = theme.journeyLayout;
          this.journeyRememberMeEnabled = theme.journeyRememberMeEnabled;
          this.journeyRememberMeLabel = theme.journeyRememberMeLabel;
          this.journeySignInButtonPosition = theme.journeySignInButtonPosition;
          this.logo = theme.logo || placeholderImage;
          this.logoAltText = theme.logoAltText;
          this.logoEnabled = theme.logoEnabled;
          this.logoHeight = theme.logoHeight;
          this.logoProfileHeight = theme.logoProfileHeight;
        } else {
          this.theme = {};
          this.logo = `${process.env.BASE_URL}images/ping-logo-square-color.svg`;
          this.logoHeight = 72;
          this.favicon = 'favicon.ico';
        }
      }).catch(() => {
        this.theme = {};
      });
    },
    addTreeTheme(themeId, treeId, realm) {
      const savingTheme = this.themesConfig.realm[realm].find((theme) => theme._id === themeId);
      if (savingTheme) {
        if (!savingTheme.linkedTrees) {
          savingTheme.linkedTrees = [];
        }
        // only continue if theme does not have treeId already
        if (!savingTheme.linkedTrees.includes(treeId)) {
          // remove treeId from other themes
          this.themesConfig.realm[realm].forEach((theme) => {
            if (theme.linkedTrees) {
              const index = theme.linkedTrees.indexOf(treeId);
              if (index > -1) {
                theme.linkedTrees.splice(index, 1);
              }
            }
          });

          // add treeId to this theme
          savingTheme.linkedTrees.push(treeId);
          putConfig('ui/themerealm', this.themesConfig).catch((error) => {
            this.showErrorMessage(error, this.$t('errors.themeSaveError'));
          });
        }
      }
    },
    removeTreeTheme(treeId, realm) {
      this.themesConfig.realm[realm].forEach((theme) => {
        if (theme.linkedTrees) {
          const index = theme.linkedTrees.indexOf(treeId);
          if (index > -1) {
            theme.linkedTrees.splice(index, 1);
          }
        }
      });
      putConfig('ui/themerealm', this.themesConfig).catch((error) => {
        this.showErrorMessage(error, this.$t('errors.themeSaveError'));
      });
    },
    getTreeTheme(treeId, realm) {
      return this.themesConfig.realm[realm].find((theme) => {
        if (theme.linkedTrees) {
          return theme.linkedTrees.includes(treeId);
        }
        return false;
      });
    },
    /**
     * Base64 encode any script content in the passed themes to transmit over the API
     * @param {Object} themesConfig - config metadata of themes
     * @returns {Object} the theme config with all scripts base64 encoded
     */
    encodeThemeScripts(themesConfig) {
      const encodedThemes = cloneDeep(themesConfig);
      Object.keys(encodedThemes.realm).forEach((key) => {
        if (Array.isArray(encodedThemes.realm[key])) {
          encodedThemes.realm[key].forEach((theme) => {
            if (typeof theme.journeyFooterScriptTag === 'string' && theme.journeyFooterScriptTag !== '') {
              theme.journeyFooterScriptTag = convertStringToBase64(theme.journeyFooterScriptTag);
            }

            if (typeof theme.accountFooterScriptTag === 'string' && theme.accountFooterScriptTag !== '') {
              theme.accountFooterScriptTag = convertStringToBase64(theme.accountFooterScriptTag);
            }
          });
        }
      });
      return encodedThemes;
    },
    /**
     * Base64 decode any script content in the passed themes
     * @param {Object} themesConfig - config metadata of themes
     * @returns {Object} the theme config with all scripts decoded from base64
     */
    decodeThemeScripts(themesConfig) {
      const decodedThemes = cloneDeep(themesConfig);
      Object.keys(decodedThemes.realm).forEach((key) => {
        if (Array.isArray(decodedThemes.realm[key])) {
          decodedThemes.realm[key].forEach((theme) => {
            if (typeof theme.journeyFooterScriptTag === 'string' && theme.journeyFooterScriptTag !== '') {
              theme.journeyFooterScriptTag = convertBase64ToString(theme.journeyFooterScriptTag);
            }

            if (typeof theme.accountFooterScriptTag === 'string' && theme.accountFooterScriptTag !== '') {
              theme.accountFooterScriptTag = convertBase64ToString(theme.accountFooterScriptTag);
            }
          });
        }
      });
      return decodedThemes;
    },
    /**
     * Save a theme if it doesn't exist or update an existing theme
     * @param {Object} themesConfig - config metadata of themes
     * @param {Boolean} suppressSuccessMessage - suppress the success messeage
     */
    saveTheme(themesConfig, suppressSuccessMessage) {
      themesConfig.realm[this.realm] = sortBy(themesConfig.realm[this.realm], 'name');
      const encodedThemes = this.encodeThemeScripts(themesConfig);
      return putConfig('ui/themerealm', encodedThemes).then(({ data }) => {
        const decodedThemes = this.decodeThemeScripts(data);
        this.setThemeData(decodedThemes, this.realm);
        if (!suppressSuccessMessage) {
          this.displayNotification('success', this.$t('hostedPages.theme.successSave'));
        }
      }).catch((error) => {
        this.showErrorMessage(error, this.$t('hostedPages.errorSavingTheme'));
      });
    },
    setThemeData(themesConfig, realm) {
      const realmThemes = themesConfig.realm[realm];

      if (!realmThemes) { // Empty theme config
        const starterTheme = {
          ...this.defaultThemeParams, _id: uuid(), isDefault: true, name: 'Starter Theme',
        };
        themesConfig.realm[realm] = [starterTheme];
      } else if (Object.keys(realmThemes).includes('backgroundColor')) { // Old theme config
        const starterTheme = {
          ...realmThemes, _id: uuid(), isDefault: true, name: 'Starter Theme',
        };
        themesConfig.realm[realm] = [starterTheme];
      }
      themesConfig.realm[realm].forEach((theme) => {
        if (!theme._id) {
          theme._id = uuid();
        }
      });
      this.themesConfig = themesConfig;
      this.realmThemeNames = themesConfig.realm[realm].map((theme) => ({ text: theme.name, value: theme._id, logo: theme.logoProfileCollapsed }));
    },
  },
};
</script>
