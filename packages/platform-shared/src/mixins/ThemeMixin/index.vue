<!-- Copyright (c) 2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<script>
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';

export default {
  name: 'ThemeMixin',
  methods: {
    setTheme(realm) {
      const idmRequestService = this.getRequestService({
        'X-OpenIDM-NoSession': true,
        'X-OpenIDM-Password': 'anonymous',
        'X-OpenIDM-Username': 'anonymous',
        'cache-control': 'no-cache',
      });

      idmRequestService.get('/config/ui/themerealm').then((results) => {
        let cleanRealm = realm;

        // If there is a /, we need to remove it so that
        // both test and /test result in the same realm theme
        if (results.data.realm[cleanRealm] === undefined && cleanRealm.charAt(0) === '/') {
          cleanRealm = cleanRealm.substring(1);
        }

        // Set all realm related theming here
        if (results.data.realm[cleanRealm]) {
          this.theme = results.data.realm[cleanRealm];
          this.logo = results.data.realm[cleanRealm].logo;
          this.logoAltText = results.data.realm[cleanRealm].logoAltText;
          this.logoHeight = results.data.realm[cleanRealm].logoHeight;
          this.logoProfileHeight = results.data.realm[cleanRealm].logoProfileHeight;
          this.logoProfileCollapsedHeight = results.data.realm[cleanRealm].logoProfileCollapsedHeight;
        } else {
          this.theme = null;
          this.logo = `${process.env.BASE_URL}images/vertical-logo.svg`;
        }
      }).catch(() => {
        this.theme = null;
      });
    },
  },
  mixins: [
    RestMixin,
  ],
  data() {
    return {
      logoHeight: '40',
      logoProfileHeight: '40',
      logoProfileCollapsedHeight: '40',
      logo: '',
      logoAltText: '',
      theme: null,
    };
  },
};
</script>
