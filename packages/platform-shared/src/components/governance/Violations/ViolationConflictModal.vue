<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    :id="modalId"
    title="View Violation"
    ok-only
    ok-variant="outline-primary"
    ok-title="Done"
    size="lg"
    :static="isTesting">
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
                <BImg
                  :src="getApplicationLogo(entitlement.app) || require('@forgerock/platform-shared/src/assets/images/applications/custom.svg')"
                  :alt="$t('governance.resource.assignResourceModal.appLogoAltText', { appName: entitlement.app.name })"
                  class="mr-2"
                  width="24" />
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
                <BImg
                  :src="getApplicationLogo(entitlement.app) || require('@forgerock/platform-shared/src/assets/images/applications/custom.svg')"
                  :alt="$t('governance.resource.assignResourceModal.appLogoAltText', { appName: entitlement.app.name })"
                  class="mr-2"
                  width="24" />
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
import {
  BCol,
  BImg,
  BListGroup,
  BListGroupItem,
  BMedia,
  BMediaAside,
  BMediaBody,
  BModal,
  BRow,
} from 'bootstrap-vue';
import { getApplicationLogo } from '@forgerock/platform-shared/src/utils/appSharedUtils';

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
    default: () => {},
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
      name: item.assignment.name,
      description: item.assignment.description,
      appName: item.application.name,
      app: item.application,
    };
  });
}

const setOneEntitlements = computed(() => {
  const conflicts = props?.violation?.decision?.violation?.compositeIds;
  if (!conflicts?.length) return [];

  const setOne = getEntitlementDisplayObjects(conflicts[0]);
  return setOne;
});

const setTwoEntitlements = computed(() => {
  const conflicts = props?.violation?.decision?.violation?.compositeIds;
  if (!conflicts?.length) return [];

  const setTwo = getEntitlementDisplayObjects(conflicts[1]);
  return setTwo;
});
</script>
