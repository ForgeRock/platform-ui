<template>
  <FloatingLabelInput
    type="text"
    v-model="value"
    :disabled="uiSchema.disabled"
    :label="uiSchema.label"
    :help-text="uiSchema.helpText"
    :is-html="uiSchema.isHtml"
    class="mb-4 px-1">
    <div
      v-if="uiSchema.append"
      slot="append"
      class="input-group-append">
      <button
        class="btn btn-outline-secondary"
        type="button"
        :name="uiSchema.append + 'Button'"
        @click="$emit(uiSchema.append + ':' + uiSchema.value)">
        <template
          v-if="uiSchema.append.split(':')[0] === 'text'">
          {{ uiSchema.append.split(':')[1] }}
        </template>
        <template v-else>
          <i class="material-icons material-icons-outlined">
            {{ uiSchema.append }}
          </i>
        </template>
      </button>
    </div>
  </FloatingLabelInput>
</template>

<script>
import FloatingLabelInput from '@forgerock/platform-shared/src/components/FloatingLabelInput';

export default {
  name: 'StringDisplay',
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
