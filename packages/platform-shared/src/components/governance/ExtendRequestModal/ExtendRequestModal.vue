<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <VeeForm
    v-slot="{ meta: { valid } }"
    as="span">
    <BModal
      id="ExtendRequestModal"
      no-close-on-backdrop
      size="lg"
      title-class="h5"
      title-tag="h2"
      :static="isTesting"
      :title="$t('governance.accessRequest.extendRequest.modalTitle')"
      @hidden="resetModal">
      <BFormGroup>
        <FrField
          class="mr-1"
          v-model="newEndDate"
          data-testid="test-newEndDate"
          name="newEndDate"
          type="datetime"
          :placeholder="$t('governance.accessRequest.extendRequest.GrantEndDate')"
          :adjust-for-timezone="false"
          :show-seconds="false"
          :min-date="minEndDate"
          :validation="minDateValidationParams" />
      </BFormGroup>
      <BFormGroup>
        <FrField
          name="justificationText"
          v-model="justificationText"
          data-testid="test-justificationText"
          class="mt-2"
          type="textarea"
          :label="$t('governance.accessRequest.newRequest.justification')"
          :description="$t('governance.requestModal.detailsTab.changeResumeDateJustification')"
          :max-rows="10"
          :rows="5"
          :validation="{ required: true }" />
      </BFormGroup>
      <!-- Priority dropdown select -->
      <BFormGroup>
        <div class="mb-2 text-muted">
          {{ $t('common.priority') }}
        </div>
        <FrField
          v-model="selectedPriority"
          data-testid="priority-field"
          name="Priority"
          type="select"
          :options="priorityOptions"
          :preselect-first="true"
          :searchable="false">
          <template
            v-for="(slotName, index) in ['option', 'singleLabel']"
            :key="index"
            #[slotName]="{ option }">
            <span class="d-flex align-items-center">
              <BImg
                class="mr-2"
                width="24"
                :alt="option.text"
                :src="option.imgSrc" />
              {{ option.text }}
            </span>
          </template>
        </FrField>
      </BFormGroup>
      <template #modal-footer="{ cancel }">
        <BButton
          variant="link"
          @click="cancel">
          {{ $t('common.cancel') }}
        </BButton>
        <FrButtonWithSpinner
          variant="primary"
          :disabled="isLoading || !newEndDate || !valid"
          :show-spinner="isLoading"
          :button-text="$t('governance.request.submitRequest')"
          @click="createExtendRequest" />
      </template>
    </BModal>
  </VeeForm>
</template>

<script setup>

/**
 * @description Dialog used for extending an access grant's end date.
 *
 * @param {Boolean} loading - is true when the parent component is performing an endpoint call
 * @param {Object} currentItem - The current grant item selected in the table row
 */
import {
  computed,
  defineProps,
  ref,
  watch,
} from 'vue';
import {
  BButton,
  BModal,
  BFormGroup,
  BImg,
} from 'bootstrap-vue';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner/';
import FrField from '@forgerock/platform-shared/src/components/Field';
import dayjs from 'dayjs';
import { Form as VeeForm } from 'vee-validate';
import { getPriorityImageSrc, requestTypes } from '@forgerock/platform-shared/src/utils/governance/AccessRequestUtils';
import { submitCustomRequest } from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import { displayNotification, showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import i18n from '@/i18n';

const { bvModal } = useBvModal();

const prop = defineProps({
  currentItem: {
    type: Object,
    required: true,
  },
  isTesting: {
    type: Boolean,
    default: false,
  },
});

const isLoading = ref(false);
const newEndDate = ref(null);
const justificationText = ref('');
const selectedPriority = ref('low');
const minEndDate = computed(() => new Date().toISOString());
const minDateValidationParams = computed(() => ({ is_after_date: { date: new Date().setDate(new Date().getDate() - 1), message: i18n.global.t('governance.accessRequest.extendRequest.mindateValidation') } }));
const priorityOptions = [
  {
    imgSrc: getPriorityImageSrc('low'),
    text: i18n.global.t('governance.request.priority.low'),
    value: 'low',
  },
  {
    imgSrc: getPriorityImageSrc('medium'),
    text: i18n.global.t('governance.request.priority.med'),
    value: 'medium',
  },
  {
    imgSrc: getPriorityImageSrc('high'),
    text: i18n.global.t('governance.request.priority.high'),
    value: 'high',
  },
];

watch(() => prop.currentItem, (value) => {
  if (value && value.item) {
    newEndDate.value = value.item?.decision?.accessRequest?.grantEndDate;
  }
}, { immediate: true });

function resetModal() {
  newEndDate.value = null;
  justificationText.value = '';
  selectedPriority.value = 'low';
}

const grantIdMapper = {
  roleMembership: 'role',
  accountGrant: 'application',
  entitlementGrant: 'assignment',
};

/**
  * Returns the id from the grant doc based on the grant type
  * @currentItem {Object} current grant item row in the table
  * @grantType {String} grant type [roleMembership, accountGrant, entitlementGrant]
  */
function getGrantId(currentItem, grantType) {
  return {
    roleMembership: currentItem?.role?.id,
    entitlementGrant: currentItem?.keys?.entitlementId?.replaceAll('/', '_'),
    accountGrant: currentItem?.application?.id,
  }[grantType];
}

/**
* Make the payload and send request to create extend request endpoint
* @payload {Object} captures user input from extend request modal
*/
async function createExtendRequest() {
  const formValues = {
    endDate: dayjs(newEndDate.value).local().format(),
    justification: justificationText.value,
    priority: selectedPriority.value,
  };
  isLoading.value = true;
  const grantType = prop.currentItem.item.type;
  const requestPayload = {
    common: {
      ...formValues,
      grantId: getGrantId(prop.currentItem, grantType),
      grantIdType: grantIdMapper[grantType],
      grantType,
      userId: prop.currentItem.user.id,
    },
  };
  try {
    await submitCustomRequest(requestTypes.EXTEND_END_DATE.value, requestPayload);
    displayNotification('success', i18n.global.t('governance.request.requestSuccess'));
    bvModal.value.hide('ExtendRequestModal');
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.request.requestError'));
  } finally {
    isLoading.value = false;
  }
}
</script>
