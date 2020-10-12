<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <Component :is="'style'">
    body {
    background-color: {{ theme.backgroundColor }};
    }

    body.fr-body-image {
    background-image: url('{{ theme.backgroundImage }}');
    background-size: cover;
    background-repeat: no-repeat;
    }

    .btn-primary {
    background-color: {{ theme.primaryColor }} !important;
    border-radius: {{ theme.buttonRounded }}px !important;
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
  </Component>
</template>

<script>
/**
 * Injects a style sheet based on provided theming variables.
 * Intended functionality is to allow for basic themeing and overriding in
 * certain parts of the UI.
 */
export default {
  name: 'ThemeInjector',
  props: {
    /**
     * Theme Object
     *      "logo": URL,
            "backgroundColor": "#000",
            "backgroundImage": URL,
            "primaryColor" : "#ed1543",
            "primaryOffColor" : "#990f24",
            "textColor": "#000",
            "buttonRounded": "15px"
     */
    theme: {
      type: Object,
      default: () => ({ realm: {} }),
    },
  },
};
</script>
