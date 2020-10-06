<!--
Copyright (c) 2020 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details.
-->

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
        </a>.
      </small>

      <BModal
        ref="terms-modal"
        hide-footer
        :title="$t('login.termsAndConditions')">
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
      required: true,
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
