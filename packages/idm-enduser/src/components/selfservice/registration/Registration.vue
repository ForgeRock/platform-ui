<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer class="vh-100">
    <BContainer
      fluid
      class="h-100 px-0"
      v-show="!showSelfService">
      <div class="h-100 d-flex">
        <FrCenterCard :logo-enabled="false">
          <template #center-card-body>
            <FrSpinner
              class="mb-4" />
          </template>
        </FrCenterCard>
      </div>
    </BContainer>

    <div v-show="showSelfService">
      <FrCenterCard v-if="selfServiceType !== 'localAutoLogin'">
        <template #center-card-header>
          <h1
            v-if="title.length"
            class="h2">
            {{ title }}
          </h1>
          <p
            v-show="subtitle.length > 0"
            class="text-center mb-0">
            {{ subtitle }}
          </p>
        </template>

        <template #center-card-body>
          <BCardBody>
            <component
              :is="components[selfServiceType]"
              :self-service-details="selfServiceDetails"
              @advanceStage="advanceStage" />
          </BCardBody>
        </template>

        <template #center-card-footer>
          <BCardFooter>
            {{ $t('pages.selfservice.registration.haveAccount') }}
            <BLink :to="{ name: 'Login' }">
              {{ $t("pages.selfservice.signIn") }}
            </BLink>
          </BCardFooter>
        </template>
      </FrCenterCard>
    </div>
  </BContainer>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { each, has } from 'lodash';
import {
  BCardBody,
  BCardFooter,
  BContainer,
  BLink,
} from 'bootstrap-vue';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import FrCenterCard from '@forgerock/platform-shared/src/components/CenterCard';
import { displayNotification, showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import useSelfService from '@/composables/selfService';
import { loginWithJwt, logout } from '@/api/AuthenticationApi';
import FrAllInOneRegistration from './AllInOneRegistration';
import FrEmailValidation from './EmailValidation';
import FrConsent from './Consent';
import FrUserDetails from './UserDetails';
import FrKBASecurityAnswerDefinitionStage from './KBASecurityAnswerDefinitionStage';
import FrTermsAndConditions from './TermsAndConditions';
import FrCaptcha from '../common/Captcha';
import i18n from '@/i18n';

const props = defineProps({
  clientToken: {
    type: String,
    default: null,
  },
});

// composables
const route = useRoute();
const router = useRouter();
const queryParams = route.params?.queryParams || null;
const {
  loadSelfServiceData,
  selfServiceDetails,
  advanceSelfServiceStage,
  showSelfService,
  errorFunction,
  parseQueryParams,
} = useSelfService();

// data
const clientTokenUsed = ref(false);
const selfServiceType = ref(null);
const apiType = 'registration';
const customTitleComponents = [
  'captcha',
  'consent',
  'emailValidation',
  'kbaSecurityAnswerDefinitionStage',
  'termsAndConditions',
];
const components = {
  allInOneRegistration: FrAllInOneRegistration,
  idmUserDetails: FrUserDetails,
  emailValidation: FrEmailValidation,
  kbaSecurityAnswerDefinitionStage: FrKBASecurityAnswerDefinitionStage,
  termsAndConditions: FrTermsAndConditions,
  consent: FrConsent,
  captcha: FrCaptcha,
};

const title = computed(() => {
  if (customTitleComponents.includes(selfServiceType.value)) {
    return i18n.global.t(`pages.selfservice.registration.stageTitle.${selfServiceType.value}`);
  }
  return i18n.global.t('pages.selfservice.registration.signUp');
});

const subtitle = computed(() => {
  if (customTitleComponents.includes(selfServiceType.value)) {
    return i18n.global.t(`pages.selfservice.registration.stageSubtitle.${selfServiceType.value}`);
  }
  return i18n.global.t('pages.selfservice.registration.signUpMsg');
});

/**
 * Attempts to automatically log in a user using the provided JWT token.
 * On successful authentication, redirects the user to the specified success URL.
 *
 * @param {string} jwt - The JSON Web Token used for authentication.
 * @param {string} successUrl - The URL to redirect to upon successful login.
 * @returns {Promise<void>} Resolves when the login and redirection are complete.
 */
async function autoLogin(jwt, successUrl) {
  await logout();

  try {
    await loginWithJwt(jwt);
    displayNotification('success', i18n.global.t('pages.selfservice.registration.createdAccount'));

    if (successUrl && successUrl.length > 0) {
      window.location = successUrl;
    } else {
      router.push({ name: 'Dashboard' });
      // TODO: Check for progressive profiling
      // progressiveProfileCheck(data, () => {
      //   router.push({ name: 'Dashboard' });
      // });
    }
  } catch (error) {
    showErrorMessage('error', i18n.global.t('loginFailure'));
  }
}

/**
 * Sets the child component based on the provided type and details.
 *
 * @param {string} type - The type of child component to set.
 * @param {Object} details - Additional details required for setting the child component.
 * @returns {Promise<void>} Resolves when the child component has been set.
 */
async function setChildComponent(type, details) {
  selfServiceDetails.value = details;

  if (type === 'parameters') {
    selfServiceType.value = null;
    showSelfService.value = false;

    await advanceSelfServiceStage(apiType, {});
    if (selfServiceDetails.value) {
      setChildComponent(selfServiceDetails.value.type, selfServiceDetails.value);
    }
  } else if (props.clientToken && !clientTokenUsed.value) {
    advanceSelfServiceStage(apiType, {
      clientToken: props.clientToken,
      oauthRegister: 'true',
    });
    clientTokenUsed.value = true;
  } else if (details.type === 'localAutoLogin') {
    if (has(details, 'additions.oauthLogin') && details.additions.oauthLogin) {
      // TODO: implement social login and progressive profiling
    } else {
      autoLogin(details.additions.credentialJwt, details.additions.successUrl);
    }
  } else {
    let stageCheck = false;

    each(components, (value, key) => {
      if (key.toLocaleLowerCase() === type.toLocaleLowerCase()) {
        stageCheck = true;
      }
    });

    selfServiceType.value = stageCheck
      ? type
      : 'GenericSelfService';
    showSelfService.value = true;
  }
}

/**
 * Extracts and returns the relevant policy error from a given error response object.
 * Typically used to identify and handle specific policy-related errors during registration.
 *
 * @param {Object} errorResponse - The error response object returned from an API call.
 * @returns {Object|undefined} The extracted policy error if found, otherwise undefined.
 */
function findPolicyError(errorResponse) {
  let errorMessage = errorResponse.data.message;
  let policyError = '';

  if (has(errorResponse, 'data.detail.failedPolicyRequirements')) {
    const policy = errorResponse.data.detail.failedPolicyRequirements[0];
    if (policy.policyRequirements.length) {
      policyError = i18n.global.t(`common.policyValidationMessages.${policy.policyRequirements[0].policyRequirement}`, policy.policyRequirements[0].params);
      errorMessage = `${i18n.global.t('common.policyValidationMessages.policyValidationFailed', { property: policy.property })}: ${policyError}`;
    }
  }
  return errorMessage;
}

/**
 * Handles API error responses during the registration process.
 *
 * @param {Object} error - The error object received from the API call.
 */
function apiErrorCallback(error) {
  const errorMessage = findPolicyError(error.response);
  showSelfService.value = true;
  showErrorMessage(null, errorMessage);
}

/**
 * Advances the registration process to the next stage.
 *
 * @param {Object} params - Parameters required to advance the stage.
 * @returns {Promise<void>} Resolves when the stage has been successfully advanced.
 */
async function advanceStage(params) {
  await advanceSelfServiceStage(apiType, params, null);
  if (selfServiceDetails.value) {
    setChildComponent(selfServiceDetails.value.type, selfServiceDetails.value);
  }
}

/**
 * Sets the initial stage of the registration process.
 * Handles query params when returning from email validation
 *
 * @returns {Promise<void>} Resolves when the initial stage is set.
 */
async function setInitialStage() {
  errorFunction.value = apiErrorCallback;
  if (queryParams) {
    selfServiceType.value = 'localAutoLogin';
    advanceStage(parseQueryParams(queryParams));
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
