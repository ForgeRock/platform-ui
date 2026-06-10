<!-- Copyright (c) 2025-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div
    v-if="providers.length"
    class="mb-5">
    <FrAccordion
      accordion-group="socialProviders"
      :items="providers">
      <template #accordionHeader>
        <div class="p-4">
          <h2 class="h4">
            {{ $t('pages.profile.socialSignIn.title') }}
          </h2>
          <p class="m-0">
            {{ $t('pages.profile.socialSignIn.subtitle') }}
          </p>
        </div>
      </template>
      <template #header="item">
        <div class="d-flex justify-content-between w-100">
          <BMedia>
            <template #aside>
              <BImg
                v-if="item.uiConfig.buttonImage"
                :src="`static/${item.uiConfig.buttonImage}`"
                :alt="item.uiConfig.buttonDisplayName"
                width="24"
                height="24" />
            </template>
            <h3 class="h5 mb-0">
              {{ item.uiConfig.buttonDisplayName }}
            </h3>
          </BMedia>
          <p class="mb-0">
            {{ (item._refResourceId ? $t('pages.profile.socialSignIn.connected') : $t('pages.profile.socialSignIn.notConnected')) }}
          </p>
        </div>
      </template>
      <template #body="item">
        <FrSocialIdentityPanel
          v-if="item._refResourceId"
          :provider="item" />
        <BButton
          block
          :variant="item._refResourceId ? 'danger' : 'primary'"
          @click="handleClick(item.provider)">
          {{ item._refResourceId ? $t('pages.profile.socialSignIn.disconnect') : $t('pages.profile.socialSignIn.connect') }}
        </BButton>
      </template>
    </FrAccordion>
    <BModal
      id="disconnectModal"
      :static="isTesting"
      :title="$t('pages.profile.socialSignIn.disconnect', { provider: disconnectedProvider })"
      title-class="h5"
      title-tag="h2"
      no-close-on-backdrop>
      <template #default>
        {{ $t('pages.profile.socialSignIn.disconnectConfirmMsg', { provider: disconnectedProvider }) }}
      </template>

      <template #modal-footer>
        <div>
          <BButton
            class="mr-2 text-secondary"
            variant="link"
            @click="hideModal">
            {{ $t('common.cancel') }}
          </BButton>
          <BButton
            type="button"
            variant="danger"
            @click="disconnectProvider">
            {{ $t('common.disconnect') }}
          </BButton>
        </div>
      </template>
    </BModal>
  </div>
</template>

<script setup>
/**
 * @description Handles displaying a users social providers, will also allow a user to configure a new social provider based on available providers
 *
 * @fires POST resource/name/ID?_action=bind&provider=provider (e.g. managed/user/fakeID?_action=bind&provider=google) - Binds a provider based on a return client token from the provider
 * @fires GET /identityProviders - List of available social providers
 * @fires POST managed/user/ID?_fields=idps/* (e.g. managed/user/fakeId?_fields=idps/*) - List of social providers already configured for the current logged in resource.
 * @fires POST /identityProviders?_action=getAuthRedirect - Generated the redirect information for a selected social provider
 * @fires POST resource/name/ID?_action=unbind&provider=provider (e.g. managed/user/fakeID?_action=unbind&provider=google) - Unbinds a social provider from the current sessions user
 *
 */
import { computed, ref, onMounted } from 'vue';
import {
  BButton,
  BImg,
  BMedia,
  BModal,
} from 'bootstrap-vue';
import {
  each,
  extend,
  find,
  findIndex,
  get,
  includes,
} from 'lodash';
import { displayNotification, showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import FrAccordion from '@forgerock/platform-shared/src/components/Accordion';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import { getAuthRedirect } from '@/api/AuthenticationApi';
import {
  getIdentityProviders,
  getConnectedProviders,
  unbindSocialProvider,
  bindSocialProvider,
} from '@/api/SelfServiceApi';
import FrSocialIdentityPanel from './SocialIdentityPanel';
import store from '@/store';
import i18n from '@/i18n';

const { userId, managedResource } = useUserStore();
const { bvModal } = useBvModal();

const props = defineProps({
  clientToken: {
    type: String,
    default: '',
  },
  linkedProvider: {
    type: String,
    default: '',
  },
  isTesting: {
    type: Boolean,
    default: false,
  },
});

const allAvailableProviders = ref([]);
const connectedProviders = ref([]);
const providers = ref([]);
const toDisconnect = ref({});

const disconnectedProvider = computed(() => {
  const providerName = get(toDisconnect.value, 'uiConfig.buttonDisplayName');
  return providerName || '';
});

/**
 * Shows a modal dialog for disconnecting a social provider.
 * @param provider provider to disconnect
 */
function showModal(provider) {
  toDisconnect.value = find(providers.value, { provider });
  bvModal.value.show('disconnectModal');
}

/**
 * Hides the disconnect modal dialog.
 */
function hideModal() {
  toDisconnect.value = {};
  bvModal.value.hide('disconnectModal');
}

/**
 * Initiates the connection process to a specified social provider.
 *
 * @param {string} provider - The name or identifier of the social provider to connect with.
 * @returns {Promise<void>} Resolves when the connection process is complete.
 */
async function connectProvider(provider) {
  try {
    const { data } = await getAuthRedirect({
      provider,
      landingPage: `${window.location.protocol}/#/${window.location.host}/login?_oauthReturn=true&provider=${provider}&gotoURL=profile`,
    });

    localStorage.setItem('linkedProvider', btoa(provider));
    localStorage.setItem('dataStoreToken', btoa(data.token));
    window.location.href = data.redirect;
  } catch (error) {
    showErrorMessage(error, '');
  }
}

/**
 * Handles the click event for a social login provider.
 * Initiates the authentication flow for the specified provider.
 *
 * @param {string} provider - The name of the social login provider (e.g., 'google', 'facebook').
 */
function handleClick(provider) {
  const isConnected = !!find(connectedProviders.value, (idp) => includes(idp._refResourceCollection, provider));

  if (isConnected) showModal(provider);
  else connectProvider(provider);
}

/**
 * Initializes and sets the available social authentication providers.
 * Typically used to configure which social login options are presented to the user.
 */
function setProviders() {
  const providersList = [];
  each(allAvailableProviders.value, (provider) => {
    let matchFound = false;

    each(connectedProviders.value, (idp) => {
      if (includes(idp._refResourceCollection, provider.provider)) {
        matchFound = true;
        providersList.push(extend(idp, provider));
      }
    });

    if (!matchFound) {
      providersList.push(provider);
    }
  });

  return providersList;
}

function getProviderDisplayName(provider) {
  const providerObj = find(providers.value, { provider });
  return providerObj?.uiConfig?.buttonDisplayName || '';
}

/**
 * Disconnects the currently connected social provider from the user's account.
 * Handles any necessary cleanup and updates the UI accordingly.
 */
async function disconnectProvider() {
  try {
    await unbindSocialProvider(managedResource, userId, toDisconnect.value.provider);
    connectedProviders.value.splice(findIndex(connectedProviders.value, { provider: toDisconnect.value.provider }), 1);
    providers.value = setProviders();
    const providerDisplayName = getProviderDisplayName(toDisconnect.value.provider);
    displayNotification('success', i18n.global.t('pages.profile.socialSignIn.unlinkProvider', { provider: providerDisplayName }));
  } catch (error) {
    showErrorMessage(error, i18n.global.t('pages.profile.socialSignIn.errorDisconnectingProvider'));
  } finally {
    hideModal();
  }
}

/**
 * Retrieves all connected social providers for the current user.
 */
async function getAllConnectedProviders() {
  try {
    const { data } = await getConnectedProviders(managedResource, userId);
    connectedProviders.value = data.idps;
    providers.value = setProviders();
  } catch (error) {
    showErrorMessage(error, i18n.global.t('pages.profile.socialSignIn.errorLoadingProviders'));
  }
}

/**
 * Handles the logic after a social connection attempt returns.
 * Typically used to process the result of a social authentication flow
 * @returns {Promise<void>} Resolves when the post-connection logic is complete.
 */
async function handleConnectReturn() {
  try {
    await bindSocialProvider(managedResource, userId, props.linkedProvider, props.clientToken);
    await getAllConnectedProviders();
    const providerDisplayName = getProviderDisplayName(props.linkedProvider);
    displayNotification('success', i18n.global.t('pages.profile.socialSignIn.linkedProvider', { provider: providerDisplayName }));
  } catch (error) {
    showErrorMessage(error, i18n.global.t('pages.profile.socialSignIn.errorConnectingProvider'));
  } finally {
    store.commit('clearOAuthState');
  }
}

/**
 * Asynchronously loads data required for the Social component.
 */
async function loadData() {
  try {
    const { data } = await getIdentityProviders();
    allAvailableProviders.value = data.providers;
    getAllConnectedProviders();
  } catch (error) {
    showErrorMessage(error, i18n.global.t('pages.profile.socialSignIn.errorLoadingProviders'));
  }

  if (props.clientToken && props.linkedProvider) {
    handleConnectReturn();
  }
}

onMounted(() => {
  loadData();
});
</script>
