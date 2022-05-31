<!-- Copyright (c) 2022-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <label class="my-3">
      {{ $t('queryFilterBuilder.basicEditorHeadline') }}
    </label>
    <VuePrismEditor
      language="javascript"
      v-model="queryFilterString"
      :aria-label="$t('editor.accessibilityHelp')"
      :readonly="disabled"
      @input="$emit('input', $event.target.innerText)"
      @keydown="blurOnEscape($event.code)" />
  </div>
</template>

<script>
import 'prismjs';
import VuePrismEditor from 'vue-prism-editor';
import blurOnEscape from '@forgerock/platform-shared/src/utils/codeEditor';

export default {
  name: 'FilterBuilderAdvanced',
  components: {
    VuePrismEditor,
  },
  data() {
    return {
      queryFilterString: this.value.toString(),
    };
  },
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    value: {
      required: true,
      type: [String, Boolean],
    },
  },
  methods: {
    blurOnEscape,
  },
};
</script>

<style lang="scss" scoped>
::v-deep code {
  white-space: pre-wrap !important;
}
</style>
