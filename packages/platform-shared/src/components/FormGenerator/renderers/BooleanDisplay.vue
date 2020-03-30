<template>
  <div class="custom-control custom-checkbox pb-3">
    <input
      :id="`checkbox-${saveModel}`"
      type="checkbox"
      :name="`checkbox-${saveModel}`"
      autocomplete="off"
      class="custom-control-input"
      v-model="checked">
    <label
      :for="`checkbox-${saveModel}`"
      class="custom-control-label">
      {{ uiSchema.label }}
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
    </label>
  </div>
</template>

<script>
export default {
  name: 'BooleanDisplay',
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
    checked: {
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
