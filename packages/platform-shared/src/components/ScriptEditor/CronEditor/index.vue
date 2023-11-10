<!-- Copyright (c) 2022-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <VuePrismEditor
    v-if="editorCanRender"
    v-model="contentField"
    :aria-label="$t('editor.accessibilityHelp')"
    :line-numbers="true"
    @input="clean($event)" />
</template>

<script>
import VuePrismEditor from 'vue-prism-editor';
import 'prismjs';
import 'prismjs/components/prism-css';
import 'prismjs/themes/prism.css';
import 'vue-prism-editor/dist/VuePrismEditor.css';

/**
 * Code editor.
 */
export default {
  name: 'CronEditor',
  components: {
    VuePrismEditor,
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
  },
  data() {
    return {
      contentField: undefined,
    };
  },
  methods: {
    clean(event) {
      const match = /\r|\n/.exec(event.target.innerHTML);
      if (match) {
        event.target.innerText = event.target.innerText.replace(/\n|\r/g, '').trim();
      }

      this.$emit('input', event.target.innerText);
    },
  },
  mounted() {
    this.contentField = this.value;
  },
};
</script>
<style lang="scss" scoped>
  code {
    background: $gray-100;
    border-radius: 3px;
  }
</style>
