<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    :id="modalId"
    body-class="p-0"
    no-body
    no-close-on-backdrop
    no-close-on-esc
    ok-only
    ok-variant="outline-primary"
    size="xl"
    :ok-title="$t('common.done')"
    :static="isTesting">
    <template #modal-header="{ close }">
      <BMedia
        class="align-items-center"
        data-testid="role-modal-header"
        no-body>
        <div class="media-body">
          <small class="mb-1">
            {{ $t('governance.certificationTask.roleDetails') }}
          </small>
          <h5 class="mb-0">
            {{ role.name }}
          </h5>
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
      pills
      vertical>
      <BTab
        class="p-4"
        :title="$t('common.details')">
        <BRow>
          <dt class="col-lg-4">
            {{ $t('common.description') }}
          </dt>
          <dd
            class="col-lg-8 mb-4"
            data-testid="role-description">
            {{ role.description || blankValueIndicator }}
          </dd>
          <dt class="col-lg-4 mb-4">
            {{ $t('common.roleOwner') }}
          </dt>
          <dd class="col-lg-8 mb-4">
            <BMedia
              v-if="roleOwner"
              class="align-items-center"
              data-testid="role-owner"
              no-body>
              <BImg
                class="mr-3 rounded-circle"
                height="36"
                width="36"
                :alt="roleOwner.userName"
                :src="roleOwner.profileImage || require('@forgerock/platform-shared/src/assets/images/avatar.png')"
                fluid />
              <BMediaBody>
                <h2 class="h5 m-0">
                  {{ $t('common.userFullName', { givenName: roleOwner.givenName, sn: roleOwner.sn }) }}
                </h2>
                <small class="text-muted">
                  {{ roleOwner.userName }}
                </small>
              </BMediaBody>
            </BMedia>
            <template v-else>
              {{ blankValueIndicator }}
            </template>
          </dd>
        </BRow>
        <FrGlossaryDisplayForm
          data-testid="role-glossary"
          :glossary-schema="filteredGlossarySchema"
          :glossary-values="glossaryValues" />
      </BTab>
      <BTab
        :title="$t('common.applications')">
        <FrApplicationsTab
          :applications="roleApplications" />
      </BTab>
    </BTabs>
  </BModal>
</template>

<script setup>
import {
  BButtonClose, BImg, BModal, BMedia, BMediaBody, BTab, BTabs, BRow,
} from 'bootstrap-vue';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import FrGlossaryDisplayForm from '@forgerock/platform-shared/src/components/governance/GlossaryDisplayForm';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import { computed } from 'vue';
import FrApplicationsTab from './ApplicationTab/ApplicationTab';

const props = defineProps({
  glossarySchema: {
    type: Array,
    default: () => [],
  },
  isTesting: {
    type: Boolean,
    default: false,
  },
  modalId: {
    type: String,
    default: 'role-modal',
  },
  role: {
    type: Object,
    default: () => ({}),
  },
});

const filteredGlossarySchema = computed(() => props?.glossarySchema?.filter((glossaryProp) => (glossaryProp.name !== 'roleOwner')));
const glossaryValues = computed(() => props?.role?.glossary?.idx?.['/role'] || {});
const roleOwner = computed(() => props?.role?.roleOwner?.[0] || null);
const roleApplications = computed(() => props?.role?.applications || []);

</script>
