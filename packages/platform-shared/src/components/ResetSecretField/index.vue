<!-- Copyright (c) 2021-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <FrField
      v-model="placeHolderSecretField"
      disabled
      :description="description"
      :is-html="isHtml"
      :label="effectiveLabel">
      <template #append>
        <BInputGroupAppend>
          <BButton v-b-modal.resetSecretModal>
            {{ $t('common.reset') }}
          </BButton>
        </BInputGroupAppend>
      </template>
    </FrField>

    <VeeForm
      ref="observer"
      v-slot="{ meta: { valid } }"
      as="span">
      <BModal
        size="lg"
        id="resetSecretModal"
        ref="resetSecretModal"
        :title="$t('schemaResetSecret.title', { field: effectiveLabel })"
        cancel-variant="link"
        @hidden="newSecret = ''"
        @ok="resetSecret"
        :ok-disabled="!valid"
        :ok-title="$t('common.save')"
        :cancel-title="$t('common.cancel')">
        <p>{{ $t('schemaResetSecret.modalBody', { field: effectiveLabel.toLowerCase() }) }}</p>
        <BFormGroup>
          <FrField
            v-model="newSecret"
            type="password"
            validation="required"
            :label="$t('schemaResetSecret.newSecretText', { field: effectiveLabel })" />
        </BFormGroup>
        <FrAlert
          show
          variant="warning"
          :dismissible="false">
          <span>{{ $t('schemaResetSecret.secretResetWarning', { field: effectiveLabel.toLowerCase() }) }}</span>
        </FrAlert>
      </BModal>
    </VeeForm>
  </div>
</template>

<script>
import {
  BButton,
  BFormGroup,
  BInputGroupAppend,
  BModal,
  VBModal,
} from 'bootstrap-vue';
import FrAlert from '@forgerock/platform-shared/src/components/Alert';
import FrField from '@forgerock/platform-shared/src/components/Field';
import { Form as VeeForm } from 'vee-validate';

/**
 * Input that allows resetting of a secret field. Main input is disabled and dots are shown as a value.
 * Click append button to open a modal which allows user to input the new value for a secret.
 */
export default {
  name: 'ResetSecretField',
  components: {
    BButton,
    BFormGroup,
    BInputGroupAppend,
    BModal,
    FrAlert,
    FrField,
    VeeForm,
  },
  directives: {
    'b-modal': VBModal,
  },
  props: {
    /**
     * Description that goes below field
     */
    description: {
      type: String,
      default: '',
    },
    /**
     * Determines if the description should accept html
     */
    isHtml: {
      type: Boolean,
      default: false,
    },
    /**
     * Label for inputs and title for modal
     */
    label: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      effectiveLabel: this.label || this.$t('common.password'),
      placeHolderSecretField: '••••••••••••••••••',
      newSecret: '',
    };
  },
  methods: {
    resetSecret() {
      /**
       * Triggered when modal confirm button is clicked
       * @param {string} newSecret new secret value
       */
      this.$emit('secret-updated', this.newSecret);
    },
  },
};
</script>
