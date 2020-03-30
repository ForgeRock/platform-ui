<template>
  <FloatingLabelInput
    type="text"
    v-model.number="value"
    :disabled="uiSchema.disabled"
    :label="uiSchema.label"
    :help-text="uiSchema.helpText"
    :is-html="uiSchema.isHtml"
    class="mb-4 px-1" />
</template>

<script>
import FloatingLabelInput from '@forgerock/platform-shared/src/components/FloatingLabelInput';

export default {
  name: 'NumberDisplay',
  components: {
    FloatingLabelInput,
  },
  props: {
    uiSchema: {
      type: Object,
      default() {
        return {};
      },
    },
    saveModel: {
      type: String,
      default: '',
    },
  },
  computed: {
    value: {
      get() {
        return this.uiSchema.value;
      },
      set(newValue) {
        this.$emit('update:model', {
          model: this.saveModel,
          value: newValue,
        });
      },
    },
  },
};
</script>
