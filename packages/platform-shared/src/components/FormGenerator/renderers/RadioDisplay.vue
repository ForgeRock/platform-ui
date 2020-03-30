<template>
  <BFormGroup
    :label="uiSchema.label">
    <BFormRadioGroup
      v-model="value"
      :options="uiSchema.options"
      text-field="text"
      stacked />
    <small
      v-if="uiSchema.isHtml"
      v-html="uiSchema.helpText"
      class="form-text text-muted">
      {{ uiSchema.helpText }}
    </small>
    <small
      v-else
      class="form-text text-muted">
      {{ uiSchema.helpText }}
    </small>
  </BFormGroup>
</template>

<script>
import {
  BFormGroup,
  BFormRadioGroup,
} from 'bootstrap-vue';

export default {
  name: 'RadioDisplay',
  components: {
    BFormGroup,
    BFormRadioGroup,
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
