<template>
  <FrField
    @valueChange="updateValue"
    :field="field"
    :disabled="uiSchema.disabled"
    class="mb-4 px-1" />
</template>
<script>
import FrField from '@forgerock/platform-shared/src/components/Field';

export default {
  name: 'NumberDisplay',
  components: {
    FrField,
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
    field() {
      return {
        type: 'integer',
        value: this.uiSchema.value,
        title: this.uiSchema.label,
        description: this.uiSchema.helpText,
        validation: 'numeric',
      };
    },
  },
  methods: {
    updateValue(newValue) {
      this.$emit('update:model', {
        model: this.saveModel,
        value: newValue,
      });
    },
  },
};
</script>
