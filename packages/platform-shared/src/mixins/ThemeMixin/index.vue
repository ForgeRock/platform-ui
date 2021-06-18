<!-- Copyright (c) 2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<script>
import { findKey } from 'lodash';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';

export default {
  name: 'ThemeMixin',
  mixins: [
    RestMixin,
  ],
  data() {
    return {
      defaultThemeParams: {
        backgroundColor: '#f6f8fa',
        backgroundImage: '',
        buttonRounded: 5,
        linkActiveColor: '#0c85cf',
        linkColor: '#109cf1',
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
      logoHeight: '40',
      logoProfileHeight: '40',
      logoProfileCollapsedHeight: '40',
      logo: '',
      logoAltText: '',
      theme: null,
    };
  },
  methods: {
    setTheme(realm) {
      const idmRequestService = this.getRequestService({
        'X-OpenIDM-NoSession': true,
        'X-OpenIDM-Password': 'anonymous',
        'X-OpenIDM-Username': 'anonymous',
        'cache-control': 'no-cache',
      });

      idmRequestService.get('/config/ui/themerealm').then((results) => {
        const themeResults = results.data.realm;
        let cleanRealm = realm;

        // If there is a /, we need to remove it so that
        // both test and /test result in the same realm theme
        if (themeResults[cleanRealm] === undefined && cleanRealm.charAt(0) === '/') {
          cleanRealm = cleanRealm.substring(1);
        }

        let theme = themeResults[cleanRealm];
        if (theme && !theme.backgroundColor) {
          const themeName = findKey(theme, (realmTheme) => realmTheme.isDefault);
          if (themeName) {
            theme = theme[themeName];
          }
        }

        // Set all realm related theming here
        if (theme) {
          this.theme = theme;
          this.logo = theme.logo;
          this.logoAltText = theme.logoAltText;
          this.logoHeight = theme.logoHeight;
          this.logoProfileHeight = theme.logoProfileHeight;
          this.logoProfileCollapsedHeight = theme.logoProfileCollapsedHeight;
        } else {
          this.theme = null;
          this.logo = `${process.env.BASE_URL}images/vertical-logo.svg`;
        }
      }).catch(() => {
        this.theme = null;
      });
    },
  },
};
</script>
