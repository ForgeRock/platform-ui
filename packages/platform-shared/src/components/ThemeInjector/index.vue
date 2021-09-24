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

      #app {
      font-family: {{ theme.fontFamily }}, sans-serif;
      }

      .fr-body-image {
      background-image: url('{{ theme.backgroundImage }}');
      background-size: cover;
      background-repeat: no-repeat;
      background-attachment: fixed;
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

      .btn-link,
      .nav-link {
      color: {{ theme.linkColor }};
      }

      .btn-link:hover,
      .nav-link:hover {
      color: {{ theme.linkActiveColor }};
      }

      body {
      color: {{ theme.bodyText }};
      }

      .text-body {
      color: {{ theme.bodyText }} !important;
      }

      .text-muted {
      color: {{ theme.secondaryColor }} !important;
      }

      .text-danger {
      color: {{ theme.dangerColor }} !important;
      }

      h1 {
      color: {{ theme.pageTitle }};
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

      #app .fr-sidebar-menuitems li a,
      #app .fr-sidebar-menuitems li button {
      outline-color: {{ theme.primaryColor }};
      }

      #app .fr-sidebar-menuitems li a:hover,
      #app .fr-sidebar-menuitems li button:hover {
      background-color: {{ theme.profileMenuHoverColor }};
      color: {{ theme.profileMenuHoverTextColor }};
      }

      #app .router-link-active {
      background-color: {{ theme.profileMenuHighlightColor }};
      color: {{ theme.profileMenuTextHighlightColor }};
      border-left-color: {{ theme.primaryColor }};
      }

      #app .router-link-active:hover {
      background-color: {{ theme.profileMenuHoverColor }};
      color: {{ theme.profileMenuHoverTextColor }};
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
      background-image: url("{{ theme.logoProfileCollapsed ? theme.logoProfileCollapsed : require('@forgerock/platform-shared/src/assets/images/placeholder.svg') }}");
      height: {{ theme.logoProfileCollapsed ? theme.logoProfileHeight : theme.logoHeight }}px;
      }

      .fr-logo.fr-logo-horizontal {
      background-image: url("{{ theme.logoProfile ? theme.logoProfile : require('@forgerock/platform-shared/src/assets/images/horizontal-placeholder.svg') }}");
      height: {{ theme.logoProfileHeight ? theme.logoProfileHeight : theme.logoHeight }}px;
      }
    </Component>
  </div>
</template>

<script>
/**
Theme properties examples:

backgroundColor: "#312E2E"
buttonRounded: "15"
fontFamily: "Open Sans"
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
profileMenuHoverColor: '#109cf1',
profileMenuHoverTextColor: '#ffffff',

 */
/**
 * Injects a style sheet based on provided theming variables.
 * Intended functionality is to allow for basic theming and overriding in
 * certain parts of the UI.
 */
export default {
  name: 'ThemeInjector',
  props: {
    /**
     * Is this component being used in enduser
     */
    isEnduser: {
      type: Boolean,
      default: false,
    },
    /**
     * Theme data
     */
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
