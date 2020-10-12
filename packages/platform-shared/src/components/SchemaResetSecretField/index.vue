<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div>
    <FrField :field="placeHolderSecretField">
      <template v-slot:append>
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
        @hidden="newSecret.value = ''"
        @ok="resetSecret"
        :ok-disabled="invalid"
        :ok-title="$t('common.save')"
        :cancel-title="$t('common.cancel')">
        <p>{{ $t('schemaResetSecret.modalBody', { field: lowerCaseFieldName }) }}</p>
        <div class="form-group">
          <FrField :field="newSecret" />
        </div>
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
  BModal,
  BButton,
  BInputGroupAppend,
  VBModal,
} from 'bootstrap-vue';
import FrAlert from '@forgerock/platform-shared/src/components/Alert';
import FrField from '@forgerock/platform-shared/src/components/Field';
import { ValidationObserver } from 'vee-validate';

export default {
  name: 'SchemaResetSecretField',
  components: {
    BModal,
    BButton,
    BInputGroupAppend,
    FrAlert,
    FrField,
    ValidationObserver,
  },
  directives: {
    'b-modal': VBModal,
  },
  props: {
    schemaType: {
      type: String,
      default: '',
    },
    model: {
      type: String,
      default: 'userpassword',
    },
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
      placeHolderSecretField: {
        type: 'text',
        title: this.translatedFieldName,
        value: '••••••••••••••••••',
        disabled: true,
      },
      newSecret: {
        type: 'password',
        title: this.$t('schemaResetSecret.newSecretText', { field: this.translatedFieldName }),
        value: '',
        validation: 'required',
      },
    };
  },
  methods: {
    resetSecret() {
      this.$store.commit('ApplicationStore/setSchemaDataPropertyValue', {
        schemaType: this.schemaType,
        model: this.model,
        value: this.newSecret.value,
      });
      this.$emit('secret-updated');
    },
  },
};
</script>
