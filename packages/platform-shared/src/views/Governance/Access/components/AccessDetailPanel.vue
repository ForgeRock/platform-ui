<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <VueDraggableResizable
    class="fr-access-detail-panel h-100 position-relative"
    class-name-handle="fr-handle"
    prevent-deactivation
    :class="{ open: panelExpanded }"
    :draggable="false"
    :handles="['ml']"
    :max-width="600"
    :min-width="420"
    :w="width"
    :active="panelExpanded"
    @resizing="onResize">
    <BCard
      v-if="panelExpanded"
      class="h-100 overflow-auto"
      no-body>
      <div class="p-4">
        <BButtonClose
          :aria-label="$t('common.close')"
          id="btnCloseDetails"
          class="text-dark ml-auto"
          variant="none"
          @click="emit('close-panel')">
          <FrIcon
            icon-class="md-24 align-top"
            name="close" />
        </BButtonClose>
        <div class="pt-4">
          <h2 class="h5 mb-3">
            {{ panelTitle }}
          </h2>
          <Component
            :is="panelComponent"
            :access="access"
            :auto-id-settings="autoIdSettings"
            :user-schema="userSchema"
            @open-selected-access-modal="openAccessModal" />
        </div>
        <div class="border-top pt-4">
          <h3 class="h5 mb-4">
            {{ $t('governance.access.certificationDetails.title') }}
          </h3>
          <div
            class="d-flex flex-column mb-2"
            v-if="showCertificationDetails()">
            <BRow class="mb-4">
              <BCol lg="6">
                <small class="d-block mb-2">
                  {{ $t(`governance.access.certificationDetails.certifiedBy`) }}
                </small>
                <FrUserDetails
                  :user-object="lastCertification.decisionBy" />
              </BCol>
            </BRow>
            <BRow class="mb-4">
              <BCol lg="6">
                <small class="d-block mb-2">
                  {{ $t(`governance.access.certificationDetails.decision`) }}
                </small>
                <BBadge
                  class="px-4"
                  :variant="getDecisionVariant()">
                  {{ capitalize(lastCertification.decision) }}
                </BBadge>
              </BCol>
            </BRow>
            <BRow class="mb-4">
              <BCol lg="6">
                <small class="d-block mb-2">
                  {{ $t(`governance.access.certificationDetails.completionDate`) }}
                </small>
                {{ parseDate(lastCertification.completionDate) }}
              </BCol>
            </BRow>
          </div>
          <div
            v-else
            class="text-muted">
            <FrIcon
              name="error_outline" />
            {{ $t('governance.access.certificationDetails.noCertification') }}
          </div>
        </div>
      </div>
    </BCard>
  </VueDraggableResizable>
</template>

<script setup>

import { computed, ref } from 'vue';
import {
  BBadge,
  BButtonClose,
  BCard,
  BCol,
  BRow,
} from 'bootstrap-vue';
import VueDraggableResizable from 'vue-draggable-resizable';
import { capitalize } from 'lodash';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrUserDetails from '@forgerock/platform-shared/src/components/governance/UserDetails';
import FrAccountGrantDetails from './accessPanels/AccountGrantDetails';
import FrEntitlementGrantDetails from './accessPanels/EntitlementGrantDetails';
import FrRoleGrantDetails from './accessPanels/RoleGrantDetails';
import { parseDate } from '../utils/accessUtility';
import i18n from '@/i18n';

const emit = defineEmits([
  'close-panel',
  'open-selected-access-modal',
]);

const props = defineProps({
  access: {
    type: Object,
    default: () => ({}),
  },
  autoIdSettings: {
    type: Object,
    default: () => ({}),
  },
  userSchema: {
    type: Object,
    default: () => ({}),
  },
});

// Data
const savedWidth = ref(420);

// Computed
const lastCertification = computed(() => props.access?.item?.decision?.certification || {});
const panelExpanded = computed(() => !!props.access.item);
const itemType = computed(() => props.access?.item?.type || '');
const panelTitle = computed(() => i18n.global.t(`governance.access.panelTitle.${itemType.value}`));
const panelComponent = computed(() => {
  const componentMap = {
    accountGrant: FrAccountGrantDetails,
    entitlementGrant: FrEntitlementGrantDetails,
    roleMembership: FrRoleGrantDetails,
  };
  return componentMap[itemType.value];
});
const width = computed(() => (panelExpanded.value ? savedWidth.value : 1));

/**
 * Handler for panel resizing that updates the current
 * width of the right edit panel
 * @param {Number} width Width returned by the event
 */
function onResize(x, y, resizeWidth) {
  savedWidth.value = resizeWidth;
}

/**
 * Open modal for a given access grant to see more in depth details.
 * @param {Object} access Selected access
*/
function openAccessModal() {
  emit('open-selected-access-modal');
}

function getDecisionVariant() {
  switch (lastCertification.value.decision) {
    case 'certify':
      return 'success';
    case 'revoke':
      return 'danger';
    case 'exception':
      return 'warning';
    default:
      return 'secondary';
  }
}

/**
 * Determines if certification details can be shown
 */
function showCertificationDetails() {
  return lastCertification.value && Object.keys(lastCertification.value).length > 0;
}

</script>

<style lang="scss" scoped>
  .fr-access-detail-panel {
    background-color: $white;
    visibility: hidden;
    opacity: 0;
    left: unset !important;
    right: -1px;
    transition: all 0.1s linear;
    box-shadow: -2px 1px 5px -1px rgba(0, 0, 0, 0.1);

    &.open {
      visibility: visible;
      opacity: 1;
    }
  }
</style>
