<!-- Copyright (c) 2020-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="row text-left mb-2">
    <div class="col-sm text-center d-inline-block">
      <input
        type="hidden"
        :name="name"
        :ref="name"
        value="true">
      <small class="form-text text-muted">
        {{ $t('login.agreeToTerms') }}
        <BButton
          variant="link"
          class="p-0 border-0 align-baseline"
          @click="$refs['terms-modal'].show()">
          {{ $t('login.termsAndConditions') }}
        </BButton>
      </small>

      <BModal
        ref="terms-modal"
        hide-footer
        title-tag="h2"
        title-class="h5"
        body-class="p-3 border-none"
        :title="$t('login.termsAndConditions')">
        <p v-html="terms" />
      </BModal>
    </div>
  </div>
</template>

<script>
import { BButton, BModal } from 'bootstrap-vue';
import { convertBase64ToString } from '@forgerock/platform-shared/src/utils/encodeUtils';
import { termsAndConditionsSanitizerConfig } from '@forgerock/platform-shared/src/utils/sanitizerConfig';

export default {
  name: 'TermsAndConditions',
  components: {
    BButton,
    BModal,
  },
  props: {
    callback: {
      type: Object,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
  },
  mounted() {
    this.name = `callback_${this.index}`;

    const terms = convertBase64ToString(this.callback.getTerms());
    this.terms = this.$sanitize(terms, termsAndConditionsSanitizerConfig);
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
<style lang="scss" scoped>
  .html-preview {
    border: none;
  }

  .btn-link {
    font-size: inherit;
  }
</style>
