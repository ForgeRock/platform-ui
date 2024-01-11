<!-- Copyright (c) 2022-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <FrField
      v-if="editorCanRender"
      name="CronEditor"
      v-model="contentField"
      :validation="validation"
      @input="updateContentValue" />
  </div>
</template>

<script>
import FrField from '@forgerock/platform-shared/src/components/Field';

/**
 * Code editor.
 */
export default {
  name: 'CronEditor',
  components: {
    FrField,
  },
  computed: {
    editorCanRender() {
      return this.contentField !== undefined;
    },
  },
  props: {
    /**
     * Code to be displayed in editor
     */
    value: {
      default: 'undefined',
      type: String,
    },
    /**
     * Field validation rules
     */
    validation: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      contentField: undefined,
    };
  },
  mounted() {
    this.contentField = this.value;
  },
  methods: {
    updateContentValue(newVal) {
      this.$emit('input', newVal.trim());
    },
  },
};
</script>
