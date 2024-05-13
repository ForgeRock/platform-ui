<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <FrAlert
      variant="danger"
      :dismissible="false">
      <div class="d-flex justify-content-between align-items-center w-100">
        <div>
          {{ $t('governance.accessRequest.newRequest.sodViolation.violationMessage') }}
        </div>
        <BButton
          @click="showViolationModal"
          class="p-0 ml-2"
          variant="link">
          {{ $t('common.viewDetails') }}
        </BButton>
      </div>
    </FrAlert>
    <BModal
      @cancel="$emit('submit-with-violation')"
      cancel-variant="link"
      id="sod-violation-modal"
      no-close-on-backdrop
      no-close-on-esc
      ok-variant="outline-primary"
      size="lg"
      title-class="h5"
      title-tag="h2"
      :static="isTesting"
      :cancel-title="$t('governance.accessRequest.newRequest.sodViolation.submitWithViolations')"
      :ok-title="$t('common.close')"
      :title="$t('governance.accessRequest.newRequest.sodViolation.modalTitle')">
      <p>
        {{ $t('governance.accessRequest.newRequest.sodViolation.modalDescription') }}
      </p>
      <BListGroup>
        <BListGroupItem
          v-for="violation in sodError"
          :key="violation.name">
          <BMedia no-body>
            <BMediaAside>
              <FrIcon
                class="text-warning"
                name="warning" />
            </BMediaAside>
            <BMediaBody class="align-self-center text-truncate">
              <h3 class="h5 mb-0 text-truncate">
                {{ violation.name }}
              </h3>
              <small class="text-muted text-truncate">
                {{ violation.description }}
              </small>
            </BMediaBody>
          </BMedia>
        </BListGroupItem>
      </BListGroup>
    </BModal>
  </div>
</template>

<script setup>
/**
 * Alert that shows there is an SOD violation and a modal to show details of that violation
 */
import {
  BButton,
  BListGroup,
  BListGroupItem,
  BMedia,
  BMediaAside,
  BMediaBody,
  BModal,
} from 'bootstrap-vue';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import FrAlert from '@forgerock/platform-shared/src/components/Alert';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';

// composables
const { bvModal } = useBvModal();

// emits
defineEmits(['submit-with-violation']);

// props
defineProps({
  isTesting: {
    type: Boolean,
    default: false,
  },
  sodError: {
    type: Object,
    default: () => ({}),
  },
});

function showViolationModal() {
  bvModal.value.show('sod-violation-modal');
}

</script>
