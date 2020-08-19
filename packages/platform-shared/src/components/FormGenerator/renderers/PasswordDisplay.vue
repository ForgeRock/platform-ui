<template>
  <FrField
    :field="field"
    :disabled="uiSchema.disabled"
    class="mb-4" />
</template>

<script>
import FrField from '@forgerock/platform-shared/src/components/Field';

export default {
  name: 'PasswordDisplay',
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
    field: {
      get() {
        return {
          type: 'password',
          value: this.uiSchema.value || '',
          title: this.uiSchema.label,
          description: this.uiSchema.helpText,
        };
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
