<template>
  <div class="row text-left mb-2">
    <div class="col-sm text-center d-inline-block">
      <input
        type="hidden"
        :name="name"
        :ref="name"
        value="true"
      >
      <small class="form-text text-muted">
        {{ agreeToTermsText }}
        <a
          href="#"
          @click.prevent="$refs['terms-modal'].show()"
        >
          {{ termsAndConditionsText }}
        </a>.
      </small>

      <BModal
        ref="terms-modal"
        hide-footer
        :title="termsAndConditionsText"
      >
        <div class="d-block text-left">
          <p>{{ terms }}</p>
        </div>
      </BModal>
    </div>
  </div>
</template>

<script>
import { BModal } from 'bootstrap-vue';
import { find, isArray } from 'lodash';

export default {
  name: 'TermsAndConditions',
  components: {
    BModal,
  },
  props: {
    callback: {
      type: Object,
      // make sure the callback has an output property that is an Array and has at least one item
      validator: prop => prop.output
                  && isArray(prop.output)
                  && prop.output.length > 0,
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
