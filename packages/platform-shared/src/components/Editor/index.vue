<!-- Copyright (c) 2020-2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <VuePrismEditor
    v-if="editorCanRender"
    :language="language"
    :line-numbers="true"
    v-model="contentField" />
</template>

<script>
import { highlight, languages } from 'prismjs/components/prism-core';
import { pd } from 'pretty-data';
import VuePrismEditor from 'vue-prism-editor';
import 'prismjs';
import 'prismjs/components/prism-css';
import 'prismjs/themes/prism.css';
import 'vue-prism-editor/dist/VuePrismEditor.css';

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
      required: false,
      type: String,
    },
    /**
     * Code to be displayed in editor
     */
    content: {
      default: undefined,
      required: false,
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
    this.contentField = this.prettify(this.content);
  },
  watch: {
    content(val) {
      this.contentField = this.prettify(val);
      this.shouldReset = false;
    },
    contentField() {
      /**
        * Triggered when a change is made in the editor
        *
        * @property {string} contentField current value of editor
        */
      this.$emit('change', this.contentField);
    },
    reset(val) {
      if (val) {
        this.shouldReset = true;
        this.contentField = this.prettify(this.content);
      }
    },
  },
};
</script>
