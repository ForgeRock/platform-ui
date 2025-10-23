<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer
    v-if="!passwordVerification && !socialVerification"
    fluid
    class="h-100 px-0">
    <FrCenterCard :logo-enabled="false">
      <template #center-card-body>
        <FrSpinner
          class="mb-4" />
      </template>
    </FrCenterCard>
  </BContainer>

  <FrCenterCard v-else>
    <template #center-card-header>
      <div>
        <h2>
          {{ $t("pages.selfservice.accountClaiming.title") }}
        </h2>
        <span
          v-if="passwordVerification"
          v-html="$t('pages.selfservice.accountClaiming.passwordDesc', {account: mail})" />
        <span v-if="socialVerification">
          {{ socialDescription }}
        </span>
      </div>
    </template>

    <template #center-card-body>
      <BCardBody>
        <FrField
          v-if="passwordVerification"
          v-model="password"
          :label="$t('common.password')"
          type="password" />

        <FrSocialButtons
          v-if="socialVerification"
          :filter-providers="providers"
          :filter-providers-objects="providersObjects"
          signin />

        <BButton
          v-if="passwordVerification"
          @click="claimAccount"
          class="mb-3"
          block
          variant="primary">
          {{ $t("common.signIn") }}
        </BButton>
      </BCardBody>
    </template>

    <template #center-card-footer>
      <BCardFooter>
        <BLink :to="{ name: 'Login' }">
          {{ $t("pages.selfservice.accountClaiming.return") }}
        </BLink>
      </BCardFooter>
    </template>
  </FrCenterCard>
</template>

<script setup>
/**
 * @description Selfservice stage for account claiming via social identity providers.
 * This component manages the workflow for users claiming their accounts
 * using social login providers or by verifying their password.
 * */
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  BButton,
  BCardBody,
  BCardFooter,
  BContainer,
  BLink,
} from 'bootstrap-vue';
import {
  has, isEmpty, isString, isUndefined, map, each, upperFirst,
} from 'lodash';
import { displayNotification, showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import FrCenterCard from '@forgerock/platform-shared/src/components/CenterCard';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import FrSocialButtons from '@/components/selfservice/social/SocialButtons';
import useSelfService from '@/composables/selfService';
import { loginWithDataStoreToken } from '@/api/AuthenticationApi';
import i18n from '@/i18n';
import store from '@/store';

const router = useRouter();
const {
  loadSelfServiceData,
  selfServiceDetails,
  advanceSelfServiceStage,
  errorFunction,
  progressiveProfileCheck,
} = useSelfService();

const apiType = 'socialUserClaim';
const password = ref('');
const passwordVerification = ref(false);
const providers = ref([]);
const providersObjects = ref([]);
const socialVerification = ref(false);
const mail = ref('');

const clientToken = computed(() => store.state.OAuthState.clientToken);
const originalToken = computed(() => store.state.OAuthState.originalToken);
const returnParams = computed(() => store.state.OAuthState.returnParams);

/**
 * Advances the current registration stage based on the provided parameters.
 *
 * @async
 * @param {Object} params - Parameters required to advance the registration stage.
 * @returns {Promise<void>} Resolves when the stage advancement is complete.
 */
async function advanceStage(params) {
  await advanceSelfServiceStage(apiType, params, null);
  if (selfServiceDetails.value) {
    // eslint-disable-next-line no-use-before-define
    setChildComponent(selfServiceDetails.value.type, selfServiceDetails.value);
  }
}

/**
 * Sets the child component based on the provided type and details.
 *
 * @async
 * @param {string} type - The type of the child component to set.
 * @param {Object} details - Additional details required to configure the child component.
 * @returns {Promise<void>} Resolves when the child component has been set.
 */
async function setChildComponent(type, details) {
  selfServiceDetails.value = details;

  if (type === 'parameters') {
    if (returnParams.value) advanceStage({ returnParams: returnParams.value });
    else advanceStage({});
  } else if (type === 'socialUserClaim' && details.tag === 'initial') {
    await advanceStage({ clientToken: clientToken.value });
  } else if (type === 'socialUserClaim' && details.tag === 'verifyProfile') {
    mail.value = has(details, 'requirements.mail') ? details.requirements.mail : '';

    if (details.requirements?.error) {
      showErrorMessage(null, details.requirements.error.message);
    } else if (details.requirements.required.indexOf('password') !== -1) {
      // You can get into this usecase by
      // having a manually registered account with matching email and a password set
      passwordVerification.value = true;
    } else if (clientToken.value && originalToken.value) {
      advanceStage({ clientToken: originalToken.value });
    } else {
      localStorage.setItem('accountClaimingToken', btoa(clientToken.value));
      providers.value = map(details.requirements?.definitions?.providers?.items?.oneOf, 'provider');
      providersObjects.value = details.requirements?.definitions?.providers?.items?.oneOf;
      socialVerification.value = true;
    }
  } else if (type === 'localAutoLogin' && isUndefined(details.additions?.claimedProfile)) {
    router.push({ name: 'Registration', params: { clientToken: clientToken.value } });
  } else if (details.tag === 'end' && details.status.success) {
    try {
      const { data } = await loginWithDataStoreToken(clientToken.value);
      progressiveProfileCheck(data, () => {
        if (has(details, 'additions.successUrl') && !isEmpty(details.additions.successUrl)) {
          window.location = details.additions.successUrl;
        } else {
          router.push('/');
        }
        displayNotification('success', i18n.global.t('pages.selfservice.accountClaiming.linked'));
      });
    } catch (error) {
      router.push('/login');
      showErrorMessage(error, i18n.global.t('pages.selfservice.genericError'));
    }
  } else {
    router.push('/login');
    showErrorMessage(null, i18n.global.t('pages.selfservice.accountClaiming.error'));
  }
}

/**
 * Handles API error responses during the account claiming process.
 * This callback processes the error object returned from the API
 *
 * @param {Object} error - The error object returned from the API call.
 */
function apiErrorCallback(error) {
  router.push('/login');
  showErrorMessage(error, i18n.global.t('pages.selfservice.genericError'));
}

/**
 * Claims a user account using the provided account claiming token.
 *
 * @param {string} accountClaimingToken - The token used to claim the account.
 * @returns {Promise<void>|void} Performs the account claiming process, possibly asynchronously.
 */
function claimAccount(accountClaimingToken) {
  let tempToken = clientToken.value;

  if (isString(accountClaimingToken)) {
    tempToken = accountClaimingToken;
  }
  advanceStage({
    clientToken: tempToken,
    password: password.value,
  });
}

const socialDescription = computed(() => {
  const numProviders = providers.value.length;
  let providerList = '';

  each(providers.value, (provider, index) => {
    if (numProviders === 1) {
      providerList += upperFirst(provider);
    } else if (index < numProviders - 2) {
      providerList += `${upperFirst(provider)}, `;
    } else if (index < numProviders - 1) {
      providerList += `${upperFirst(provider)} `;
    } else {
      providerList += ` ${i18n.global.t('pages.selfservice.social.or')} ${upperFirst(provider)}`;
    }
  });

  return i18n.global.t('pages.selfservice.accountClaiming.socialDesc', { providers: providerList });
});

/**
 * Initializes the initial stage of the account claiming process.
 * This asynchronous function sets up any required state or data
 * before the user begins the account claiming workflow.
 *
 * @returns {Promise<void>} Resolves when the initial stage is set.
 */
async function setInitialStage() {
  errorFunction.value = apiErrorCallback;
  if (localStorage.getItem('accountClaimingToken')) {
    const accountClaimingToken = atob(localStorage.getItem('accountClaimingToken'));
    localStorage.removeItem('accountClaimingToken');
    claimAccount(accountClaimingToken);
  } else {
    await loadSelfServiceData(apiType);
    if (selfServiceDetails.value) {
      setChildComponent(selfServiceDetails.value.type, selfServiceDetails.value);
    }
  }
}

onMounted(() => {
  setInitialStage();
});

</script>
