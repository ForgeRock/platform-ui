<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
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
  },
  data() {
    return {
      contentField: undefined,
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
    },
    contentField() {
      this.$emit('change', this.contentField);
    },
  },
};
</script>
