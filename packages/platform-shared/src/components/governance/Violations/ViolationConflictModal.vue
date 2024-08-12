<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    :id="modalId"
    ok-only
    ok-variant="outline-primary"
    size="lg"
    :ok-title="$t('common.done')"
    :static="isTesting"
    :title="$t('governance.violations.viewViolation')">
    <p class="mb-4">
      {{ $t('governance.violations.conflictDescription') }}
    </p>
    <BRow>
      <BCol lg="6">
        <h5 class="mb-3">
          {{ $t('common.entitlements') }}
        </h5>
        <BListGroup>
          <BListGroupItem
            v-for="entitlement in setOneEntitlements"
            :key="`setOne-${entitlement.name}`">
            <h5 class="text-truncate">
              {{ entitlement.name }}
            </h5>
            <BMedia no-body>
              <BMediaAside>
                <img
                  :src="getApplicationLogo(entitlement.app)"
                  :alt="$t('governance.resource.assignResourceModal.appLogoAltText', { appName: entitlement.app.name })"
                  class="mr-2"
                  :onerror="onImageError"
                  width="24">
              </BMediaAside>
              <BMediaBody class="align-self-center text-truncate">
                <h5 class="mb-0 text-truncate">
                  {{ entitlement.appName }}
                </h5>
                <small class="text-muted text-truncate">
                  {{ entitlement.description }}
                </small>
              </BMediaBody>
            </BMedia>
          </BListGroupItem>
        </BListGroup>
      </BCol>
      <BCol lg="6">
        <h5 class="mb-3">
          {{ $t('governance.violations.conflictingEntitlements') }}
        </h5>
        <BListGroup>
          <BListGroupItem
            v-for="entitlement in setTwoEntitlements"
            :key="`setTwo-${entitlement.name}`">
            <h5 class="text-truncate">
              {{ entitlement.name }}
            </h5>
            <BMedia no-body>
              <BMediaAside>
                <img
                  :src="getApplicationLogo(entitlement.app)"
                  :alt="$t('governance.resource.assignResourceModal.appLogoAltText', { appName: entitlement.app.name })"
                  class="mr-2"
                  :onerror="onImageError"
                  width="24">
              </BMediaAside>
              <BMediaBody class="align-self-center text-truncate">
                <h5 class="mb-0 text-truncate">
                  {{ entitlement.appName }}
                </h5>
                <small class="text-muted text-truncate">
                  {{ entitlement.description }}
                </small>
              </BMediaBody>
            </BMedia>
          </BListGroupItem>
        </BListGroup>
      </BCol>
    </BRow>
  </BModal>
</template>

<script setup>
/**
 * Read only view of the conflicting entitlements for a violation
 */
import { computed } from 'vue';
import { get } from 'lodash';
import {
  BCol,
  BListGroup,
  BListGroupItem,
  BMedia,
  BMediaAside,
  BMediaBody,
  BModal,
  BRow,
} from 'bootstrap-vue';
import { getApplicationLogo } from '@forgerock/platform-shared/src/utils/appSharedUtils';
import { onImageError } from '@forgerock/platform-shared/src/utils/applicationImageResolver';

const props = defineProps({
  isTesting: {
    type: Boolean,
    default: false,
  },
  modalId: {
    type: String,
    default: 'violation-conflicts-modal',
  },
  violation: {
    type: Object,
    default: () => ({}),
  },
});

/**
 * Get objects used to display the entitlements based on ids
 * @param {String[]} compositeIds ids of entitlements
 */
function getEntitlementDisplayObjects(compositeIds) {
  return compositeIds.map((id) => {
    const item = props.violation.violatingAccess.find((violation) => (violation.compositeId === id));
    return {
      name: get(item, 'descriptor.idx./entitlement.displayName') || get(item, 'entitlement.displayName') || '',
      description: get(item, 'glossary.idx./entitlement.description') || get(item, 'entitlement.description') || '',
      appName: item.application.name,
      app: item.application,
    };
  });
}

const setOneEntitlements = computed(() => {
  const conflicts = props?.violation?.decision?.compositeIds;
  if (!conflicts?.length) return [];

  const setOne = getEntitlementDisplayObjects(conflicts[0]);
  return setOne;
});

const setTwoEntitlements = computed(() => {
  const conflicts = props?.violation?.decision?.compositeIds;
  if (!conflicts?.length) return [];

  const setTwo = getEntitlementDisplayObjects(conflicts[1]);
  return setTwo;
});
</script>
