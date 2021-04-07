<!-- Copyright (c) 2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <FrField
      v-model="uiSchema.value"
      class="pb-4"
      :description="uiSchema.description"
      :label="uiSchema.label"
      :options="arrayOptions"
      :type="arrayType"
      :validation="uiSchema.required ? 'required' : ''"
      @input="updateValue" />
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
    arrayType() {
      if (this.uiSchema.arrayType === 'addMany') {
        return 'tag';
      }
      if (this.uiSchema.arrayType === 'selectOne') {
        return 'select';
      }
      return 'multiselect';
    },
    arrayOptions() {
      const { options } = this.uiSchema;
      if (!options) {
        return [];
      }
      return options;
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
