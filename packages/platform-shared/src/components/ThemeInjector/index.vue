<!-- Copyright (c) 2020-2026 ForgeRock. All rights reserved.

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

      <template v-if="mock">.fr-theme-preview</template> .btn:not(.within-input-button .btn, .fr-menu-item-group .btn, .skip-to-content-popover),
      <template v-if="mock">.fr-theme-preview</template> .pagination-buttons button.page-link {
        border-radius: {{ theme.buttonRounded }}px !important;
      }

      <template v-if="mock">.fr-theme-preview</template> .btn-primary {
        background-color: {{ theme.primaryColor }} !important;
        outline-color: {{ theme.primaryColor }} !important;
        border-color: {{ theme.primaryColor }} !important;
        color: {{ theme.textColor }} !important;
      }

      <template v-if="mock">.fr-theme-preview</template> .btn-primary:disabled {
        background-color: {{ theme.primaryOffColor }} !important;
      }

      <template v-if="mock">.fr-theme-preview</template> .btn-primary:hover {
        background-color: {{ theme.primaryOffColor }} !important;
      }

      <template v-if="mock">.fr-theme-preview</template> a {
        font-weight: {{ theme.boldLinks ? 700 : 400 }};
        color: {{ journeyLinkColor }} !important;
      }

      <template v-if="mock">.fr-theme-preview</template> a:hover {
        color: {{ journeyLinkActiveColor }} !important;
      }

      <!-- Darkens linkColor only as far as needed to meet WCAG AA 4.5:1 on the card background; preserves it unchanged if it already passes -->
      <template v-if="mock">.fr-theme-preview</template> .btn-link,
      <template v-if="mock">.fr-theme-preview</template> .nav-link {
        color: {{ journeyLinkColor }} !important;
      }

      <template v-if="mock">.fr-theme-preview</template> .btn-link:hover,
      .nav-link:hover {
        color: {{ journeyLinkActiveColor }} !important;
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

      #app .floating-action-bar.bg-dark .text-light {
        color: {{ theme.lightColor || '#f6f8fa' }} !important;
      }

      #app .floating-action-bar.bg-dark .btn-dark,
      #app .floating-action-bar.bg-dark .btn-dark:hover {
        color: {{ theme.lightColor || '#f6f8fa' }};
      }

      <template v-if="mock">.fr-theme-preview</template> body {
        color: {{ theme.bodyText }};
      }

      <template v-if="mock">.fr-theme-preview</template> .text-body {
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
        color: {{ theme.pageTitle }} !important;
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
         * .form-control.focus (Bootstrap Vue JS-driven focus class)
         * .form-control .multiselect
         * .form-control .multiselect__tags
         * .uneditable-input
      -->
      textarea:focus,
      <template v-if="mock">.fr-theme-preview</template> input:focus:not(.multiselect__input, .fr-tag-input),
      <template v-if="mock">.fr-theme-preview</template> input[type]:focus:not(.multiselect__input),
      .uneditable-input:focus,
      <template v-if="mock">.fr-theme-preview</template> .form-control.focus,
      <template v-if="mock">.fr-theme-preview</template> .form-control:focus-within .multiselect,
      <template v-if="mock">.fr-theme-preview</template> .form-control:focus .multiselect,
      <template v-if="mock">.fr-theme-preview</template> .form-control:focus-within .multiselect__tags,
      <template v-if="mock">.fr-theme-preview</template> .form-control .multiselect:focus .multiselect__tags,
      <template v-if="mock">.fr-theme-preview</template> .form-label-group:not(.fr-field-error) .form-control:focus-within {
        border-color: {{ theme.primaryColor }} !important;
        -webkit-box-shadow: 0 0 0 0.0625rem {{ theme.primaryColor }} !important;
        box-shadow: 0 0 0 0.0625rem {{ theme.primaryColor }} !important;
        outline: 0 none;
      }

      <template v-if="mock">.fr-theme-preview</template> tr:focus-visible,
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
        border-color: {{ theme.primaryColor }};
      }

      .rounded-pill:has(.custom-control.custom-checkbox .custom-control-input:active),
      .rounded-pill:has(.custom-control.custom-checkbox .custom-control-input:focus),
      .rounded-pill:has(.custom-control.custom-checkbox .custom-control-input:focus-visible),
      .custom-control:not(.rounded-pill .custom-control):has(input[type="checkbox"]:focus-visible) {
        box-shadow: 0 0 0 2px {{ buttonFocusBorderColor }} !important;
      }

      .spinner-primary {
        color: {{ theme.primaryColor }};
      }

      #app <template v-if="mock">.fr-theme-preview</template> .form-label-group.fr-field-error input:not(.multiselect__input):not(.fr-tag-input),
      #app <template v-if="mock">.fr-theme-preview</template> .form-label-group.fr-field-error .btn {
        border-color: {{ theme.dangerColor }} !important;
      }

      #app <template v-if="mock">.fr-theme-preview</template> .form-label-group.fr-field-error .form-control:focus,
      #app <template v-if="mock">.fr-theme-preview</template> .form-label-group:focus-within.fr-field-error .input-buttons:not(:focus-within) .within-input-button .btn {
        box-shadow: 0 0 0 0.0625rem {{ theme.dangerColor }} !important;
      }
    </Component>

    <Component
      :is="'style'"
      v-if="!isEnduser">
      <!--
        JOURNEY PAGES STYLES
      -->
      <template v-if="mock">.fr-theme-preview.login</template> .card .login-header {
        border-radius: {{ theme.journeyCardBorderRadius || 4 }}px {{ theme.journeyCardBorderRadius || 4 }}px 0 0 !important;
      }

      <template v-if="mock">.fr-theme-preview.login</template> .card,
      <template v-if="mock">.fr-theme-preview.login</template> .journey-card {
        background-color: {{ theme.journeyCardBackgroundColor || '#ffffff' }} !important;
        color: {{ theme.journeyCardTextColor || '#5e6d82' }} !important;
        box-shadow: rgb(0 0 0 / 13%) 0px 1px {{ theme.journeyCardShadow !== undefined ? theme.journeyCardShadow : 3 }}px;
      }

      <template v-if="mock">.fr-theme-preview.login</template> .card {
        border-radius: {{ theme.journeyCardBorderRadius || 4 }}px !important;
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
        color: {{ theme.journeyCardTitleColor || '#23282e' }} !important;
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
      <template v-if="mock">.fr-theme-preview</template> .form-control .multiselect:focus .multiselect__tags {
        -webkit-box-shadow: 0 0 0 0.0625rem {{ journeyInputFocusBorderColor }} !important;
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
        color: {{ theme.accountNavigationTextColor || '#455469' }} !important;
      }

      #app .fr-sidebar-menuitems li a:hover,
      #app .fr-sidebar-menuitems li button:hover {
        background-color: {{ theme.profileMenuHoverColor }};
        color: {{ theme.profileMenuHoverTextColor }} !important;
      }

      #app <template v-if="mock">.fr-theme-preview.enduser</template> .router-link-active {
        background-color: {{ theme.profileMenuHighlightColor }};
        color: {{ theme.profileMenuTextHighlightColor }} !important;
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

      .fr-company-logo.fr-company-logo-square {
        height: {{ logoProfileCollapsed ? theme.logoProfileHeight || theme.logoHeight || 24 : theme.logoHeight || 24 }}px;
      }

      .fr-company-logo.fr-company-logo-horizontal {
        height: {{ theme.logoProfileHeight || theme.logoHeight || 24 }}px;
      }

      <template v-if="mock">.fr-theme-preview.enduser</template> .fr-sidebar-nav {
        background-color: {{ theme.accountNavigationBackgroundColor || '#ffffff' }};
      }

      .fr-sidebar-wrapper .fr-sidebar-bottom {
        border-top-color: {{ theme.accountNavigationToggleBorderColor || '#e7eef4' }} !important;
      }

      #app <template v-if="mock">.fr-theme-preview.enduser</template> .card:not(.form-section),
      <template v-if="mock">.fr-theme-preview.enduser</template> .modal-content,
      <template v-if="mock">.fr-theme-preview.enduser</template> .modal-content .card,
      #app <template v-if="mock">.fr-theme-preview.enduser</template> .dropdown-menu,
      #app <template v-if="mock">.fr-theme-preview.enduser</template> .menu {
        background-color: {{ theme.accountCardBackgroundColor || '#ffffff' }} !important;
        border: 1px solid {{ theme.accountCardOuterBorderColor || '#e7eef4' }} !important;
        color: {{ theme.accountCardTextColor || '#5e6d82' }} !important;
        box-shadow: rgb(0 0 0 / 13%) 0px 1px {{ theme.accountCardShadow !== undefined ? theme.accountCardShadow : 3 }}px;
      }

      #app .card .table {
        color: {{ theme.accountCardTextColor || '#5e6d82' }};
      }

      #app .card .list-group-item {
        background-color: {{ theme.accountCardBackgroundColor || '#ffffff' }} !important;
        border: none;
        border-top: 1px solid;
        border-color: {{ theme.accountCardInnerBorderColor || '#e7eef4' }} !important;
      }

      #app .card .list-group-flush {
        border: none;
      }

      #app .card h4,
      #app .card .h4,
      #app .card h5,
      #app .card .h5,
      #app .card .table.b-table > thead > tr,
      <template v-if="mock">.fr-theme-preview.enduser</template> .modal-header h2 {
        color: {{ theme.accountCardHeaderColor || '#23282e' }} !important;
      }
      #app .card .card-header {
        outline-color: {{ theme.primaryColor || '#109cf1' }};
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
      <template v-if="mock">.fr-theme-preview.enduser</template> .modal-content .b-dropdown .dropdown-menu {
        background-color: {{ theme.accountCardInputBackgroundColor || '#ffffff' }} !important;
        border-color: {{ theme.accountCardInputBorderColor || '#c0c9d5' }};
        color: {{ theme.accountCardInputTextColor || '#23282e' }} !important;
      }

      <template v-if="mock">.fr-theme-preview.enduser</template> .form-label-group .form-label-group-input .multiselect .multiselect__option--highlight {
        background-color: {{ theme.accountCardInputSelectHoverColor || '#f6f8fa' }} !important;
        outline-offset: -2px;
        outline: 2px solid {{ buttonFocusBorderColor }};
      }

      <template v-if="mock">.fr-theme-preview.enduser</template> .form-label-group .form-label-group-input .multiselect .multiselect__option--selected,
      <template v-if="mock">.fr-theme-preview.enduser</template> .form-label-group .form-label-group-input .multiselect .multiselect__tag {
        background-color: {{ accountCardInputSelectColor }} !important;
      }

      <template v-if="mock">.fr-theme-preview.enduser</template> .form-label-group .form-label-group-input .multiselect .multiselect__option--selected .text-dark,
      <template v-if="mock">.fr-theme-preview.enduser</template> .form-label-group .form-label-group-input .multiselect .multiselect__tag .text-dark,
      <template v-if="mock">.fr-theme-preview.enduser</template> .form-label-group .form-label-group-input .multiselect .multiselect__tag .multiselect__tag-icon::after {
        color: {{ getContrastColor(accountCardInputSelectColor, 4.5, accountCardInputTextColor, accountCardTextColor) }} !important;
      }

      <template v-if="mock">.fr-theme-preview.enduser</template> .form-label-group .form-label-group-input .multiselect .multiselect__option--selected .text-muted,
      <template v-if="mock">.fr-theme-preview.enduser</template> .form-label-group .form-label-group-input .multiselect .multiselect__tag .text-muted {
        color: {{ getMutedTextColor(accountCardInputSelectColor, accountCardTextColor, accountCardInputTextColor) }} !important;
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
        color: {{ accountCardInputTextColor }} !important;
      }

      #app <template v-if="mock">.fr-theme-preview.enduser</template> .multiselect .multiselect__select::before,
      #app <template v-if="mock">.fr-theme-preview.enduser</template> .multiselect .multiselect__single,
      #app <template v-if="mock">.fr-theme-preview.enduser</template> input::placeholder,
      .modal-content .multiselect .multiselect__input,
      .modal-content .multiselect .multiselect__input::placeholder,
      .modal-content label.form-control {
        color: {{ accountCardInputTextColor }};
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

      #app <template v-if="mock">.fr-theme-preview.enduser</template> .dropdown-item:hover,
      #app <template v-if="mock">.fr-theme-preview.enduser</template> .dropdown-item:focus {
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

      #app <template v-if="mock">.fr-theme-preview.enduser</template> .dropdown-item:hover .material-icons-outlined,
      #app <template v-if="mock">.fr-theme-preview.enduser</template> .dropdown-item:focus .material-icons-outlined {
        color: {{ theme.profileMenuHoverTextColor || 'inherit' }} !important;
      }
      <!-- Styling for actions menu component -->
      #app <template v-if="mock">.fr-theme-preview.enduser</template> .menu .dropdown-item:focus {
        background-color: unset;
        color: #455469 !important;
      }

      #app <template v-if="mock">.fr-theme-preview.enduser</template> .menu .dropdown-item:focus .material-icons-outlined {
        color: #455469 !important;
      }

      #app .menu .dropdown-item:focus .text-success {
        color: {{ theme.successColor }} !important;
      }

      #app .menu .dropdown-item:focus .text-danger {
        color: {{ theme.dangerColor }} !important;
      }

      #app .menu .dropdown-item:focus .text-muted {
        color: {{ theme.secondaryColor }} !important;
      }

      #app .menu .dropdown-item.active {
        background-color: {{ theme.profileMenuActiveColor || '#e4f4fd' }};
        color: {{ theme.darkColor || '#23282e' }};
      }

      #app <template v-if="mock">.fr-theme-preview.enduser</template> .menu .dropdown-item:hover,
      #app <template v-if="mock">.fr-theme-preview.enduser</template> .menu .dropdown-item:focus-visible {
        background-color: {{ theme.profileMenuHoverColor || '#e4f4fd' }} !important;
        color: {{ theme.profileMenuHoverTextColor || '#181b20' }} !important;
      }

      #app .menu .dropdown-item:hover .h5,
      #app .menu .dropdown-item:focus-visible .h5 {
        color: {{ theme.profileMenuHoverTextColor || '#181b20' }} !important;
      }

      #app .menu .dropdown-item:hover .text-muted,
      #app .menu .dropdown-item:focus-visible .text-muted {
        color: {{ theme.profileMenuHoverTextColor || '#455469' }} !important;
      }

      #app <template v-if="mock">.fr-theme-preview.enduser</template> .menu .dropdown-item:hover .material-icons-outlined,
      #app <template v-if="mock">.fr-theme-preview.enduser</template> .menu .dropdown-item:focus-visible .material-icons-outlined {
        color: {{ theme.profileMenuHoverTextColor || 'inherit' }} !important;
      }

      #app .fr-main-navbar<template v-if="mock">-mock</template> {
        background-color: {{ theme.topBarBackgroundColor || '#ffffff' }};
        border-bottom-color: {{ theme.topBarBorderColor || '#e7eef4' }};
      }

      #app .fr-main-navbar<template v-if="mock">-mock</template> .material-icons-outlined,
      #app .fr-main-navbar<template v-if="mock">-mock</template> .fr-back-link .h5,
      #app .fr-main-navbar<template v-if="mock">-mock</template> .fr-dropdown-button-content div,
      #app .fr-main-navbar<template v-if="mock">-mock</template> .dropdown-toggle::after {
        color: {{ theme.topBarTextColor || '#324054' }} !important;
      }

      #app .fr-main-navbar<template v-if="mock">-mock</template> .fr-dropdown-button-content h5 {
        color: {{ theme.topBarHeaderColor || '#23282e' }} !important;
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

      #app .accordion dd {
        color: {{ theme.accountCardTextColor || '#5e6d82' }};
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

      .b-calendar .btn-light,
      .b-calendar .btn-outline-primary.focus {
        box-shadow: 0 0 0 2px {{ buttonFocusBorderColor }} !important;
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
         * .form-control .multiselect__tags
         * .uneditable-input
      -->
      textarea:focus,
      <template v-if="mock">.fr-theme-preview</template> input:focus:not(.multiselect__input, .fr-tag-input),
      <template v-if="mock">.fr-theme-preview</template> input[type]:focus:not(.multiselect__input),
      .uneditable-input:focus,
      <template v-if="mock">.fr-theme-preview</template> .form-control:focus-within .multiselect,
      <template v-if="mock">.fr-theme-preview</template> .form-control:focus .multiselect,
      <template v-if="mock">.fr-theme-preview</template> .form-control:focus-within .multiselect__tags,
      <template v-if="mock">.fr-theme-preview</template> .form-control .multiselect:focus .multiselect__tags,
      <template v-if="mock">.fr-theme-preview</template> .fr-search-input-holder .input-group:focus-within {
        border-color: {{ accountCardInputFocusBorderColor }} !important;
        -webkit-box-shadow: 0 0 0 0.0625rem {{ accountCardInputFocusBorderColor }} !important;
        box-shadow: 0 0 0 0.0625rem {{ accountCardInputFocusBorderColor }} !important;
        outline: 0 none;
      }

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

      <!-- Styles success, danger, and warning alert notifications to follow the theme colors -->
      #app <template v-if="mock">.fr-theme-preview</template> .fr-alert.alert-success {
        border-left-color: {{ theme.successColor }};
        background-color: {{ `color-mix(in srgb, ${theme.successColor} 15%, white)` }};
      }

      #app <template v-if="mock">.fr-theme-preview</template> .fr-alert.alert-danger,
      #app <template v-if="mock">.fr-theme-preview</template> .fr-alert.alert-error {
        border-left-color: {{ theme.dangerColor }};
        background-color: {{ `color-mix(in srgb, ${theme.dangerColor} 15%, white)` }};
      }

      #app <template v-if="mock">.fr-theme-preview</template> .fr-alert.alert-warning {
        border-left-color: {{ theme.warningColor }};
        background-color: {{ `color-mix(in srgb, ${theme.warningColor} 15%, white)` }};
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

/** Luminance at the perceptual midpoint between black and white — backgrounds below this value are considered dark. */
const DARK_BG_LUMINANCE_THRESHOLD = 0.179;
/** Matches valid 3, 4, 6, or 8-digit hex colour strings (e.g. #fff, #fff8, #1a2b3c, #1a2b3c80). */
const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{3,4}){1,2}$/;
/** The target contrast ratio to achieve. Default is 4.5 as per WCAG AA Compliance. */
const TARGET_CONTRAST_RATIO = 4.5;
/**
 * Internal binary-search threshold, slightly above the target contrast ratio of 4.5.
 * Math.round() in toHex snaps float channels to 8-bit integers, which can reduce a contrast of 4.50 to ~4.49.
 * This margin ensures the quantised hex result still clears the 4.5 target after rounding.
 */
const BLEND_SEARCH_THRESHOLD = 4.55;

/**
 * Parses a 3, 4, 6, or 8-digit hex colour string into an opaque 0–1 RGB object.
 * 4- and 8-digit (RGBA) inputs are composited over white so that all contrast
 * calculations operate on the visually rendered colour, not the raw RGBA value.
 */
function hexToRgb(hex) {
  let digits = hex.replace(/^#/, '');
  if (digits.length === 3 || digits.length === 4) {
    digits = digits.split('').map((char) => char + char).join('');
  }
  const red = parseInt(digits.substring(0, 2), 16) / 255;
  const green = parseInt(digits.substring(2, 4), 16) / 255;
  const blue = parseInt(digits.substring(4, 6), 16) / 255;
  const alpha = digits.length === 8 ? parseInt(digits.substring(6, 8), 16) / 255 : 1;
  // Composite over white: effectiveChannel = foreground * alpha + white * (1 - alpha)
  return {
    r: red * alpha + (1 - alpha),
    g: green * alpha + (1 - alpha),
    b: blue * alpha + (1 - alpha),
  };
}

/** WCAG 2.1 relative luminance — linearises sRGB channels (IEC 61966-2-1) then applies CIE 1931 luminosity coefficients (0.2126 R, 0.7152 G, 0.0722 B). */
function calculateLuminance({ r, g, b }) {
  const f = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

/** WCAG 2.1 contrast ratio between two luminance values; the 0.05 offset prevents division by zero. */
function calculateContrastRatio(l1, l2) {
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

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
    accountCardInputSelectColor() {
      return this.theme.accountCardInputSelectColor || '#e4f4fd';
    },
    accountCardTextColor() {
      return this.theme.accountCardTextColor || '#5e6d82';
    },
    accountCardInputTextColor() {
      return this.theme.accountCardInputTextColor || '#23282e';
    },
    journeyLinkColor() {
      return this.getMutedTextColor(this.theme.journeyCardBackgroundColor || '#ffffff', this.theme.linkColor || '#109cf1', '#000000');
    },
    journeyLinkActiveColor() {
      return this.getMutedTextColor(this.theme.journeyCardBackgroundColor || '#ffffff', this.theme.linkActiveColor || this.theme.linkColor || '#109cf1', '#000000');
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
     * Calculates the contrast color (either light or dark color) for a given hex color based on the specified target contrast ratio.
     *
     * @param {string} hexColor - The background hex color to determine the contrast color for.
     * @param {number} [targetRatio=TARGET_CONTRAST_RATIO] - The target contrast ratio to achieve. Default is 4.5 as per WCAG AA Compliance.
     * @param {string} [lightColor='#ffffff'] - Preferred color when background is dark. Returned if it meets the target ratio.
     * @param {string} [darkColor='#000000'] - Preferred color when background is light. Returned if it meets the target ratio.
     * @returns {string} - The hex color code that meets the contrast ratio, falling back to absolute black or white if neither candidate passes.
     */
    getContrastColor(hexColor, targetRatio = TARGET_CONTRAST_RATIO, lightColor = '#ffffff', darkColor = '#000000') {
      if (typeof hexColor !== 'string' || !HEX_COLOR_REGEX.test(hexColor)) {
        return 'inherit';
      }

      const luminance = calculateLuminance(hexToRgb(hexColor));
      const lightLuminance = HEX_COLOR_REGEX.test(lightColor)
        ? calculateLuminance(hexToRgb(lightColor)) : 1;
      const darkLuminance = HEX_COLOR_REGEX.test(darkColor)
        ? calculateLuminance(hexToRgb(darkColor)) : 0;

      if (calculateContrastRatio(luminance, lightLuminance) >= targetRatio) return lightColor;
      if (calculateContrastRatio(luminance, darkLuminance) >= targetRatio) return darkColor;

      // Neither preferred color passes — fall back to absolute black or white to guarantee WCAG compliance
      return luminance > DARK_BG_LUMINANCE_THRESHOLD ? '#000000' : '#ffffff';
    },
    /**
     * Returns the minimum-contrast-passing color (WCAG AA 4.5:1) for text on bgColor,
     * preferring preferredColor and blending toward black (light bg) or white (dark bg)
     * only as far as needed. Result contrast is always ≤ primaryTextColor contrast,
     * preserving visual hierarchy between primary and muted text.
     */
    getMutedTextColor(bgColor, preferredColor, primaryTextColor) {
      /** Converts a 0–1 RGB object to a #rrggbb hex string. */
      function toHex({ r, g, b }) {
        const c = (v) => Math.round(v * 255).toString(16).padStart(2, '0');
        return `#${c(r)}${c(g)}${c(b)}`;
      }
      /** Linear interpolation between two RGB colours at blend factor t (0 = a, 1 = b). */
      function lerpRgb(a, b, t) {
        return { r: a.r + t * (b.r - a.r), g: a.g + t * (b.g - a.g), b: a.b + t * (b.b - a.b) };
      }

      if (!HEX_COLOR_REGEX.test(bgColor) || !HEX_COLOR_REGEX.test(primaryTextColor)) return 'inherit';
      if (!HEX_COLOR_REGEX.test(preferredColor)) return primaryTextColor;

      const bgL = calculateLuminance(hexToRgb(bgColor));
      const preferredContrast = calculateContrastRatio(bgL, calculateLuminance(hexToRgb(preferredColor)));
      const primaryContrast = calculateContrastRatio(bgL, calculateLuminance(hexToRgb(primaryTextColor)));

      // Preferred passes and has lower/equal contrast than primary — ideal muted shade
      if (preferredContrast >= TARGET_CONTRAST_RATIO && preferredContrast <= primaryContrast) return preferredColor;
      // Preferred passes but is darker/lighter than primary — cap at primary to preserve visual hierarchy
      if (preferredContrast >= TARGET_CONTRAST_RATIO) return primaryTextColor;

      // Preferred fails WCAG AA — binary search for the minimum-passing blend toward black (light bg)
      // or white (dark bg), using BLEND_SEARCH_THRESHOLD to guard against toHex rounding loss.
      const blendTarget = bgL > DARK_BG_LUMINANCE_THRESHOLD ? { r: 0, g: 0, b: 0 } : { r: 1, g: 1, b: 1 };
      const pRgb = hexToRgb(preferredColor);
      let lo = 0; let hi = 1;
      // 20 iterations give precision to 1/2^20 (~0.000001) in blend factor — more than sufficient for 8-bit colour
      for (let i = 0; i < 20; i += 1) {
        const mid = (lo + hi) / 2;
        if (calculateContrastRatio(bgL, calculateLuminance(lerpRgb(pRgb, blendTarget, mid))) >= BLEND_SEARCH_THRESHOLD) hi = mid;
        else lo = mid;
      }
      const result = toHex(lerpRgb(pRgb, blendTarget, hi));

      // Cap at primary only when primary itself is WCAG-compliant — if primary fails on this bg
      // (e.g. dark theme where both greys are invisible), return the blended result as-is
      if (primaryContrast >= TARGET_CONTRAST_RATIO && calculateContrastRatio(bgL, calculateLuminance(hexToRgb(result))) > primaryContrast) return primaryTextColor;
      return result;
    },
  },
};
</script>
