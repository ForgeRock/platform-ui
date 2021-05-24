<!-- Copyright (c) 2020-2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <Component :is="'style'">
      /**
      Shared styles
      */
      body {
      background-color: {{ backgroundColor }};
      }

      body.fr-body-image {
      background-image: url('{{ theme.backgroundImage }}');
      background-size: cover;
      background-repeat: no-repeat;
      }

      .btn {
      border-radius: {{ theme.buttonRounded }}px !important;
      }

      .btn-primary {
      background-color: {{ theme.primaryColor }} !important;
      outline-color: {{ theme.primaryColor }} !important;
      border-color: {{ theme.primaryColor }} !important;
      color: {{ theme.textColor }};
      }

      .btn-primary:disabled {
      background-color: {{ theme.primaryOffColor }} !important;
      }

      .btn-primary:hover {
      background-color: {{ theme.primaryOffColor }} !important;
      }

      a {
      color: {{ theme.linkColor }};
      }

      a:hover {
      color: {{ theme.linkActiveColor }};
      }

      .btn-link {
      color: {{ theme.linkColor }};
      }

      .btn-link:hover {
      color: {{ theme.linkActiveColor }};
      }

      .btn-primary:focus {
      -webkit-box-shadow: 0 0 0 0.0625rem {{ theme.primaryColor }};
      box-shadow: 0 0 0 0.0625rem {{ theme.primaryColor }};
      }

      .fr-custom-logo {
      max-width: 80px;
      align-self: center;
      }

      textarea:focus, input:focus, input[type]:focus, .uneditable-input:focus {
      border-color: {{ theme.primaryColor }};
      -webkit-box-shadow: 0 0 0 0.0625rem {{ theme.primaryColor }};
      box-shadow: 0 0 0 0.0625rem {{ theme.primaryColor }};
      outline: 0 none;
      }

      /**
      Enduser Theme Styles
      */

      #app .custom-switch .custom-control-input:checked ~ .custom-control-label::before {
      background-color: {{ theme.primaryColor }};
      }

      #app .router-link-active {
      background-color: {{ theme.profileMenuHighlightColor }};
      color: {{ theme.profileMenuTextHighlightColor }};
      border-left-color: {{ theme.primaryColor }};
      }

      #app .router-link-active:hover {
      background-color: {{ theme.profileMenuHighlightColor }};
      color: {{ theme.profileMenuTextHighlightColor }};
      }

      #app .fr-sidebar-menuitems li a {
      outline-color: {{ theme.primaryColor }};
      color: inherit;
      }

      #app .fr-sidebar-menuitems li a:hover {
      background-color: {{ theme.primaryColor }};
      color: {{ theme.profileMenuTextHighlightColor }};
      }

      #app .fr-sidebar-brand:hover {
      background-color: inherit;
      color: inherit;
      }
    </Component>

    <Component
      :is="'style'"
      v-if="isEnduser">
      .fr-logo.fr-logo-vertical {
      background-image: url('{{ theme.logoProfileCollapsed ? theme.logoProfileCollapsed : theme.logo ? theme.logo : require('@forgerock/platform-shared/src/assets/images/themes/default/vertical-logo.svg') }}');
      height: {{ theme.logoProfileCollapsed ? theme.logoProfileCollapsedHeight : theme.logoHeight }}px;
      }

      .fr-logo.fr-logo-horizontal {
      background-image: url('{{ theme.logoProfile ? theme.logoProfile : theme.logo ? theme.logo : require('@forgerock/platform-shared/src/assets/images/themes/default/horizontal-logo.svg') }}');
      height: {{ theme.logoProfileHeight }}px;
      }
    </Component>
  </div>
</template>

<script>
/**
Theme properties examples:

backgroundColor: "#312E2E"
buttonRounded: "15"
linkActiveColor: "#B20710"
linkColor: "#E50914"
logo: "URL"
logoProfile: "URL"
primaryColor: "#E50914"
// this is poorly named, it has turned into just the button text color
textColor: "#FFFFFF"
primaryOffColor: "#B20710"
profileBackgroundColor: "#D2CBCB"
profileMenuHighlightAccentColor: "#B20710"
profileMenuHighlightColor: "#E50914"

 */
/**
 * Injects a style sheet based on provided theming variables.
 * Intended functionality is to allow for basic theming and overriding in
 * certain parts of the UI.
 */
export default {
  name: 'ThemeInjector',
  props: {
    isEnduser: {
      type: Boolean,
      default: false,
    },
    theme: {
      type: Object,
      default: () => ({ realm: {} }),
    },
  },
  computed: {
    backgroundColor() {
      let tempBackground = 'inherit';

      if (this.isEnduser && this.theme.profileBackgroundColor) {
        tempBackground = this.theme.profileBackgroundColor;
      } else if (this.theme.backgroundColor) {
        tempBackground = this.theme.backgroundColor;
      }

      return tempBackground;
    },
  },
};
</script>
