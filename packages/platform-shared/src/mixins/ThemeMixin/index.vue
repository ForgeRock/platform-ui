<!-- Copyright (c) 2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<script>
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import { putConfig } from '@forgerock/platform-shared/src/api/ConfigApi';
import uuid from 'uuid/v4';
import { sortBy } from 'lodash';

export default {
  name: 'ThemeMixin',
  mixins: [
    RestMixin,
  ],
  data() {
    return {
      defaultThemeParams: {
        accountFooter: `<div class="d-flex justify-content-center py-4 w-100"><span class="pr-1">© ${new Date().getFullYear()}</span>
<a href="#" target="_blank" class="text-body">My Company, Inc</a><a href="#" target="_blank" style="color: #0000ee" class="pl-3 text-body">Privacy Policy</a><a href="#" target="_blank" style="color: #0000ee" class="pl-3 text-body">Terms & Conditions</a></div>`,
        accountFooterEnabled: false,
        backgroundColor: '#324054',
        backgroundImage: '',
        buttonRounded: 5,
        favicon: 'https://cdn.forgerock.com/platform/themes/starter/logo-starter.svg',
        fontFamily: 'Open Sans',
        journeyFooter: `<div class="d-flex justify-content-center py-4 w-100"><span class="pr-1">© ${new Date().getFullYear()}</span>
<a href="#" target="_blank" class="text-body">My Company, Inc</a><a href="#" target="_blank" style="color: #0000ee" class="pl-3 text-body">Privacy Policy</a><a href="#" target="_blank" style="color: #0000ee" class="pl-3 text-body">Terms & Conditions</a></div>`,
        journeyFooterEnabled: false,
        journeyHeader: '<div class="d-flex justify-content-center py-4 flex-grow-1">Header Content</div>',
        journeyHeaderEnabled: false,
        journeyTheaterMode: false,
        journeyJustifiedContent: '',
        journeyJustifiedContentEnabled: false,
        journeyLayout: 'card',
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
        textColor: '#ffffff',
      },
      favicon: '',
      journeyFooter: '',
      journeyFooterEnabled: false,
      journeyHeader: '',
      journeyHeaderEnabled: false,
      journeyTheaterMode: false,
      journeyJustifiedContent: '',
      journeyJustifiedContentEnabled: false,
      journeyLayout: 'card',
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
  methods: {
    /**
     * Sets up the current theme based on whether we are using tree, org, existing tree etc.
     * @param {String} realm - The current realm
     * @param {Object} themeOptions - the tree/themeId/org/etc data we are using to find the correct theme
     */
    setTheme(realm, themeOptions) {
      const idmRequestService = this.getRequestService({
        'X-OpenIDM-NoSession': true,
        'X-OpenIDM-Password': 'anonymous',
        'X-OpenIDM-Username': 'anonymous',
        'cache-control': 'no-cache',
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
          if (themeOptions.tree) {
            const treeTheme = theme.find((realmTheme) => (realmTheme.linkedTrees && realmTheme.linkedTrees.includes(themeOptions.tree)));
            if (treeTheme) {
              theme = treeTheme;
            } else if (themeOptions.themeId) {
              theme = theme.find((realmTheme) => realmTheme._id === themeOptions.themeId || realmTheme.name === themeOptions.themeId);
            } else {
              theme = theme.find((realmTheme) => realmTheme.isDefault);
            }
          } else if (themeOptions.themeId) {
            theme = theme.find((realmTheme) => realmTheme._id === themeOptions.themeId || realmTheme.name === themeOptions.themeId);
          } else {
            theme = theme.find((realmTheme) => realmTheme.isDefault);
          }
          if (!theme) {
            theme = themeResults[cleanRealm].find((realmTheme) => realmTheme.isDefault);
          }
          localStorage.setItem('theme-id', theme._id);
        }
        // Set all realm related theming here
        if (theme) {
          // eslint-disable-next-line global-require
          const placeholderImage = require('@forgerock/platform-shared/src/assets/images/placeholder.svg');
          this.theme = theme;
          this.favicon = theme.favicon;
          this.journeyFooter = theme.journeyFooter;
          this.journeyFooterEnabled = theme.journeyFooterEnabled;
          this.journeyHeader = theme.journeyHeader;
          this.journeyHeaderEnabled = theme.journeyHeaderEnabled;
          this.journeyTheaterMode = theme.journeyTheaterMode;
          this.journeyJustifiedContent = theme.journeyJustifiedContent;
          this.journeyJustifiedContentEnabled = theme.journeyJustifiedContentEnabled;
          this.journeyLayout = theme.journeyLayout;
          this.logo = theme.logo || placeholderImage;
          this.logoAltText = theme.logoAltText;
          this.logoEnabled = theme.logoEnabled;
          this.logoHeight = theme.logoHeight;
          this.logoProfileHeight = theme.logoProfileHeight;
        } else {
          this.theme = {};
          this.logo = `${process.env.BASE_URL}images/vertical-logo.svg`;
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
     * Save a theme if it doesn't exist or update an existing theme
     * @param {Object} themesConfig - config metadata of themes
     */
    saveTheme(themesConfig) {
      themesConfig.realm[this.realm] = sortBy(themesConfig.realm[this.realm], 'name');
      return putConfig('ui/themerealm', themesConfig).then(({ data }) => {
        this.setThemeData(data, this.realm);
        this.displayNotification('AdminMessage', 'success', this.$t('hostedPages.successSave'));
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
      this.realmThemeNames = themesConfig.realm[realm].map((theme) => ({ text: theme.name, value: theme._id }));
    },
  },
};
</script>
