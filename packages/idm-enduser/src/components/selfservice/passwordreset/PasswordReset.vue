<!-- Copyright (c) 2020-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer class="vh-100 d-flex justify-content-center align-items-center">
    <FrCenterCard
      v-if="selfServiceType !== null"
      show-logo>
      <template #center-card-header>
        <h1 class="h2">
          {{ $t(`pages.selfservice.headers.reset.title`) }}
        </h1>
      </template>

      <template #center-card-body>
        <BCardBody>
          <component
            :is="selfServiceType"
            :self-service-details="selfServiceDetails"
            @advance-stage="advanceStageEmitter"
            :api-type="apiType" />
        </BCardBody>
      </template>

      <template #center-card-footer>
        <BCardFooter>
          <BLink :to="{ name: 'Login' }">
            {{ $t("pages.selfservice.signIn") }}
          </BLink>
        </BCardFooter>
      </template>
    </FrCenterCard>
    <FrSpinner
      v-else
      :color="loadingColor" />
  </BContainer>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { each, toLower, last } from 'lodash';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import FrCenterCard from '@forgerock/platform-shared/src/components/CenterCard';
import { BContainer, BLink } from 'bootstrap-vue';
import styles from '@/scss/main.scss';
import FrCaptcha from '@/components/selfservice/common/Captcha';
import FrEmailValidation from '@/components/selfservice/common/EmailValidation';
import FrKbaVerification from '@/components/selfservice/passwordreset/KbaVerification';
import FrGenericSelfService from '@/components/selfservice/common/GenericSelfService';
import FrResetStage from '@/components/selfservice/passwordreset/ResetStage';
import FrUserQuery from '@/components/selfservice/common/UserQuery';
import useSelfService from '@/composables/selfService';
import i18n from '@/i18n';
/**
 * @description Selfservice controlling component for recovering a lost password. Makes use of selfservice-reset.json config file.
 */

const route = useRoute();

const selfServiceType = ref(null);
const loadingColor = ref(styles.baseColor);
const apiType = 'reset';
const {
  loadSelfServiceData,
  selfServiceDetails,
  advanceSelfServiceStage,
} = useSelfService();

const components = {
  Captcha: FrCaptcha,
  EmailValidation: FrEmailValidation,
  UserQuery: FrUserQuery,
  ResetStage: FrResetStage,
  kbaSecurityAnswerVerificationStage: FrKbaVerification,
  GenericSelfService: FrGenericSelfService,
};

/**
 * Sets the child component to be rendered based on the type passed in
 * @param type string
 * @param details object
 */
function setChildComponent(type, details) {
  selfServiceDetails.value = details;
  if (type === 'parameters') {
    // eslint-disable-next-line no-use-before-define
    advanceStageEmitter({});
  } else {
    each(components, (value, key) => {
      if (toLower(key) === toLower(type)) {
        selfServiceType.value = value;
      }
    });

    if (!selfServiceType.value) {
      selfServiceType.value = 'GenericSelfService';
    }
  }
}

/**
 * Parses query params from URL
 * @param queryParams string
 */

function parseQueryParams(queryParams) {
  if (queryParams.includes('returnParams')) {
    return { returnParams: last(decodeURIComponent(queryParams).split('returnParams=')) };
  }
  const params = new URLSearchParams(queryParams);
  const result = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

/**
 * Loads the advance stage event and sets child component
 * @param data object
 */
async function advanceStageEmitter(data) {
  await advanceSelfServiceStage(apiType, data, false, setChildComponent);

  if (selfServiceDetails.value && !selfServiceDetails.value.error) {
    setChildComponent(selfServiceDetails.value.type, selfServiceDetails.value);
  } else {
    setChildComponent('ResetStage', { error: selfServiceDetails?.value?.error || i18n.global.t('pages.selfservice.passwordReset.errorMessage') });
  }
}

/**
 * Loads the initial stage of the self service journey
 */
async function loadStageEmitter() {
  await loadSelfServiceData(apiType, setChildComponent);
  if (selfServiceDetails.value) {
    setChildComponent(selfServiceDetails.value.type, selfServiceDetails.value);
  }
}

onMounted(() => {
  if (route.params.queryParams) {
    const queryParams = parseQueryParams(route.params.queryParams);
    advanceStageEmitter(queryParams);
  } else {
    loadStageEmitter();
  }
});
</script>
