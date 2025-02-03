<!-- Copyright (c) 2020-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<!--  eslint-disable vue/singleline-html-element-content-newline vue/html-indent -->
<template>
  <div id="theme-injector">
    <Component :is="'style'">
      <!--
        GLOBAL STYLES
      -->
      <template v-if="fontUrl">
        @import url('{{ fontUrl }}');
      </template>

      body {
        background-color: {{ backgroundColor }};
      }

      #app <template v-if="mock">.fr-theme-preview</template> {
        font-family: {{ fontFamily }}, sans-serif;
      }

      .fr-body-image {
        background-image: url('{{ theme.backgroundImage }}');
        background-size: cover;
        background-repeat: no-repeat;
        background-attachment: fixed;
      }

      <template v-if="mock">.fr-theme-preview</template> .btn:not(.within-input-button .btn, .fr-menu-item-group .btn) {
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

      <!-- Styles floating action bar's text elements in dark bg  -->
      #app .floating-action-bar.bg-dark {
        color: {{ theme.lightColor || '#f6f8fa' }};
        background-color: {{ theme.darkColor || '#23282e' }} !important;
      }

      #app .floating-action-bar.bg-dark .btn-link {
        color: {{ theme.linkColorOnDark || '#f6f8fa' }};
      }

      #app .floating-action-bar.bg-dark .btn-link:hover {
        color: {{ theme.linkActiveColorOnDark || '#f6f8fa' }};
      }

      #app .floating-action-bar.bg-dark .btn-dark,
      #app .floating-action-bar.bg-dark .btn-dark:hover {
        color: {{ theme.lightColor || '#f6f8fa' }};
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

      <!--
        GLOBAL INPUT FOCUS STYLES
         * textarea
         * input
         * .form-control
         * .form-control .multiselect
         * .form-cohtrol .multiselect__tags
         * .uneditable-input
      -->
      textarea:focus,
      <template v-if="mock">.fr-theme-preview</template> input:focus:not(.multiselect__input),
      <template v-if="mock">.fr-theme-preview</template> input[type]:focus:not(.multiselect__input),
      .uneditable-input:focus,
      <template v-if="mock">.fr-theme-preview</template> .form-control:focus-within .multiselect,
      <template v-if="mock">.fr-theme-preview</template> .form-control:focus .multiselect,
      <template v-if="mock">.fr-theme-preview</template> .form-control:focus-within .multiselect__tags,
      <template v-if="mock">.fr-theme-preview</template> .form-control .multiselect:focus .multiselect__tags {
        border-color: {{ theme.primaryColor }} !important;
        -webkit-box-shadow: 0 0 0 0.0625rem {{ theme.primaryColor }} !important;
        box-shadow: 0 0 0 0.0625rem {{ theme.primaryColor }} !important;
        outline: 0 none;
      }

      <!--
        BUTTON FOCUS STYLES
         * .btn:focus-visible
         * a:focus-visible
      -->
      <template v-if="mock">.fr-theme-preview</template> .btn:focus-visible,
      <template v-if="mock">.fr-theme-preview</template> a:focus-visible {
        outline: 2px solid {{ buttonFocusBorderColor }} !important;
      }

      .fr-toggle-primary.custom-switch.b-custom-control-lg .custom-control-label::before {
        background-color: {{ theme.switchBackgroundColor }};
      }

      .fr-toggle-primary.custom-switch.b-custom-control-lg .custom-control-input:checked ~ .custom-control-label::before,
      <template v-if="mock">.fr-theme-preview</template> .custom-control.custom-radio .custom-control-input:checked ~ .custom-control-label::before,
      <template v-if="mock">.fr-theme-preview</template> .custom-control.custom-checkbox .custom-control-input:checked ~ .custom-control-label::before {
        background-color: {{ theme.primaryColor }};
      }

      <template v-if="mock">.fr-theme-preview</template> .custom-control.custom-radio .custom-control-input:checked ~ .custom-control-label::before,
      <template v-if="mock">.fr-theme-preview</template> .custom-control.custom-checkbox .custom-control-input ~ .custom-control-label::before {
        border-color: {{ theme.primaryColor }}
      }

      .spinner-primary {
        color: {{ theme.primaryColor }};
      }
    </Component>

    <Component
      :is="'style'"
      v-if="!isEnduser">
      <!--
        JOURNEY PAGES STYLES
      -->
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

      <!--
        INPUT FOCUS STYLES
         * .form-label-group .form-control
         * .form-label-group .button
         * .form-label-group .input-buttons .within-input-button .btn
      -->
      <template v-if="mock">.fr-theme-preview.login</template> .form-label-group:not(.fr-field-error) .form-control:focus,
      <template v-if="mock">.fr-theme-preview.login</template> .form-label-group:not(.fr-field-error) .button:focus-visible, <!-- Show Password Button -->
      <template v-if="mock">.fr-theme-preview.login</template> .form-label-group:focus-within .input-buttons:not(:focus-within) .within-input-button .btn { <!-- Show Password Button -->
        border-color: {{ journeyInputFocusBorderColor }} !important;
        -webkit-box-shadow: 0 0 0 0.0625rem {{ journeyInputFocusBorderColor }} !important;
        box-shadow: 0 0 0 0.0625rem {{ journeyInputFocusBorderColor }} !important;
      }

      <template v-if="mock">.fr-theme-preview</template> .form-control:focus-within .multiselect__tags {
        border-color: {{ journeyInputFocusBorderColor }} !important;
      }

      <template v-if="mock">.fr-theme-preview.login</template> .form-label-group:not(.fr-field-error) .form-label-group-input .multiselect--active {
        -webkit-box-shadow: 0 0 0 0.0625rem {{ journeyInputFocusBorderColor }} !important;
        box-shadow: 0 0 0 0.0625rem {{ journeyInputFocusBorderColor }} !important;
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
      <template v-if="mock">.fr-theme-preview.login</template> .form-label-group .within-input-button .btn,
      <template v-if="mock">.fr-theme-preview.login</template> .multiselect .multiselect__tags,
      <template v-if="mock">.fr-theme-preview.login</template> .multiselect .multiselect__select,
      <template v-if="mock">.fr-theme-preview.login</template> .multiselect .multiselect__select::before {
        background-color: {{ theme.journeyInputBackgroundColor || '#ffffff' }} !important;
        border-color: {{ theme.journeyInputBorderColor || '#c0c9d5' }} !important;
        color: {{ theme.journeyInputTextColor || '#23282e' }} !important;
      }

      <template v-if="newMultiselectEnabled">
      <template v-if="mock">.fr-theme-preview</template> .form-control:focus-within .multiselect,
      <template v-if="mock">.fr-theme-preview</template> .form-control:focus .multiselect,
      <template v-if="mock">.fr-theme-preview</template> .form-control:focus-within .multiselect__tags,
      <template v-if="mock">.fr-theme-preview</template> .form-control multiselect:focus .multiselect__tags {
        -webkit-box-shadow: 0 0 0 0.0625rem {{ journeyInputBorderColor }} !important;
        box-shadow: 0 0 0 0.0625rem {{ journeyInputFocusBorderColor }} !important;
        outline: 0 none;
      }
      </template>

      <template v-if="mock">.fr-theme-preview.login</template> .multiselect .multiselect__element {
        background-color: {{ theme.journeyInputBackgroundColor || '#ffffff' }} !important;
        color: {{ theme.journeyInputTextColor || '#23282e' }} !important;
      }

      <template v-if="mock">.fr-theme-preview.login</template> .multiselect .multiselect__content-wrapper {
        border-color: {{ theme.journeyInputBorderColor || '#c0c9d5' }} !important;
      }

      <template v-if="mock">.fr-theme-preview.login</template> .multiselect .multiselect__option--highlight {
        background-color: {{ theme.journeyInputSelectHoverColor || '#f6f8fa' }} !important;
      }

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

      #app .recovery-code {
        color: {{ theme.journeyCardTextColor || '#455469' }} !important;
      }
    </Component>

    <Component
      :is="'style'"
      v-if="isEnduser">
      <!--
        ACCOUNT PAGES (ENDUSER) STYLES
      -->

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

      .ping-logo.ping-logo-square {
        background-image: url("{{ logoProfileCollapsed ? logoProfileCollapsed : require('@forgerock/platform-shared/src/assets/images/placeholder.svg') }}");
        height: {{ logoProfileCollapsed && theme.logoProfileHeight ? theme.logoProfileHeight : theme.logoHeight }}px;
      }

      .ping-logo.ping-logo-horizontal {
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
      #app .card .card-header {
        outline-color: {{ '#109cf1' }} ;
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
      <template v-if="mock">.fr-theme-preview.enduser</template> .form-label-group .form-label-group-input .multiselect .multiselect__element,
      <template v-if="mock">.fr-theme-preview.enduser</template> .modal-content input,
      <template v-if="mock">.fr-theme-preview.enduser</template> .modal-content .form-control,
      .modal-content .form-control .dropdown-menu ,
      .modal-content .b-dropdown .dropdown-menu {
        background-color: {{ theme.accountCardInputBackgroundColor || '#ffffff' }} !important;
        border-color: {{ theme.accountCardInputBorderColor || '#c0c9d5' }};
        color: {{ theme.accountCardInputTextColor || '#23282e' }};
      }

      <template v-if="mock">.fr-theme-preview.enduser</template> .form-label-group .form-label-group-input .multiselect .multiselect__option--highlight {
        background-color: {{ theme.accountCardInputSelectHoverColor || '#f6f8fa' }} !important;
      }

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
      #app .nav-pills .nav-link:hover {
        background-color: {{ theme.accountTableRowHoverColor || '#f6f8fa' }} !important;
      }

      #app .dropdown-item:hover,
      #app .dropdown-item:focus {
        background-color: {{ theme.profileMenuHoverColor || '#e4f4fd' }};
        color: {{ theme.profileMenuHoverTextColor || '#181b20' }};
      }

      #app .dropdown-item:hover .h5,
      #app .dropdown-item:focus .h5 {
        color: {{ theme.profileMenuHoverTextColor || '#181b20' }};
      }

      #app .dropdown-item:hover .text-muted,
      #app .dropdown-item:focus .text-muted {
        color: {{ theme.profileMenuHoverTextColor || '#455469' }} !important;
      }

      #app .dropdown-item:hover .material-icons-outlined,
      #app .dropdown-item:focus .material-icons-outlined {
        color: {{ theme.profileMenuHoverTextColor || 'inherit' }} !important;
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

      <template v-if="mock">.fr-theme-preview.enduser</template> .card-input-element:checked + .card-input,
      <template v-if="mock">.fr-theme-preview.enduser</template> .card-input-element + .card-input:hover {
        border-color: {{ theme.primaryColor }} !important;
      }

      <template v-if="mock">.fr-theme-preview.enduser</template> .card-input-element:checked + .card-input::before {
        background-color: {{ theme.primaryColor }} !important;
      }

      #app <template v-if="mock">.fr-theme-preview.enduser</template> .nav-tabs .nav-item .nav-link.active {
        border-bottom-color: {{ theme.primaryColor }};
        color: {{ theme.primaryColor }};
      }

      #app .btn-outline-primary {
        color: {{ theme.primaryColor }} !important;
        border-color: {{ theme.primaryColor }} !important;
      }

      #app .btn-outline-primary:hover {
        color: {{ '#ffffff' }} !important;
        background-color: {{ theme.primaryColor }};
        border-color: {{ theme.primaryColor }};
      }

      <!-- Styles btn with danger variant and its focus/ hover state using theme vars  -->
      #app .btn-danger {
        color: {{ theme.textColor || '#ffffff' }};
        background-color: {{ theme.dangerColor }};
        border-color: {{ theme.dangerColor }};
      }

      #app .btn-danger:focus, #app .btn-danger:hover {
        background-color: {{ `color-mix(in srgb, ${theme.dangerColor} 80%, black)` }};
        border-color: {{ `color-mix(in srgb, ${theme.dangerColor} 80%, black)` }};
      }

      <!-- Styles btn with outline-danger variant and its hover state using theme vars  -->
      #app .btn-outline-danger {
        color: {{ theme.dangerColor }};
        border-color: {{ theme.dangerColor }};
      }

      #app .btn-outline-danger:hover {
        color: {{ theme.textColor || '#ffffff' }};
        background-color: {{ theme.dangerColor }};
        border-color: {{ theme.dangerColor }} !important;
      }

      <!--
        calendar's current day styles,
        .b-calendar is also part of user details Modal which is teleported to the body
        and is not under #app
      -->
      #app .b-calendar .btn-outline-primary,
      .b-calendar .btn-outline-primary {
        color: {{ buttonFocusBorderColor }} !important;
      }

      #app .b-calendar .btn-outline-primary:focus,
      .b-calendar .btn-outline-primary:focus {
        color: {{ buttonFocusBorderColor }} !important;
        border-color: {{ buttonFocusBorderColor }} !important;
      }

      #app .b-calendar .btn-outline-primary:hover,
      .b-calendar .btn-outline-primary:hover {
        color: {{ theme.textColor || '#ffffff' }} !important;
        background-color: {{ buttonFocusBorderColor }} !important;
        border-color: {{ buttonFocusBorderColor }} !important;
      }

      #app .text-success {
        color: {{ theme.successColor }};
      }

      #app <template v-if="mock">.fr-theme-preview.enduser</template> .card-footer > span {
        color: {{ theme.linkColor }};
      }

      #app .text-success,
      #app span:has(> .text-success):not(.btn-dark > span) {
        color: {{ theme.successColor }};
      }

      #app a.nav-link.router-link-active .badge {
        color: {{ getContrastColor(theme.primaryColor) }};
        background-color: {{ theme.primaryColor }};
      }

      <!--
        INPUT FOCUS STYLES
         * textarea
         * input
         * .form-control
         * .form-control .multiselect
         * .form-cohtrol .multiselect__tags
         * .uneditable-input
      -->
      textarea:focus,
      <template v-if="mock">.fr-theme-preview</template> input:focus:not(.multiselect__input),
      <template v-if="mock">.fr-theme-preview</template> input[type]:focus:not(.multiselect__input),
      .uneditable-input:focus,
      <template v-if="mock">.fr-theme-preview</template> .form-control:focus-within .multiselect,
      <template v-if="mock">.fr-theme-preview</template> .form-control:focus .multiselect,
      <template v-if="mock">.fr-theme-preview</template> .form-control:focus-within .multiselect__tags,
      <template v-if="mock">.fr-theme-preview</template> .form-control .multiselect:focus .multiselect__tags {
        border-color: {{ accountCardInputFocusBorderColor }} !important;
        -webkit-box-shadow: 0 0 0 0.0625rem {{ accountCardInputFocusBorderColor }} !important;
        box-shadow: 0 0 0 0.0625rem {{ accountCardInputFocusBorderColor }} !important;
        outline: 0 none;
      }

      <!--
        Styles badges and their variants to be themeable
      -->
      #app .badge.badge-primary {
        color: {{ getContrastColor(theme.primaryColor) }};
        background-color: {{ theme.primaryColor }};
      }

      <!-- if no variant is specified, secondary style is default style -->
      #app .badge,
      #app .badge.badge-secondary {
        color: {{ getContrastColor(theme.secondaryColor) }};
        background-color: {{ theme.secondaryColor }};
      }

      #app .badge.badge-success {
        color: {{ getContrastColor(theme.successColor) }};
        background-color: {{ theme.successColor }};
      }

      #app .badge.badge-danger {
        color: {{ getContrastColor(theme.dangerColor) }};
        background-color: {{ theme.dangerColor }};
      }

      #app .badge.badge-warning {
        color: {{ getContrastColor(theme.warningColor) }};
        background-color: {{ theme.warningColor }};
      }

      #app .badge.badge-info {
        color: {{ getContrastColor(theme.infoColor) }};
        background-color: {{ theme.infoColor }};
      }

      #app .badge.badge-light {
        color: {{ getContrastColor(theme.lightColor) }};
        background-color: {{ theme.lightColor }};
      }

      #app .badge.badge-dark {
        color: {{ getContrastColor(theme.darkColor) }};
        background-color: {{ theme.darkColor }};
      }
    </Component>
  </div>
</template>

<script>
import TranslationMixin from '@forgerock/platform-shared/src/mixins/TranslationMixin';
import i18n from '@/i18n';
import store from '@/store';
/**
Theme properties examples:

accountCardBackgroundColor: "#ffffff",
accountCardHeaderColor: "#23282e",
accountCardInnerBorderColor: "#e7eef4",
accountCardInputBackgroundColor: '#ffffff',
accountCardInputBorderColor: '#c0c9d5',
accountCardInputFocusBorderColor: '#E50914',
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
journeyInputFocusBorderColor: '#B20710',
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
  data() {
    const newMultiselectEnabled = store.state?.SharedStore?.newMultiselectEnabled;
    return {
      ignoredFonts: ['Arial', 'Helvetica'],
      newMultiselectEnabled,
    };
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
    fontFamily() {
      const { fontFamily } = this.theme;
      if (fontFamily) {
        return typeof fontFamily === 'string' ? fontFamily : fontFamily.family;
      }
      return '';
    },
    /**
     * Provides the color used for the focus state of an input in the Journey Pages
     *
     * @returns {String} - Hexadecimal color value
     */
    journeyInputFocusBorderColor() {
      return this.theme.journeyInputFocusBorderColor || this.theme.journeyInputBorderColor || this.theme.primaryColor;
    },
    /**
     * Provides the color used for the focus state of buttons and links
     *
     * @returns {String} - Hexadecimal color value
     */
    buttonFocusBorderColor() {
      return this.theme.buttonFocusBorderColor || '#0778d6';
    },
    /**
     * Provides the color used for the focus state of an input in the Account Pages
     *
     * @returns {String} - Hexadecimal color value
     */
    accountCardInputFocusBorderColor() {
      return this.theme.accountCardInputFocusBorderColor || this.theme.primaryColor;
    },
    logoProfile() {
      return this.getLocalizedString(this.theme.logoProfile, i18n.global.locale, i18n.global.fallbackLocale);
    },
    logoProfileCollapsed() {
      return this.getLocalizedString(this.theme.logoProfileCollapsed, i18n.global.locale, i18n.global.fallbackLocale);
    },
    fontUrl() {
      const apiUrl = [];
      const fontFamily = this.theme?.fontFamily;
      const themeFont = fontFamily?.family || fontFamily;

      if (this.ignoredFonts.includes(themeFont) || !themeFont) {
        return null;
      }

      apiUrl.push('https://fonts.bunny.net/css2?family=');
      apiUrl.push(themeFont.replace(/ /g, '+'));
      if (typeof fontFamily === 'object') {
        // Includes all possible font variants (weights).
        // Pushes each variant weight separated by a comma.
        fontFamily.variants.forEach((elm, index) => {
          if (index === 0) {
            apiUrl.push(':');
          }
          apiUrl.push(elm);
          // To avoid adding in an unnecessary last comma
          if (index < fontFamily.variants.length - 1) {
            apiUrl.push(',');
          }
        });
      } else {
        // We pass all weights for italics and bold since Bunny fonts doesn't include
        // ALL of the fonts needed for all languages. It just sends Normal 400.
        apiUrl.push(':ital,wght@0,100..900;1,100..900');
      }
      // Adds &display=swap param at end of url to ensure that the
      // fallback font is used before the bunny font loads
      apiUrl.push('&display=swap');

      // Creates one solid string to inject in the theme via import
      // (e.g. https://fonts.bunny.net/css2?family=Open+Sans:200,300,regular&display=swap)
      return apiUrl.length ? apiUrl.join('') : null;
    },
  },
  methods: {
    /**
     * Calculates the contrast color (either dark or light color) for a given hex color based on the specified target contrast ratio.
     *
     * @param {string} hexColor - The hex color code to determine the contrast color for.
     * @param {number} [targetRatio=4.5] - The target contrast ratio to achieve. Default is 4.5 as per WCAG AA Compliance.
     * @param {string} [darkColor='#000000'] - The dark color to use if the contrast ratio is met. Default is black.
     * @param {string} [lightColor='#ffffff'] - The light color to use if the contrast ratio is met. Default is white.
     * @returns {string} - The hex color code of the contrast color (either dark or light).
     */
    getContrastColor(hexColor, targetRatio = 4.5, lightColor = '#ffffff', darkColor = '#000000') {
      // Helper functions
      function hexToRgb(hex) {
        let tempHex = hex.replace(/^#/, '');
        if (tempHex.length === 3) {
          tempHex = tempHex[0] + tempHex[0] + tempHex[1] + tempHex[1] + tempHex[2] + tempHex[2];
        }
        const r = parseInt(tempHex.substring(0, 2), 16) / 255;
        const g = parseInt(tempHex.substring(2, 4), 16) / 255;
        const b = parseInt(tempHex.substring(4, 6), 16) / 255;
        return { r, g, b };
      }

      function calculateLuminance(rgb) {
        // WCAG 2.0 luminance calculation - linearized RGB

        // From sRGB gamma correction, these constants are based on IEC standard
        const linearThreshold = 0.03928;
        const linearCoefficient = 12.92;
        const nonLinearCoefficient = 1.055;
        const nonLinearExponent = 2.4;
        const nonLinearOffset = 0.055;

        const r = rgb.r <= linearThreshold ? rgb.r / linearCoefficient : ((rgb.r + nonLinearOffset) / nonLinearCoefficient) ** nonLinearExponent;
        const g = rgb.g <= linearThreshold ? rgb.g / linearCoefficient : ((rgb.g + nonLinearOffset) / nonLinearCoefficient) ** nonLinearExponent;
        const b = rgb.b <= linearThreshold ? rgb.b / linearCoefficient : ((rgb.b + nonLinearOffset) / nonLinearCoefficient) ** nonLinearExponent;

        // Weights derived from CIE 1931 color space and psychophysical studies
        const redWeight = 0.2126; // Relative contribution of red to luminance
        const greenWeight = 0.7152; // Relative contribution of green to luminance
        const blueWeight = 0.0722; // Relative contribution of blue to luminance

        return redWeight * r + greenWeight * g + blueWeight * b;
      }

      function calculateContrastRatio(lum1, lum2) {
        // WCAG 2.0 contrast ratio calculation
        const offset = 0.05; // Prevents division by zero and ensures minimum contrast
        const brighter = Math.max(lum1, lum2);
        const darker = Math.min(lum1, lum2);
        return (brighter + offset) / (darker + offset);
      }

      // Main logic
      if (typeof hexColor !== 'string' || !/^#([0-9A-Fa-f]{3}){1,2}$/.test(hexColor)) {
        return 'inherit'; // Return 'inherit' for invalid hex color
      }

      const rgb = hexToRgb(hexColor);
      const luminance = calculateLuminance(rgb);

      const whiteContrast = calculateContrastRatio(luminance, 1); // Use 1 for white luminance
      const blackContrast = calculateContrastRatio(luminance, 0); // Use 0 for black luminance

      if (whiteContrast >= targetRatio) {
        return lightColor; // Return the provided light color
      }

      if (blackContrast >= targetRatio) {
        return darkColor; // Return the provided dark color
      }
      // If neither white nor black meet the contrast ratio, this section can be expanded to find more suitable colors.
      // For now, return the best of the two.
      return whiteContrast > blackContrast ? lightColor : darkColor;
    },
  },
};
</script>
