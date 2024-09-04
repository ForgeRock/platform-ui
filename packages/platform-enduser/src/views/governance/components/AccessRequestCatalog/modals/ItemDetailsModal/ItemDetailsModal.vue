<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    id="accessRequestItemModal"
    size="lg"
    cancel-variant="link"
    :visible="isTesting"
    :static="isTesting"
    no-close-on-backdrop
    no-close-on-esc
    @shown="initializeModal()"
    @hidden="resetModal()"
    @ok="$emit('toggle-item', item, requestData)">
    <!-- Modal Header -->
    <template #modal-header="{ close }">
      <BMedia
        class="align-items-center"
        no-body>
        <div>
          <BImg
            v-if="!modalProps.isRole"
            height="36"
            width="36"
            class="mr-4"
            :alt="item.appType || $t('governance.accessRequest.newRequest.role')"
            :src="item.icon"
            fluid />
          <div
            v-else
            class="rounded-circle bg-lightblue color-blue d-flex align-items-center justify-content-center mr-4"
            style="width: 36px; height: 36px;">
            <FrIcon name="assignment_ind" />
          </div>
        </div>
        <BMediaBody>
          <small
            class="text-muted"
            data-testid="modal-title">
            {{ modalProps.modalTitle }}
          </small>
          <h2
            class="m-0 h5 modal-title"
            data-testid="item-name">
            {{ item.name }}
          </h2>
        </BMediaBody>
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

    <FrItemDetailsStep
      v-if="currentStep === 0"
      :glossary-schema="glossarySchema"
      :item="item" />

    <FrItemFormStep
      v-if="currentStep === 1"
      :form-definition="form"
      @is-valid="isValidForm = $event"
      @input="setRequestData" />

    <!-- Modal Footer -->
    <template #modal-footer="{ ok, cancel }">
      <div
        class="d-flex w-100"
        :class="modalProps.footerClass">
        <BButton
          :disabled="currentStep === 1 && !isValidForm"
          :variant="modalProps.okVariant"
          @click="changeStep(ok, 1)">
          <FrIcon
            :icon-class="modalProps.isRequested ? 'mr-2' : ''"
            :name="modalProps.isRequested ? 'remove' : ''">
            {{ modalProps.okTitle }}
          </FrIcon>
        </BButton>
        <BButton
          :variant="modalProps.cancelVariant"
          @click="cancel()">
          {{ modalProps.cancelTitle }}
        </BButton>
      </div>
    </template>
  </BModal>
</template>

<script setup>
/**
 * Modal component to show glossary atributes of access request catalog items
 */
import {
  capitalize,
  isEmpty,
} from 'lodash';
import {
  BButton,
  BButtonClose,
  BImg,
  BMedia,
  BMediaBody,
  BModal,
} from 'bootstrap-vue';
import {
  computed,
  onMounted,
  ref,
} from 'vue';
import { getApplicationRequestForm } from '@forgerock/platform-shared/src/utils/governance/requestFormAssignments';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrItemDetailsStep from './ItemDetailsStep';
import FrItemFormStep from './ItemFormStep';
import i18n from '@/i18n';

const props = defineProps({
  glossarySchema: {
    type: Array,
    default: () => [],
  },
  item: {
    type: Object,
    default: () => ({}),
  },
  itemType: {
    type: String,
    default: '',
  },
  isTesting: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['toggle-item', 'modal-closed']);

// Data
const currentStep = ref(0);
const isValidForm = ref(false);
const form = ref({});
const requestData = ref({});

// Computed
const modalProps = computed(() => {
  const type = capitalize(props.itemType);
  const isRequested = props.item.requested;
  const okTitle = isRequested
    ? i18n.global.t('governance.accessRequest.newRequest.removeFromRequest')
    : i18n.global.t('governance.accessRequest.newRequest.addToRequest');
  const okVariant = isRequested ? 'outline-danger' : 'primary';
  const cancelVariant = isRequested ? 'outline-primary' : 'link';
  const cancelTitle = isRequested ? i18n.global.t('common.done') : i18n.global.t('common.cancel');
  const footerClass = isRequested ? 'justify-content-between' : 'flex-row-reverse';
  return {
    cancelTitle,
    cancelVariant,
    footerClass,
    isRequested,
    isRole: props.itemType === 'role',
    modalTitle: i18n.global.t('governance.accessRequest.newRequest.requestTypeAccess', { type }),
    okTitle,
    okVariant,
  };
});

/**
 * Resets the modal to its initial state.
 */
function resetModal() {
  currentStep.value = 0;
  form.value = {};
  requestData.value = {};
}

/**
 * Sets the request data.
 *
 * @param {Object} data - The data to set for the request.
 */
function setRequestData(data) {
  requestData.value = data;
}

/**
 * Retrieves the form for the specified item and item type.
 *
 * @param {Object} item - The item object.
 * @param {string} itemType - The type of the item (application, role, entitlement).
 */
async function getForm(item, itemType) {
  // forms can only be displayed for applications
  if (itemType !== 'application') {
    return;
  }
  const formDefinition = await getApplicationRequestForm(item, item.applicationId);
  form.value = formDefinition;
}

/**
 * Advances the modal to the next step.
 *
 * @param {Function} okFunction - The function to be called when the step is changed successfully.
 * @param {any} value - The value to be added to the current step.
 */
function changeStep(okFunction, value) {
  if (isEmpty(form.value) || isEmpty(form.value.form) || currentStep.value === 1 || modalProps.value.isRequested) {
    okFunction();
    return;
  }
  currentStep.value += value;
}

/**
 * Initializes the modal for displaying item details.
 */
function initializeModal() {
  form.value = {};
  if (isEmpty(props.item)) return;
  getForm(props.item, props.itemType);
}

onMounted(() => {
  initializeModal();
});

</script>
