<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <VeeForm
    v-slot="{ meta: { valid } }"
    as="span">
    <!-- Requesting for list of users -->
    <div class="mb-5">
      <h3 class="mb-2 text-muted font-weight-normal h5">
        {{ $t('governance.accessRequest.newRequest.requestingFor') }}
      </h3>
      <div class="mb-3">
        <FrRequestItemsGroup
          :group-name="$t('governance.accessRequest.newRequest.requestingFor')"
          :fr-hover="true"
          :request-items="requestCartUsers"
          :show-empty-state="false"
          v-on="$listeners" />
      </div>
    </div>
    <!-- List of access request items (Applicattions, Entitlements, Roles) -->
    <div class="mb-5">
      <h3 class="mb-2 text-muted font-weight-normal h5">
        {{ $t('governance.accessRequest.newRequest.requestedAccess') }}
      </h3>
      <FrRequestItemsGroup
        context="accessItem"
        data-testid="request-items-container"
        :group-name="$t('governance.accessRequest.newRequest.requestedAccess')"
        :request-items="requestCartItems"
        v-on="$listeners" />
    </div>
    <!-- Justification textarea -->
    <BFormGroup>
      <FrField
        name="justificationText"
        v-model="justificationText"
        type="textarea"
        :label="$t('governance.accessRequest.newRequest.justification')"
        :description="$t('governance.accessRequest.newRequest.justificationDescription')"
        :max-rows="10"
        :rows="5"
        :validation="{ required: requireRequestJustification }" />
    </BFormGroup>
    <!-- Priority dropdown select -->
    <BFormGroup>
      <div class="mb-2 text-muted">
        {{ $t('common.priority') }}
      </div>
      <FrField
        v-model="selectedPriority"
        type="select"
        :aria-label="$t('common.priority')"
        name="Priority"
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
              alt=""
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
        name="expirationDate"
        v-model="expirationDate"
        :date-format-options="{ year: 'numeric', month: 'numeric', day: 'numeric' }"
        :min="minExpirationDate"
        :placeholder="$t('governance.accessRequest.newRequest.expiryDate')" />
    </BFormGroup>
    <!-- Submit new request button -->
    <div class="mb-5">
      <FrButtonWithSpinner
        class="w-100 d-flex justify-content-center"
        data-testid="submit-request-button"
        variant="primary"
        :button-text="$t('governance.accessRequest.newRequest.completeRequest')"
        :disabled="!requestCartItems.length || showSpinner || !valid"
        :spinner-text="$t('governance.status.completing')"
        :show-spinner="showSpinner"
        @click="submitRequest" />
    </div>
  </VeeForm>
</template>

<script>
import {
  BImg,
  BFormGroup,
} from 'bootstrap-vue';
import { Form as VeeForm } from 'vee-validate';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner';
import FrDatepicker from '@forgerock/platform-shared/src/components/Datepicker';
import FrField from '@forgerock/platform-shared/src/components/Field';
import { getPriorityImageSrc } from '@forgerock/platform-shared/src/utils/governance/AccessRequestUtils';
import FrRequestItemsGroup from './RequestItemsGroup';

/**
 * A form that displays fields for requesting access to applications, entitlements and roles for one or multiple users
 */
export default {
  name: 'RequestCart',
  components: {
    BFormGroup,
    BImg,
    FrButtonWithSpinner,
    FrDatepicker,
    FrField,
    FrRequestItemsGroup,
    VeeForm,
  },
  props: {
    requestCartUsers: {
      type: Array,
      required: true,
    },
    requestCartItems: {
      type: Array,
      default: () => [],
    },
    requireRequestJustification: {
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
  computed: {
    minExpirationDate() {
      return new Date();
    },
  },
  methods: {
    /**
     * Emits the new request payload
     */
    submitRequest() {
      const payload = {
        priority: this.selectedPriority,
        accessModifier: 'add',
      };
      if (this.expirationDate) {
        payload.expiryDate = this.expirationDate;
      }
      if (this.justificationText) {
        payload.justification = this.justificationText;
      }
      this.$emit('submit-new-request', payload);
    },
  },
};
</script>

<style lang="scss" scoped>
:deep(.multiselect .multiselect__option--selected:after) {
  content: 'check';
  font-family: 'Material Icons Outlined', Serif;
  font-size: 15px;
  color: $green !important;
  padding-top: 0.25rem;
  background: initial;
  padding-left: 10px;
}
</style>
