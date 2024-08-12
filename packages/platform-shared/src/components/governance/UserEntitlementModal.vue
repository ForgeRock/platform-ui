<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    body-class="p-0"
    content-class="border-0"
    :id="modalId"
    no-close-on-backdrop
    no-close-on-esc
    ok-only
    ok-variant="outline-primary"
    size="xl"
    :ok-title="$t('common.done')"
    :static="isTest">
    <template #modal-header="{ close }">
      <BMedia
        class="align-items-center"
        no-body>
        <BImg
          class="mr-3"
          height="36"
          width="36"
          :alt="displayName"
          :src="logo"
          fluid />
        <div class="media-body">
          <small class="mb-1 d-block">
            {{ $t('governance.entitlementDetails') }}
          </small>
          <h2
            v-if="grant"
            class="mb-0 h5">
            {{ appName }}
          </h2>
        </div>
      </BMedia>
      <BButtonClose
        variant="link"
        class="ml-auto"
        @click="close">
        <FrIcon
          name="close"
          icon-class="md-24" />
      </BButtonClose>
    </template>
    <BTabs
      class="card-tabs-vertical"
      content-class="tab-scroll"
      pills
      vertical>
      <BTab
        active
        data-testid="entitlement-details-tab"
        :title="$t('governance.entitlementDetails')">
        <div class="p-4">
          <dl class="row">
            <dt class="col-lg-4">
              {{ $t('common.application') }}
            </dt>
            <dd class="col-lg-8 mb-4">
              <BMedia
                v-if="grant.application"
                class="align-items-center"
                no-body>
                <img
                  class="mr-3 mw-100 h-auto"
                  height="36"
                  width="36"
                  :alt="appName"
                  :onerror="onImageError"
                  :src="logo">
                <BMediaBody>
                  <small class="mb-1 d-block">
                    {{ appName }}
                  </small>
                  <p class="mb-0 h5">
                    {{ getApplicationDisplayName(grant.application) }}
                  </p>
                </BMediaBody>
              </BMedia>
            </dd>
          </dl>
          <dl class="row">
            <dt class="col-lg-4">
              {{ $t('common.owner') }}
            </dt>
            <dd
              class="col-lg-8 mb-4"
              data-testid="owner">
              <BMedia
                v-if="ownerInfo"
                no-body>
                <BImg
                  fluid
                  class="mr-3 rounded-circle"
                  height="36"
                  width="36"
                  :alt="$t('common.userFullName', { givenName: ownerInfo.givenName, sn: ownerInfo.sn })"
                  :src="ownerInfo.profileImage || require('@forgerock/platform-shared/src/assets/images/avatar.png')" />
                <BMediaBody>
                  <h3 class="h5 mb-0 text-dark text-truncate">
                    {{ $t('common.userFullName', { givenName: ownerInfo.givenName, sn: ownerInfo.sn }) }}
                  </h3>
                  <small class="text-truncate">
                    {{ ownerInfo.userName }}
                  </small>
                </BMediaBody>
              </BMedia>
              <template v-else>
                {{ blankValueIndicator }}
              </template>
            </dd>
          </dl>
          <FrGlossaryDisplayForm
            data-testid="glossary"
            :glossary-schema="filteredGlossarySchema"
            :glossary-values="glossaryValues" />
          <div
            v-if="!isNil(grant.entitlement)"
            class="p-4 bg-light rounded"
            data-testid="entitlement">
            <dl
              v-for="item in Object.keys(grant.entitlement)"
              :key="item"
              class="row">
              <dt class="col-lg-4">
                {{ item }}
              </dt>
              <dd class="col-lg-8 mb-4">
                {{ !isNil(grant.entitlement[item]) ? grant.entitlement[item] : blankValueIndicator }}
              </dd>
            </dl>
          </div>
        </div>
      </BTab>
      <BTab
        v-if="showAccountTab && grant.account"
        data-testid="entitlement-account-tab"
        :title="$t('governance.accountDetails')">
        <FrContentDetailsTab :content="grant.account" />
      </BTab>
    </BTabs>
  </BModal>
</template>

<script setup>
import {
  BButtonClose,
  BImg,
  BMedia,
  BMediaBody,
  BModal,
  BTab,
  BTabs,
} from 'bootstrap-vue';
import { isNil } from 'lodash';
import { computed } from 'vue';
import { getApplicationLogo, getApplicationDisplayName } from '@forgerock/platform-shared/src/utils/appSharedUtils';
import { onImageError } from '@forgerock/platform-shared/src/utils/applicationImageResolver';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import FrContentDetailsTab from '@forgerock/platform-shared/src/views/Governance/CertificationTask/TaskList/modals/AccountModal/ContentDetailsTab';
import FrGlossaryDisplayForm from '@forgerock/platform-shared/src/components/governance/GlossaryDisplayForm';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';

const props = defineProps({
  grant: {
    type: Object,
    default: () => ({}),
  },
  glossarySchema: {
    type: Array,
    default: () => [],
  },
  isTest: {
    type: Boolean,
    default: false,
  },
  modalId: {
    type: String,
    default: 'userEntitlementModal',
  },
  showAccountTab: {
    type: Boolean,
    default: true,
  },
});

// Computed
const appName = computed(() => (props.grant?.application?.name || ''));
const logo = computed(() => {
  if (props.grant?.application) return getApplicationLogo(props.grant.application);
  return '';
});
const ownerInfo = computed(() => {
  if (!props.grant?.entitlementOwner || !props.grant.entitlementOwner[0]) return null;
  return props.grant.entitlementOwner[0];
});
const filteredGlossarySchema = computed(() => props.glossarySchema?.filter((glossaryProp) => (glossaryProp.name !== 'entitlementOwner')));
const glossaryValues = computed(() => props.grant?.glossary?.idx?.['/entitlement'] || {});
</script>

<style lang="scss" scoped>
:deep {
  .tab-scroll {
    height: calc(100vh - 230px);
    overflow: auto;
  }
}
</style>
