<!-- Copyright 2019 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div class="row text-left mb-2">
    <div class="col-sm text-center d-inline-block">
      <input
        type="hidden"
        :name="name"
        :ref="name"
        value="true">
      <small class="form-text text-muted">
        {{ agreeToTermsText }}
        <a
          href="#"
          @click.prevent="$refs['terms-modal'].show()">
          {{ termsAndConditionsText }}
        </a>.
      </small>

      <BModal
        ref="terms-modal"
        hide-footer
        :title="termsAndConditionsText">
        <div class="d-block text-left">
          <p>{{ terms }}</p>
        </div>
      </BModal>
    </div>
  </div>
</template>

<script>
import { BModal } from 'bootstrap-vue';

export default {
  name: 'TermsAndConditions',
  components: {
    BModal,
  },
  props: {
    callback: {
      type: Object,
      required: true,
    },
    index: {
      type: Number,
      default: 0,
    },
    prompt: {
      type: String,
      default: '',
    },
    termsAndConditionsText: {
      type: String,
      default: '',
    },
    agreeToTermsText: {
      type: String,
      default: '',
    },
  },
  mounted() {
    this.name = `callback_${this.index}`;
    this.terms = this.callback.getTerms();
    this.callback.setInputValue(true);
  },
  data() {
    return {
      name: '',
      terms: '',
    };
  },
};
</script>
