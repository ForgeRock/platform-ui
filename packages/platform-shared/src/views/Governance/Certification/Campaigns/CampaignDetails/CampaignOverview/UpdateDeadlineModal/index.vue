<!-- Copyright 2023 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <VeeForm
    v-slot="{ meta: { valid } }"
    as="span">
    <BModal
      id="UpdateDeadlineModal"
      no-close-on-backdrop
      no-close-on-esc
      size="lg"
      title-class="h5"
      title-tag="h2"
      :static="isTesting"
      :title="$t('governance.certificationDetails.updateDeadlineModal.title')"
      @hidden="resetModal">
      <FrDatepicker
        v-model="newDeadline"
        data-testid="deadline"
        name="deadline"
        :validation="validationParams"
        :date-format-options="{ year: 'numeric', month: 'numeric', day: 'numeric' }"
        :placeholder="$t('governance.certificationDetails.updateDeadlineModal.deadlinePlaceholder')"
        :validation-immediate="true" />
      <template #modal-footer="{ cancel }">
        <BButton
          variant="link"
          @click="cancel">
          {{ $t('common.cancel') }}
        </BButton>
        <FrButtonWithSpinner
          data-testid="save-button"
          variant="primary"
          :disabled="loading || !newDeadline || !valid"
          :show-spinner="loading"
          :button-text="$t('common.save')"
          :spinner-text="$t('common.saving')"
          @click="save" />
      </template>
    </BModal>
  </VeeForm>
</template>

<script>
import {
  BButton,
  BModal,
} from 'bootstrap-vue';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner/';
import FrDatepicker from '@forgerock/platform-shared/src/components/Datepicker';
import dayjs from 'dayjs';
import { Form as VeeForm } from 'vee-validate';

export default {
  name: 'FrUpdateDeadlineModal',
  components: {
    BButton,
    BModal,
    FrButtonWithSpinner,
    FrDatepicker,
    VeeForm,
  },
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
    isTesting: {
      type: Boolean,
      default: false,
    },
    currentDeadline: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      newDeadline: null,
      validationParams: {
        is_after_date: {
          date: new Date(),
          message: 'governance.certification.errors.errorDeadline',
        },
      },
    };
  },
  watch: {
    currentDeadline(value) {
      this.newDeadline = value;
    },
  },
  methods: {
    resetModal() {
      this.newDeadline = null;
      this.$emit('close-modal', 'UpdateDeadlineModal');
    },
    save() {
      this.$emit('update-deadline', dayjs(this.newDeadline).format());
    },
  },
};
</script>
