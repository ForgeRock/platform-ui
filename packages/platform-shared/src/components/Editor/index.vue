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
    language: {
      default: '',
      required: false,
      type: String,
    },
    content: {
      default: undefined,
      required: false,
      type: String,
    },
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
    highlighter(code) {
      return highlight(code, languages.html);
    },
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
