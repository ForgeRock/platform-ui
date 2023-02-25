<!-- Copyright (c) 2020-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<!--  eslint-disable vue/singleline-html-element-content-newline vue/html-indent -->
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

      <template v-if="mock">.fr-theme-preview</template> .btn {
      border-radius: {{ theme.buttonRounded }}px !important;
      }

      <template v-if="mock">.fr-theme-preview</template> .btn-primary {
      background-color: {{ theme.primaryColor }} !important;
      outline-color: {{ theme.primaryColor }} !important;
      border-color: {{ theme.primaryColor }} !important;
      color: {{ theme.textColor }};
      }

      <template v-if="mock">.fr-theme-preview</template> .btn-primary:disabled {
      background-color: {{ theme.primaryOffColor }} !important;
      }

      <template v-if="mock">.fr-theme-preview</template> .btn-primary:hover {
      background-color: {{ theme.primaryOffColor }} !important;
      }

      <template v-if="mock">.fr-theme-preview</template> a {
      font-weight: {{ theme.boldLinks ? 700 : 400 }};
      color: {{ theme.linkColor }};
      }

      <template v-if="mock">.fr-theme-preview</template> a:hover {
      color: {{ theme.linkActiveColor }};
      }

      <template v-if="mock">.fr-theme-preview</template> .btn-link,
      <template v-if="mock">.fr-theme-preview</template> .nav-link {
      color: {{ theme.linkColor }};
      }

      <template v-if="mock">.fr-theme-preview</template> .btn-link:hover,
      .nav-link:hover {
      color: {{ theme.linkActiveColor }};
      }

      <template v-if="mock">.fr-theme-preview</template> body {
      color: {{ theme.bodyText }};
      }

      .text-body {
      color: {{ theme.bodyText }} !important;
      }

      <template v-if="mock">.fr-theme-preview</template> .text-muted {
      color: {{ theme.secondaryColor }} !important;
      }

      <template v-if="mock">.fr-theme-preview</template> .text-danger {
      color: {{ theme.dangerColor }} !important;
      }

      <template v-if="mock">.fr-theme-preview</template> .text-success {
      color: {{ theme.successColor }} !important;
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

      textarea:focus,
      <template v-if="mock">.fr-theme-preview</template> input:focus,
      <template v-if="mock">.fr-theme-preview</template> input[type]:focus,
      .uneditable-input:focus,
      <template v-if="mock">.fr-theme-preview</template> .form-control:focus-within .multiselect__tags {
      border-color: {{ theme.primaryColor }} !important;
      -webkit-box-shadow: 0 0 0 0.0625rem {{ theme.primaryColor }};
      box-shadow: 0 0 0 0.0625rem {{ theme.primaryColor }};
      outline: 0 none;
      }

      .fr-toggle-primary.custom-switch.b-custom-control-lg .custom-control-label::before {
      background-color: {{ theme.switchBackgroundColor }};
      }

      .fr-toggle-primary.custom-switch.b-custom-control-lg .custom-control-input:checked ~ .custom-control-label::before {
      background-color: {{ theme.primaryColor }};
      }

      .spinner-primary {
      color: {{ theme.primaryColor }};
      }
    </Component>

    <Component
      :is="'style'"
      v-if="!isEnduser">
      <!-- login card themes -->
      .card {
      border-radius: {{ theme.journeyCardBorderRadius || 4 }}px !important;
      }

      .card .login-header {
      border-radius: {{ theme.journeyCardBorderRadius || 4 }}px {{ theme.journeyCardBorderRadius || 4 }}px 0 0 !important;
      }

      <template v-if="mock">.fr-theme-preview.login</template> .card,
      .journey-card {
      background-color: {{ theme.journeyCardBackgroundColor || '#ffffff' }} !important;
      color: {{ theme.journeyCardTextColor || '#5e6d82' }};
      box-shadow: rgb(0 0 0 / 13%) 0px 1px {{ theme.journeyCardShadow !== undefined ? theme.journeyCardShadow : 3 }}px;
      }

      .login-header {
      background-color: {{ theme.journeyCardHeaderBackgroundColor || '#ffffff' }} !important;
      }

      <!-- login card title -->
      .card .h2,
      .journey-card .h2 {
      color: {{ theme.journeyCardTitleColor || '#23282e' }};
      }

      <!-- login input and select fields -->
      <template v-if="mock">.fr-theme-preview.login</template> input,
      <template v-if="mock">.fr-theme-preview.login</template> .multiselect .multiselect__tags,
      <template v-if="mock">.fr-theme-preview.login</template> .multiselect .multiselect__select,
      <template v-if="mock">.fr-theme-preview.login</template> .multiselect .multiselect__select::before {
      background-color: {{ theme.journeyInputBackgroundColor || '#ffffff' }} !important;
      border-color: {{ theme.journeyInputBorderColor || '#c0c9d5' }} !important;
      color: {{ theme.journeyInputTextColor || '#23282e' }} !important;
      }

      <template v-if="mock">.fr-theme-preview.login</template> .multiselect .multiselect__element {
      background-color: {{ theme.journeyInputBackgroundColor || '#ffffff' }} !important;
      color: {{ theme.journeyInputTextColor || '#23282e' }} !important;
      }

      <template v-if="mock">.fr-theme-preview.login</template> .multiselect .multiselect__content-wrapper {
      border-color: {{ theme.journeyInputBorderColor || '#c0c9d5' }} !important;
      }

      <template v-if="mock">.fr-theme-preview.login</template> .multiselect .multiselect__option--highlight,
      <template v-if="mock">.fr-theme-preview.login</template> .multiselect .multiselect__option--selected {
      background-color: {{ theme.journeyInputSelectColor || '#e4f4fd' }} !important;
      }

      <!-- Styling for buttons within form label group inputs -->
      .form-label-group button span,
      .multiselect__placeholder,
      <template v-if="mock">.fr-theme-preview.login</template> .multiselect__single {
      color: {{ theme.journeyInputTextColor || '#23282e' }} !important;
      }

      <template v-if="mock">.fr-theme-preview.login</template> .form-label-group .form-label-group-input .white-label-background ~ label {
      background-color: {{ theme.journeyInputBackgroundColor || '#ffffff' }} !important;
      }

      <template v-if="mock">.fr-theme-preview.login</template> .form-label-group label {
      color: {{ theme.journeyInputLabelColor || '#5e6d82' }} !important;
      }
    </Component>

    <Component
      :is="'style'"
      v-if="isEnduser">
      /**
      Enduser Theme Styles
      */

      #app .fr-sidebar-menuitems li a:not(.router-link-active),
      #app .fr-sidebar-menuitems li button {
      outline-color: {{ theme.primaryColor }};
      color: {{ theme.accountNavigationTextColor || '#455469' }};
      }

      #app .fr-sidebar-menuitems li a:hover,
      #app .fr-sidebar-menuitems li button:hover {
      background-color: {{ theme.profileMenuHoverColor }};
      color: {{ theme.profileMenuHoverTextColor }};
      }

      #app <template v-if="mock">.fr-theme-preview.enduser</template> .router-link-active {
      background-color: {{ theme.profileMenuHighlightColor }};
      color: {{ theme.profileMenuTextHighlightColor }};
      border-left-color: {{ theme.primaryColor }};
      }

      #app <template v-if="mock">.fr-theme-preview.enduser</template> .router-link-active:hover {
      background-color: {{ theme.profileMenuHoverColor }};
      color: {{ theme.profileMenuHoverTextColor }};
      }

      #app .fr-sidebar-brand:hover {
      background-color: inherit;
      color: inherit;
      }

      .fr-logo.fr-logo-vertical {
      background-image: url("{{ logoProfileCollapsed ? logoProfileCollapsed : require('@forgerock/platform-shared/src/assets/images/placeholder.svg') }}");
      height: {{ logoProfileCollapsed && theme.logoProfileHeight ? theme.logoProfileHeight : theme.logoHeight }}px;
      }

      .fr-logo.fr-logo-horizontal {
      background-image: url("{{ logoProfile ? logoProfile : require('@forgerock/platform-shared/src/assets/images/horizontal-placeholder.svg') }}");
      height: {{ theme.logoProfileHeight ? theme.logoProfileHeight : theme.logoHeight }}px;
      }

      <template v-if="mock">.fr-theme-preview.enduser</template> .fr-sidebar-nav{
      background-color: {{ theme.accountNavigationBackgroundColor|| '#ffffff' }};
      }

      .fr-sidebar-wrapper .fr-sidebar-bottom {
      border-top-color: {{ theme.accountNavigationToggleBorderColor || '#e7eef4' }} !important;
      }

      #app <template v-if="mock">.fr-theme-preview.enduser</template> .card,
      <template v-if="mock">.fr-theme-preview.enduser</template> .modal-content,
      .modal-content .card,
      #app .dropdown-menu {
      background-color: {{ theme.accountCardBackgroundColor || '#ffffff' }};
      border: 1px solid {{ theme.accountCardOuterBorderColor || '#e7eef4' }};
      color: {{ theme.accountCardTextColor || '#5e6d82' }};
      box-shadow: rgb(0 0 0 / 13%) 0px 1px {{ theme.accountCardShadow !== undefined ? theme.accountCardShadow : 3 }}px;
      }

      #app .card .table {
      color: {{ theme.accountCardTextColor || '#5e6d82' }};
      }

      #app .card .list-group-item {
      background-color: {{ theme.accountCardBackgroundColor || '#ffffff' }};
      border: none;
      border-top: 1px solid;
      border-color: {{ theme.accountCardInnerBorderColor || '#e7eef4' }};
      }

      #app .card .list-group-flush {
      border: none;
      }

      #app .card h4,
      #app .card h5,
      #app .card .table.b-table > thead > tr {
      color: {{ theme.accountCardHeaderColor || '#23282e' }};
      }

      #app .card .card-header,
      #app <template v-if="mock">.fr-theme-preview.enduser</template> .card .card-footer,
      #app .card .border-bottom,
      #app .card .border-top,
      #app .card .table td,
      #app .card .tabs .col-auto,
      <template v-if="mock">.fr-theme-preview.enduser</template> .modal-content header,
      <template v-if="mock">.fr-theme-preview.enduser</template> .modal-content footer {
      border-color: {{ theme.accountCardInnerBorderColor || '#e7eef4' }} !important;
      }

      #app .card .toolbar-divider {
      background-color: {{ theme.accountCardInnerBorderColor || '#e7eef4' }} !important;
      }

      #app .card input,
      #app .card .form-label-group .form-label-group-input input,
      #app .card .form-label-group .form-label-group-input .form-control,
      <template v-if="mock">.fr-theme-preview.enduser</template> .form-label-group .form-label-group-input .multiselect .multiselect__tags,
      <template v-if="mock">.fr-theme-preview.enduser</template> .form-label-group .form-label-group-input .multiselect .multiselect__element,
      <template v-if="mock">.fr-theme-preview.enduser</template> .modal-content input,
      <template v-if="mock">.fr-theme-preview.enduser</template> .modal-content .form-control,
      .modal-content .form-control .dropdown-menu ,
      .modal-content .b-dropdown .dropdown-menu {
      background-color: {{ theme.accountCardInputBackgroundColor || '#ffffff' }} !important;
      border-color: {{ theme.accountCardInputBorderColor || '#c0c9d5' }};
      color: {{ theme.accountCardInputTextColor || '#23282e' }};
      }
      <template v-if="mock">.fr-theme-preview.enduser</template> .form-label-group .form-label-group-input .multiselect .multiselect__option--highlight,
      <template v-if="mock">.fr-theme-preview.enduser</template> .form-label-group .form-label-group-input .multiselect .multiselect__option--selected {
      background-color: {{ theme.accountCardInputSelectColor || '#e4f4fd' }} !important;
      }

      .modal-content .input-group-text {
      border-color: {{ theme.accountCardInputBorderColor || '#c0c9d5' }};
      background-color: {{ theme.accountCardInputBackgroundColor || '#ffffff' }} !important;
      }

      #app .card .fr-tag-input {
      box-shadow: none;
      }

      #app .card .input-group-text,
      <template v-if="mock">.fr-theme-preview.enduser</template> .form-label-group .form-label-group-input .multiselect .multiselect__select,
      <template v-if="mock">.fr-theme-preview.enduser</template> .form-label-group .form-label-group-input .form-control {
      background-color: {{ theme.accountCardInputBackgroundColor || '#ffffff' }} !important;
      color: {{ theme.accountCardInputTextColor || '#23282e' }};
      }

      #app <template v-if="mock">.fr-theme-preview.enduser</template> .multiselect .multiselect__select::before,
      #app <template v-if="mock">.fr-theme-preview.enduser</template> .multiselect .multiselect__single,
      #app <template v-if="mock">.fr-theme-preview.enduser</template> input::placeholder,
      .modal-content .multiselect .multiselect__input,
      .modal-content .multiselect .multiselect__input::placeholder,
      .modal-content label.form-control {
      color: {{ theme.accountCardInputTextColor || '#23282e' }};
      }

      .modal-content .white-label-background ~ label,
      #app .card .white-label-background ~ label {
      background-color: {{ theme.accountCardInputBackgroundColor || '#ffffff' }} !important;
      }

      #app <template v-if="mock">.fr-theme-preview.enduser</template> .card label,
      <template v-if="mock">.fr-theme-preview.enduser</template> .modal-content .fr-field label,
      .modal-content .form-control label .sr-only,
      <template v-if="mock">.fr-theme-preview.enduser</template> .modal-content .form-label-group .form-label-group-input label,
      #app .card .input-group-text .text-muted,
      #app .card .fr-icon-input-holder .fr-icon,
      .form-label-group .material-icons-outlined,
      .form-control .material-icons-outlined {
      color: {{ theme.accountCardInputLabelColor || '#5e6d82' }};
      }

      #app .card .nav-pills .nav-link.active {
      background-color: {{ theme.accountCardTabActiveColor || '#e4f4fd' }};
      border-left-color: {{ theme.accountCardTabActiveBorderColor || '#109cf1' }};
      }

      #app .card .table-hover tbody tr:hover,
      #app .card .table tr.b-table-row-selected.table-transparent,
      #app .dropdown-item:hover,
      #app .nav-pills .nav-link:hover {
      background-color: {{ theme.accountTableRowHoverColor || '#f6f8fa' }} !important;
      }

      #app .fr-main-navbar<template v-if="mock">-mock</template> {
      background-color: {{ theme.topBarBackgroundColor || '#ffffff' }};
      border-bottom-color: {{ theme.topBarBorderColor || '#e7eef4' }};
      }

      #app .fr-main-navbar<template v-if="mock">-mock</template> .material-icons-outlined,
      #app .fr-main-navbar<template v-if="mock">-mock</template> .fr-back-link h4,
      #app .fr-main-navbar<template v-if="mock">-mock</template> .fr-dropdown-button-content div,
      #app .fr-main-navbar<template v-if="mock">-mock</template> .dropdown-toggle::after {
      color: {{ theme.topBarTextColor || '#324054' }} !important;
      }

      #app .fr-main-navbar<template v-if="mock">-mock</template> .fr-dropdown-button-content h5 {
      color: {{ theme.topBarHeaderColor || '#23282e' }};
      }
    </Component>
  </div>
</template>

<script>
import TranslationMixin from '@forgerock/platform-shared/src/mixins/TranslationMixin';
import i18n from '@/i18n';
/**
Theme properties examples:

accountCardBackgroundColor: "#ffffff",
accountCardHeaderColor: "#23282e",
accountCardInnerBorderColor: "#e7eef4",
accountCardInputBackgroundColor: '#ffffff',
accountCardInputBorderColor: '#c0c9d5',
accountCardInputLabelColor: '#5e6d82',
accountCardInputSelectColor: "#e4f4fd",
accountCardInputTextColor: '#23282e',
accountCardOuterBorderColor: "#e7eef4",
accountCardShadow: 3,
accountCardTabActiveColor: '#e4f4fd'
accountCardTabActiveBorderColor: '#109cf1'
accountCardTextColor: "#5e6d82",
accountNavigationBackgroundColor: "#ffffff",
accountNavigationTextColor: "#455469",
accountNavigationToggleBorderColor: "#e7eef4",
accountTableRowHoverColor: '#f6f8fa'
backgroundColor: "#312E2E"
buttonRounded: "15"
fontFamily: "Open Sans"
journeyCardBackgroundColor: "#ffffff"
journeyCardHeaderBackgroundColor: "#ffffff"
journeyCardShadow: 3
journeyCardBorderRadius: 4
journeyCardTextColor: "#5e6d82"
journeyCardTitleColor: "#23282e"
journeyInputBackgroundColor: "#ffffff"
journeyInputBorderColor: "#c0c9d5"
journeyInputLabelColor: "#5e6d82",
journeyInputSelectColor: "#e4f4fd",
journeyInputTextColor: "#23282e",
linkActiveColor: "#B20710"
linkColor: "#E50914"
logo: "URL"
logoProfile: "URL"
primaryColor: "#E50914"
// this is poorly named, it has turned into just the button text color
primaryOffColor: "#B20710"
profileBackgroundColor: "#D2CBCB"
profileMenuHighlightAccentColor: "#B20710"
profileMenuHighlightColor: "#E50914"
profileMenuHoverColor: "#109cf1",
profileMenuHoverTextColor: "#ffffff",
switchBackgroundColor: '#c0c9d5',
textColor: "#FFFFFF"
topBarBackgroundColor: "#ffffff",
topBarBorderColor: "#e7eef4",
topBarHeaderColor: "#23282e",
topBarTextColor: "#69788b",

 */
/**
 * Injects a style sheet based on provided theming variables.
 * Intended functionality is to allow for basic theming and overriding in
 * certain parts of the UI.
 */
export default {
  name: 'ThemeInjector',
  mixins: [
    TranslationMixin,
  ],
  props: {
    /**
     * Is this component being used in enduser
     */
    isEnduser: {
      type: Boolean,
      default: false,
    },
    /**
     * Is this component being used in the Hosted Pages theme editor section
     */
    mock: {
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
    logoProfile() {
      return this.getLocalizedString(this.theme.logoProfile, i18n.locale, i18n.fallbackLocale);
    },
    logoProfileCollapsed() {
      return this.getLocalizedString(this.theme.logoProfileCollapsed, i18n.locale, i18n.fallbackLocale);
    },
  },
};
</script>
