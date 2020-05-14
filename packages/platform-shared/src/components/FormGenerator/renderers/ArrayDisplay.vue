<template>
  <div>
    <FrField
      @valueChange="updateValue"
      :field="field"
    />
    <small
      v-if="uiSchema.isHtml"
      v-html="uiSchema.helpText"
      class="form-text text-muted pb-4">
      {{ uiSchema.helpText }}
    </small>
    <small
      v-else
      class="form-text text-muted pb-4">
      {{ uiSchema.helpText }}
    </small>
  </div>
</template>
<script>
import FrField from '@forgerock/platform-shared/src/components/Field';

export default {
  name: 'ArrayDisplay',
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
      let arrayType;
      if (this.uiSchema.arrayType === 'addMany') {
        arrayType = 'tag';
      } else if (this.uiSchema.arrayType === 'selectOne') {
        arrayType = 'select';
      } else {
        arrayType = 'multiselect';
      }

      return {
        type: arrayType,
        value: this.uiSchema.value,
        enum: this.uiSchema.enum,
        enumNames: this.uiSchema.enumNames,
        options: this.uiSchema.options,
        title: this.uiSchema.label,
      };
    },
  },
  methods: {
    updateValue(value) {
      this.$emit('update:model', {
        model: this.saveModel,
        value,
      });
    },
  },
};
</script>
