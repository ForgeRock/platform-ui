<!-- Copyright (c) 2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<script>
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import { putConfig } from '@forgerock/platform-shared/src/api/ConfigApi';
import uuid from 'uuid/v4';

export default {
  name: 'ThemeMixin',
  mixins: [
    RestMixin,
  ],
  data() {
    return {
      defaultThemeParams: {
        accountFooter: `<span class="pr-1">© ${new Date().getFullYear()}</span>
<a href="#" target="_blank" class="text-body">My Company, Inc</a><a href="#" target="_blank" style="color: #0000ee" class="pl-3 text-body">Privacy Policy</a><a href="#" target="_blank" style="color: #0000ee" class="pl-3 text-body">Terms & Conditions</a>`,
        backgroundColor: '#f6f8fa',
        backgroundImage: '',
        buttonRounded: 5,
        favicon: '',
        journeyFooter: `<span class="pr-1">© ${new Date().getFullYear()}</span>
<a href="#" target="_blank" class="text-body">My Company, Inc</a><a href="#" target="_blank" style="color: #0000ee" class="pl-3 text-body">Privacy Policy</a><a href="#" target="_blank" style="color: #0000ee" class="pl-3 text-body">Terms & Conditions</a>`,
        journeyHeader: '',
        journeyLayout: 'card',
        linkActiveColor: '#0c85cf',
        linkColor: '#109cf1',
        linkedTrees: [],
        logo: '',
        logoAltText: '',
        logoHeight: '40',
        logoProfile: '',
        logoProfileAltText: '',
        logoProfileCollapsed: '',
        logoProfileCollapsedAltText: '',
        logoProfileCollapsedHeight: '40',
        logoProfileHeight: '40',
        primaryColor: '#109cf1',
        primaryOffColor: '#0c85cf',
        profileBackgroundColor: '#f6f8fa',
        profileMenuHighlightColor: '#e4f4fd',
        profileMenuTextHighlightColor: '#455469',
        textColor: '#ffffff',
      },
      favicon: '',
      journeyFooter: '',
      journeyHeader: '',
      journeyLayout: 'card',
      logoHeight: '40',
      logoProfileHeight: '40',
      logoProfileCollapsedHeight: '40',
      logo: '',
      logoAltText: '',
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
        let cleanRealm = realm;

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
          this.journeyHeader = theme.journeyHeader;
          this.journeyLayout = theme.journeyLayout;
          this.logo = theme.logo || placeholderImage;
          this.logoAltText = theme.logoAltText;
          this.logoHeight = theme.logoHeight;
          this.logoProfileHeight = theme.logoProfileHeight;
          this.logoProfileCollapsedHeight = theme.logoProfileCollapsedHeight;
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
