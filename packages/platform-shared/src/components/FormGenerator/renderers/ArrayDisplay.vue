<template>
  <FloatingLabelInput
    type="multiselect"
    v-model="value"
    :disabled="uiSchema.disabled"
    :select-options="uiSchema.options"
    :label="uiSchema.label"
    :help-text="uiSchema.helpText"
    :is-html="uiSchema.isHtml"
    :taggable="true"
    :multiple="true"
    class="mb-4 pr-1"
  />
</template>
<script>
import FloatingLabelInput from '@forgerock/platform-shared/src/components/Field/FloatingLabelInput';

export default {
  name: 'ArrayDisplay',
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
