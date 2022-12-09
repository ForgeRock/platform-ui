<!-- Copyright (c) 2020-2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <VuePrismEditor
    v-if="editorCanRender"
    v-model="contentField"
    :aria-label="$t('editor.accessibilityHelp')"
    :language="language"
    :readonly="readonly"
    :line-numbers="true"
    @input="$emit('input', $event.target.innerText)"
    @keydown="blurOnEscape" />
</template>

<script>
import { highlight, languages } from 'prismjs/components/prism-core';
import { pd } from 'pretty-data';
import VuePrismEditor from 'vue-prism-editor';
import 'prismjs';
import 'prismjs/components/prism-css';
import 'prismjs/themes/prism.css';
import 'vue-prism-editor/dist/VuePrismEditor.css';
import blurOnEscape from '@forgerock/platform-shared/src/utils/codeEditor';

/**
 * Code editor.
 */
export default {
  name: 'Editor',
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
     * Code language. Supported languages can be found here: https://prismjs.com/#supported-languages
     */
    language: {
      default: '',
      type: String,
    },
    /**
     * Disables user interaction
     */
    readonly: {
      default: false,
      type: Boolean,
    },
    /**
     * Code to be displayed in editor
     */
    value: {
      default: undefined,
      type: String,
    },
    /**
     * Reset editor to initial state
     */
    reset: {
      default: false,
      type: Boolean,
    },
  },
  data() {
    return {
      contentField: undefined,
      shouldReset: false,
    };
  },
  methods: {
    blurOnEscape,
    /**
     * Highlight code
     *
     * @param {String} code code to highlight
     * @returns highlighted code
     */
    highlighter(code) {
      return highlight(code, languages.html);
    },
    /**
     * Gets pretty printed code for CSS, JSON, HTML, XML
     *
     * @param {String} content code to attempt to prettify
     * @returns {String} If current language is set to one of the supported types, return prettified content
     */
    prettify(content) {
      if (content === undefined) {
        return content;
      }

      switch (this.language) {
        case 'css':
          return pd.css(content);
        case 'json':
          return pd.json(content);
        case 'html':
        case 'xml':
          return pd.xml(content);
        default:
          return content;
      }
    },
  },
  mounted() {
    this.contentField = this.prettify(this.value);
  },
  watch: {
    value: {
      handler(val) {
        this.contentField = this.prettify(val);
        this.shouldReset = false;
      },
      immediate: true,
    },
    reset(val) {
      if (val) {
        this.shouldReset = true;
        this.contentField = this.prettify(this.value);
      }
    },
  },
};
</script>
<style lang="scss" scoped>
  code {
    background: $gray-100;
    border-radius: 3px;
  }
</style>
