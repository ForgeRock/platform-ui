<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <FrCenterCard v-if="showForm">
      <template #center-card-header>
        <h2>
          {{ displayName }}
        </h2>
      </template>

      <template #center-card-body>
        <BCardBody>
          <p class="text-center mb-4">
            {{ purpose }}
          </p>
          <component
            :is="components[selfServiceType]"
            :self-service-details="selfServiceDetails"
            @advanceStage="advanceStage"
            :api-type="apiType" />
        </BCardBody>
      </template>

      <template #center-card-footer>
        <BCardFooter v-if="selfServiceDetails !== null && selfServiceDetails.canSkip">
          <BLink
            href="#"
            @click.prevent="advanceStage({})">
            {{ $t('pages.selfservice.progressiveProfile.skipThis') }}
          </BLink>
        </BCardFooter>
      </template>
    </FrCenterCard>

    <BContainer
      fluid
      class="h-100 px-0"
      v-else>
      <div class="h-100 d-flex">
        <FrCenterCard :logo-enabled="false">
          <template #center-card-body>
            <FrSpinner
              class="mb-4" />
          </template>
        </FrCenterCard>
      </div>
    </BContainer>
  </div>
</template>

<script setup>
/**
 * @description Selfservice controlling component for resource progressive profiling. Makes use of selfservice-profile.json config file.
 * @fires POST authentication?_action=login - Since progressive profiling creates a partial session, once it is complete we call login again with the
 * original JWT to continue the authentication session
 */
import { ref, onMounted } from 'vue';
import {
  BContainer,
  BCardBody,
  BCardFooter,
  BLink,
} from 'bootstrap-vue';
import { useRoute, useRouter } from 'vue-router';
import { has, isEmpty, filter } from 'lodash';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import FrCenterCard from '@forgerock/platform-shared/src/components/CenterCard';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import FrConditionalUser from '@/components/selfservice/progressiveprofile/ConditionalUser';
import useSelfService from '@/composables/selfService';
import { useAuth } from '@/composables/useAuth';
import { login } from '@/api/AuthenticationApi';

// composables
const route = useRoute();
const router = useRouter();
const {
  advanceSelfServiceStage,
  errorFunction,
  loadSelfServiceData,
  selfServiceDetails,
} = useSelfService();
const { loadIdmEnduserInfo } = useAuth();

// data
const components = {
  conditionaluser: FrConditionalUser,
};
const profileProcess = route.params?.profileProcess || null;
const apiType = ref(profileProcess);
const displayName = ref(null);
const purpose = ref(null);
const selfServiceType = ref(null);
const showForm = ref(false);

/**
 * Sets the user at the end of the progressive profile process.
 * @returns {Promise<void>} Resolves when the user data has been set.
 */
async function setUser() {
  try {
    const { data } = await login('anonymous', 'anonymous', true);
    await loadIdmEnduserInfo(data);
    router.push({ name: 'Dashboard' });
  } catch (error) {
    showErrorMessage(error, '');
  }
}

/**
 * Sets the child component based on the provided type and details.
 * @param {string} type - The type of the child component to set.
 * @param {Object} details - Additional details required to configure the child component.
 * @returns {Promise<void>} Resolves when the child component has been set.
 */
async function setChildComponent(type, details) {
  selfServiceType.value = type;

  if (isEmpty(details.requirements) && details.tag === 'initial') {
    advanceSelfServiceStage({});
  } else if (has(details, 'requirements.uiConfig')) {
    showForm.value = true;
    displayName.value = details.requirements.uiConfig.displayName;
    purpose.value = details.requirements.uiConfig.purpose;
    // Can skip the stage by default
    selfServiceDetails.value.canSkip = true;
    // If there are any kba questions, terms and conditions,
    // or required attributes the stage cannot be skipped
    if (
      has(details, 'requirements.properties.kba')
      || has(details, 'requirements.terms')
      || (
        has(details.requirements, 'attributes')
          && filter(details.requirements.attributes, { isRequired: true }).length >= 1
      )
    ) {
      selfServiceDetails.value.canSkip = false;
    }
  } else if (details.tag === 'end' && details.status.success) {
    showForm.value = false;
    await setUser();
  }
}

/**
 * Advances the progressive profile to the next stage.
 *
 * @param {Object} params - Parameters required to advance the stage.
 * @returns {Promise<void>} Resolves when the stage has been advanced.
 */
async function advanceStage(params) {
  await advanceSelfServiceStage(apiType.value, params, null);
  if (selfServiceDetails.value) {
    setChildComponent(selfServiceDetails.value.type, selfServiceDetails.value);
  }
}

/**
 * Initializes the progressive profile by setting the initial stage.
 * @returns {Promise<void>} Resolves when the initial stage has been set.
 */
async function setInitialStage() {
  // eslint-disable-next-line no-use-before-define
  errorFunction.value = apiErrorCallback;
  await loadSelfServiceData(apiType.value);
  if (selfServiceDetails.value) {
    setChildComponent(selfServiceDetails.value.type, selfServiceDetails.value);
  }
}

/**
 * Handles API error responses for the progressive profile component.
 * @param {Object} error - The error object returned from the API call.
 */
function apiErrorCallback(error) {
  showErrorMessage(error, '');
  setInitialStage();
}

onMounted(() => {
  setInitialStage();
});

</script>
