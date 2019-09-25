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
import { find } from 'lodash';
import CallbackValidation from '@/utils/CallbackValidation';

export default {
  name: 'TermsAndConditions',
  components: {
    BModal,
  },
  props: {
    callback: {
      type: Object,
      validator: CallbackValidation.validateOutput,
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
    this.terms = find(this.callback.output, { name: 'terms' }).value;
  },
  data() {
    return {
      name: '',
      terms: '',
    };
  },
};
</script>
