<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    id="revoke-request-modal"
    size="lg"
    title-class="h5"
    title-tag="h2"
    :static="isTesting"
    :title="$t('governance.directReports.revokeRequest')"
    @hidden="$emit('hidden')">
    <!-- Justification textarea -->
    <BFormGroup>
      <FrField
        v-model="justificationText"
        data-testid="justification-field"
        type="textarea"
        :label="$t('governance.directReports.justification')"
        :description="$t('governance.directReports.revokeJustification')"
        :max-rows="10"
        :rows="5" />
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
          #[slotName]="{ option }">
          <span
            :key="index"
            class="d-flex align-items-center">
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
    <!-- Expiration Datepicker -->
    <BFormGroup>
      <div class="mb-2 text-muted">
        {{ $t('governance.accessRequest.newRequest.applyExpirationDate') }}
      </div>
      <FrDatepicker
        v-model="expirationDate"
        :date-format-options="{ year: 'numeric', month: 'numeric', day: 'numeric' }"
        :placeholder="$t('governance.accessRequest.newRequest.expiryDate')" />
    </BFormGroup>
    <template #modal-footer="{ cancel }">
      <div class="w-100 d-flex justify-content-end">
        <BButton
          variant="link"
          :aria-label="$t('common.cancel')"
          @click="cancel()">
          {{ $t('common.cancel') }}
        </BButton>
        <FrButtonWithSpinner
          data-testid="revoke-request-submit-button"
          variant="primary"
          :button-text="$t('governance.directReports.submitRequest')"
          :spinner-text="$t('common.submitting')"
          :show-spinner="showSpinner"
          @click="submission" />
      </div>
    </template>
  </BModal>
</template>

<script>
import {
  BButton,
  BFormGroup,
  BImg,
  BModal,
} from 'bootstrap-vue';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner/';
import FrDatepicker from '@forgerock/platform-shared/src/components/Datepicker';
import FrField from '@forgerock/platform-shared/src/components/Field';
import getPriorityImageSrc from '@/components/utils/governance/AccessRequestUtils';

/**
 * Provides the ability to revoke grants for direct reports.
 */
export default {
  name: 'RevokeRequestModal',
  components: {
    BButton,
    BFormGroup,
    BImg,
    BModal,
    FrButtonWithSpinner,
    FrDatepicker,
    FrField,
  },
  props: {
    isTesting: {
      type: Boolean,
      default: false,
    },
    showSpinner: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      expirationDate: '',
      justificationText: '',
      priorityOptions: [
        {
          imgSrc: getPriorityImageSrc('low'),
          text: this.$t('governance.accessRequest.newRequest.priority.low'),
          value: 'low',
        },
        {
          imgSrc: getPriorityImageSrc('medium'),
          text: this.$t('governance.accessRequest.newRequest.priority.med'),
          value: 'medium',
        },
        {
          imgSrc: getPriorityImageSrc('high'),
          text: this.$t('governance.accessRequest.newRequest.priority.high'),
          value: 'high',
        },
      ],
      selectedPriority: 'low',
    };
  },
  methods: {
    submission() {
      const payload = { priority: this.selectedPriority };
      if (this.expirationDate) {
        payload.expiryDate = this.expirationDate;
      }
      if (this.justificationText) {
        payload.justification = this.justificationText;
      }
      this.$emit('submission', payload);
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep .multiselect .multiselect__option--selected:after {
  content: 'check';
  font-family: 'Material Icons Outlined', Serif;
  font-size: 15px;
  color: $green !important;
  padding-top: 0.25rem;
  background: initial;
  padding-left: 10px;
}
</style>
