<!-- Copyright (c) 2020-2024 ForgeRock. All rights reserved.

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
        <a
          href="#"
          @click.prevent="$refs['terms-modal'].show()">
          {{ $t('login.termsAndConditions') }}
        </a>
      </small>

      <BModal
        ref="terms-modal"
        hide-footer
        body-class="p-3 border-none"
        :title="$t('login.termsAndConditions')">
        <p v-html="terms" />
      </BModal>
    </div>
  </div>
</template>

<script>
import { BModal } from 'bootstrap-vue';
import { convertBase64ToString } from '@forgerock/platform-shared/src/utils/encodeUtils';

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
      required: true,
    },
  },
  mounted() {
    this.name = `callback_${this.index}`;

    const terms = convertBase64ToString(this.callback.getTerms());
    this.terms = this.$sanitize(terms, {
      allowedTags: false,
      allowedAttributes: {
        '*': ['id', 'class'],
        a: ['href'],
      },
    });
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

  a {
    display: inline-block;
  }
</style>
