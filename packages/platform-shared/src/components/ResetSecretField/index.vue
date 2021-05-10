<!-- Copyright (c) 2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <FrField
      v-model="placeHolderSecretField"
      disabled
      :label="translatedFieldName">
      <template #append>
        <BInputGroupAppend>
          <BButton v-b-modal.resetSecretModal>
            {{ $t('common.reset') }}
          </BButton>
        </BInputGroupAppend>
      </template>
    </FrField>

    <ValidationObserver
      ref="observer"
      v-slot="{ invalid }">
      <BModal
        size="lg"
        id="resetSecretModal"
        ref="resetSecretModal"
        :title="$t('schemaResetSecret.title', { field: translatedFieldName })"
        cancel-variant="link"
        @hidden="newSecret = ''"
        @ok="resetSecret"
        :ok-disabled="invalid"
        :ok-title="$t('common.save')"
        :cancel-title="$t('common.cancel')">
        <p>{{ $t('schemaResetSecret.modalBody', { field: lowerCaseFieldName }) }}</p>
        <BFormGroup>
          <FrField
            v-model="newSecret"
            type="password"
            validation="required"
            :label="$t('schemaResetSecret.newSecretText', { field: translatedFieldName })" />
        </BFormGroup>
        <FrAlert
          show
          variant="warning"
          :dismissible="false">
          <span>{{ $t('schemaResetSecret.secretResetWarning', { field: lowerCaseFieldName }) }}</span>
        </FrAlert>
      </BModal>
    </ValidationObserver>
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
import { ValidationObserver } from 'vee-validate';

export default {
  name: 'ResetSecretField',
  components: {
    BButton,
    BFormGroup,
    BInputGroupAppend,
    BModal,
    FrAlert,
    FrField,
    ValidationObserver,
  },
  directives: {
    'b-modal': VBModal,
  },
  props: {
    translatedFieldName: {
      type: String,
      default: 'Password',
    },
  },
  computed: {
    lowerCaseFieldName() {
      return this.translatedFieldName.toLowerCase();
    },
  },
  data() {
    return {
      placeHolderSecretField: '••••••••••••••••••',
      newSecret: '',
    };
  },
  methods: {
    resetSecret() {
      this.$emit('secret-updated', this.newSecret);
    },
  },
};
</script>
