<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer class="vh-100 d-flex justify-content-center align-items-center">
    <FrCenterCard v-if="selfServiceType !== null">
      <template #center-card-header>
        <h2>
          {{ $t('pages.selfservice.headers.username.title') }}
        </h2>
      </template>

      <template #center-card-body>
        <BCardBody>
          <component
            ref="selfServiceStage"
            :is="selfServiceType"
            :self-service-details="selfServiceDetails"
            @advance-stage="advanceStageEmitter"
            @load-stage="loadStageEmitter"
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
import { each, toLower } from 'lodash';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import FrCenterCard from '@forgerock/platform-shared/src/components/CenterCard';
import {
  BContainer,
  BCardBody,
  BCardFooter,
  BLink,
} from 'bootstrap-vue';
import styles from '@/scss/main.scss';
import FrCaptcha from '@/components/selfservice/common/Captcha';
import FrEmailUsername from '@/components/selfservice/forgotusername/EmailUsername';
import FrGenericSelfService from '@/components/selfservice/common/GenericSelfService';
import FrRetrieveUsername from '@/components/selfservice/forgotusername/RetrieveUsername';
import FrUserQuery from '@/components/selfservice/common/UserQuery';
import useSelfService from '@/composables/selfService';
import i18n from '@/i18n';

const {
  loadSelfServiceData,
  selfServiceDetails,
  advanceSelfServiceStage,
} = useSelfService();

const loadingColor = styles.baseColor;
const apiType = 'username';
const selfServiceType = ref(null);

const components = {
  Captcha: FrCaptcha,
  EmailUsername: FrEmailUsername,
  RetrieveUsername: FrRetrieveUsername,
  UserQuery: FrUserQuery,
  GenericSelfService: FrGenericSelfService,
};

function setChildComponent(type, details) {
  selfServiceDetails.value = details;

  each(components, (value, key) => {
    if (toLower(key) === toLower(type)) {
      selfServiceType.value = value;
    }
  });

  if (!selfServiceType.value) {
    selfServiceType.value = 'GenericSelfService';
  }
}

async function advanceStageEmitter(data) {
  await advanceSelfServiceStage(apiType, data, false);
  if (selfServiceDetails.value) {
    setChildComponent(selfServiceDetails.value.type, selfServiceDetails.value);
  } else {
    setChildComponent('retrieveUsername', { error: i18n.global.t('pages.selfservice.forgotUsername.unableToRetrieve') });
  }
}

async function loadStageEmitter() {
  await loadSelfServiceData(apiType);
  if (selfServiceDetails.value) {
    setChildComponent(selfServiceDetails.value.type, selfServiceDetails.value);
  }
}

onMounted(async () => {
  await loadStageEmitter();
});
</script>
