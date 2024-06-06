<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <VeeForm
    v-slot="{ meta: { valid } }"
    as="span">
    <BModal
      id="ExceptionModal"
      size="lg"
      title-class="h5"
      title-tag="h2"
      :static="isTesting"
      :title="componentComputed.title"
      @close="resetState"
      @hide="resetState">
      <BCard
        v-if="!hideDetails"
        class="shadow-none border-0 bg-light mb-4">
        <small class="mb-1">
          {{ $t('governance.violations.ruleViolated') }}
        </small>
        <h2 class="h5 rule-title">
          {{ violation.policyRule.name }}
        </h2>
        <p class="max-lines max-lines-3 mb-2">
          {{ violation.policyRule.description }}
        </p>
        <div
          v-if="extendException"
          class="mb-2">
          <FrIcon
            icon-class="mr-2"
            name="update">
            {{ exceptionCommonDataSet }}
          </FrIcon>
        </div>
        <BButton
          class="p-0"
          variant="link"
          @click="$emit('viewViolationDetails', violation)">
          {{ $t('common.viewDetails') }}
        </BButton>
      </BCard>

      <BFormGroup>
        <div class="mb-2">
          {{ componentComputed.title }}
        </div>
        <BFormRadioGroup v-model="timePeriod">
          <BFormRadio value="forever">
            {{ $t('common.forever') }}
          </BFormRadio>
          <BFormRadio value="specifiedDate">
            {{ $t('common.untilDate', { date: $t('common.specifiedDate') }) }}
          </BFormRadio>
        </BFormRadioGroup>
        <BCollapse :visible="timePeriod === 'specifiedDate'">
          <div class="pt-3">
            <FrDatepicker
              name="endDate"
              v-model="endDate"
              :date-format-options="{ year: 'numeric', month: 'numeric', day: 'numeric' }"
              :min="new Date()"
              :placeholder="$t('common.date')" />
          </div>
        </BCollapse>
        <BFormGroup class="mt-4">
          <FrField
            name="justificationText"
            v-model="justificationText"
            type="textarea"
            :label="$t('governance.accessRequest.newRequest.justification')"
            :rows="3"
            :validation="{ required: requireJustification }" />
        </BFormGroup>
      </BFormGroup>

      <template #modal-footer="{ cancel }">
        <div class="d-flex flex-row-reverse">
          <BButton
            variant="primary"
            :disabled="!valid"
            @click="exceptionAction">
            {{ componentComputed.okButton }}
          </BButton>
          <BButton
            variant="link"
            @click="cancel()">
            {{ $t('common.cancel') }}
          </BButton>
        </div>
      </template>
    </BModal>
  </VeeForm>
</template>

<script setup>
/**
 * Modal in which exceptions to violations may be allowed or extended.
 * @component ExceptionModal
 * @prop {Boolean} extendException - Determine if the action is extend
 * @prop {Boolean} isTesting - Determines if the component is in a test environment
 * @prop {Object} violation - Violation information
 */
import {
  BButton,
  BCard,
  BCollapse,
  BFormGroup,
  BFormRadio,
  BFormRadioGroup,
  BModal,
} from 'bootstrap-vue';
import { Form as VeeForm } from 'vee-validate';
import { isEmpty } from 'lodash';
import { computed, ref, watch } from 'vue';
import FrDatepicker from '@forgerock/platform-shared/src/components/Datepicker';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import i18n from '@/i18n';

const emit = defineEmits(['action', 'viewViolationDetails']);

const props = defineProps({
  extendException: {
    type: Boolean,
    default: false,
  },
  isTesting: {
    type: Boolean,
    default: false,
  },
  violation: {
    type: Object,
    required: true,
  },
  hideDetails: {
    type: Boolean,
    default: false,
  },
});

// gets the custom values of the modal based on where it is used from
const componentComputed = computed(() => {
  const action = props.extendException ? 'extend' : 'allow';
  const justificationCheck = props.violation?.policyRule?.violationLifecycle?.exception?.justificationCheck;
  return {
    okButton: i18n.global.t(`common.${action}`),
    justificationCheck,
    title: i18n.global.t(`governance.certificationTask.actions.${action}Exception`),
  };
});

const endDate = ref(null);
const justificationText = ref('');
const requireJustification = ref(componentComputed.value.justificationCheck);
const timePeriod = ref('forever');

// removes the end date value if the 'forever' option is selected
watch(() => timePeriod.value, (val) => {
  if (val === 'forever') {
    endDate.value = null;
    requireJustification.value = false;
  } else {
    requireJustification.value = componentComputed.value.justificationCheck;
  }
}, { immediate: true });

// parses the information of the user who made the exception
const exceptionCommonDataSet = computed(() => {
  if (!props.extendException) {
    return '';
  }
  const commentsArray = props.violation.comments;
  const filteredComments = isEmpty(commentsArray)
    ? []
    : commentsArray.filter((comment) => comment.action === 'exception');
  const lastAction = filteredComments.pop() || {};
  const comment = lastAction?.comment;
  const user = i18n.global.t('common.userFullName', { givenName: lastAction?.user?.givenName, sn: lastAction?.user?.sn });
  return i18n.global.t('governance.violations.commentBy', { comment, author: user });
});

/**
 * Action to be taken on exception (Extend or Allow)
 */
function exceptionAction() {
  // information relevant to the request
  const requestObject = {
    violationId: props.violation.id,
    phaseId: props.violation.phaseId,
    payload: {
      exceptionExpirationDate: endDate.value,
      comment: justificationText.value,
    },
  };

  // the information is emited and the modal values are reset
  emit('action', requestObject);
}

/**
 * Reset component state
 */
function resetState() {
  endDate.value = null;
  justificationText.value = '';
  timePeriod.value = 'forever';
}
</script>
