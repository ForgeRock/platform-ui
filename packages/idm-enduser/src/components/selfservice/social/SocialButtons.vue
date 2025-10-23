<!-- Copyright (c) 2020-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div v-if="providers.length">
    <button
      v-for="(provider, index) in providerConfig"
      class="btn btn-lg btn-light btn-block fr-btn-social mb-3"
      :key="index"
      :style="socialButtonStyles[index]"
      @click.prevent="goToIDP(provider.provider)"
      @mouseover="hover(index, provider.uiConfig.buttonCustomStyleHover)"
      @mouseout="hover(index, provider.uiConfig.buttonCustomStyle)">
      <img
        v-if="provider.uiConfig.buttonImage"
        :src="'static/' + provider.uiConfig.buttonImage">
      <FrIcon
        v-else
        :name="provider.uiConfig.iconClass" />
      <span
        v-if="signIn"
        class="ml-1">
        {{ $t("pages.selfservice.social.signIn") }} {{ provider.uiConfig.buttonDisplayName }}
      </span>
      <span
        class="ml-1"
        v-else>
        {{ $t("pages.selfservice.social.signUp") }} {{ provider.uiConfig.buttonDisplayName }}
      </span>
    </button>
    <div
      class="text-muted mb-3"
      v-if="filterProviders.length === 0">
      {{ $t("pages.selfservice.social.or") }}
    </div>
  </div>
</template>

<script setup>
/**
* @description Controlling component for initializing oauth process for login and registration.
* This component controls the displaying of the buttons based on which providers are configured.
*
* @fires GET authentication - Returns a list of available configured providers.
* @fires POST identityProviders?_action=getAuthRedirect - Generates the redirect URL used to go to the selected provider and begin the Oauth authentication process
* */
import { computed, ref, onMounted } from 'vue';
import { filter, includes, each } from 'lodash';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { getAuthenticationConfig, logout, getAuthRedirect } from '@/api/AuthenticationApi';
import i18n from '@/i18n';

const props = defineProps({
  signIn: {
    type: Boolean,
    default: false,
  },
  filterProviders: {
    type: Array,
    default: () => [],
  },
  filterProvidersObjects: {
    type: Array,
    default: () => [],
  },
});

const providers = ref([]);
const providerConfig = computed(() => filter(providers.value, (provider) => provider.uiConfig));
const socialButtonStyles = ref([]);

/**
 * Handles the hover event for a social button.
 *
 * @param {number} index - The index of the social button being hovered.
 * @param {string} style - The style to apply when the button is hovered.
 */
function hover(index, style) {
  socialButtonStyles.value[index] = style;
}

/**
 * Redirects the user to the specified Identity Provider (IDP) for authentication.
 *
 * @param {string} provider - The name or identifier of the social authentication provider (e.g., 'google', 'facebook').
 * @returns {Promise<void>} Resolves when the redirection process is initiated.
 */
async function goToIDP(provider) {
  try {
    await logout();
    const { data } = await getAuthRedirect({
      provider,
      landingPage: `${window.location.protocol}//${window.location.host}/#/login?_oauthReturn=true&provider=${provider}&gotoURL=%23`,
    });

    localStorage.setItem('dataStoreToken', btoa(data.token));
    window.location.href = data.redirect;
  } catch (error) {
    showErrorMessage(error, i18n.global.t('pages.selfservice.genericError'));
  }
}

/**
 * Loads necessary data for the SocialButtons component.
 * This function is typically called during component initialization to fetch
 * or prepare data required for rendering social login buttons.
 *
 * @returns {Promise<void>} Resolves when data loading is complete.
 */
async function loadData() {
  try {
    const { data } = await getAuthenticationConfig();
    providers.value = filter(data.providers || [], (provider) => (props.filterProviders.length === 0 || includes(props.filterProviders, provider.provider)));

    if (providers.value.length) {
      each(providers.value, (provider, index) => {
        socialButtonStyles.value[index] = provider.uiConfig.buttonCustomStyle;

        if (provider.provider === 'salesforce') {
          provider.uiConfig.buttonImage = 'images/salesforce.png';
        }
      });
    } else if (props.filterProvidersObjects.length) {
      providers.value = props.filterProvidersObjects;
    }
  } catch (error) {
    showErrorMessage(error, i18n.global.t('pages.selfservice.genericError'));
  }
}

onMounted(() => {
  loadData();
});
</script>

<style lang="scss" scoped>
.fr-btn-social img{
    max-width: 21px;
    margin-right: 5px;
}
</style>
