<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div class="d-flex">
    <div class="d-flex flex-column w-50 bg-light">
      <h6 class="m-0 p-3 pt-4 text-uppercase text-secondary">
        {{ $t('email.edit.markdown') }}
      </h6>
      <VuePrismEditor
        language="html"
        :highlight="highlighter"
        :line-numbers="true"
        v-model="markdownField"
      />
    </div>
    <div
      class="w-50">
      <iframe
        class="html-preview w-100 h-100 p-0 m-0 border-none"
        :srcdoc="parsedHtml" />
    </div>
  </div>
</template>

<script>
import { highlight, languages } from 'prismjs/components/prism-core';
import VuePrismEditor from 'vue-prism-editor';
import 'prismjs';
import 'prismjs/components/prism-markdown';
import 'prismjs/themes/prism.css';
import 'vue-prism-editor/dist/VuePrismEditor.css';
import showdown from 'showdown';
import { pd } from 'pretty-data';

export default {
  name: 'MarkdownEditor',
  components: {
    VuePrismEditor,
  },
  data() {
    return {
      htmlField: '',
      markdownField: '',
      parsedHtml: '',
    };
  },
  props: {
    markdown: {
      default: '',
      required: false,
      type: String,
    },
    markup: {
      default: '',
      required: false,
      type: String,
    },
    styles: {
      required: true,
      type: String,
    },
  },
  methods: {
    highlighter(code) {
      return highlight(code, languages.html);
    },
    wrapContent(message) {
      const domparser = new DOMParser();
      const doc = domparser.parseFromString(message, 'text/html');
      const hasContentDiv = doc.getElementsByClassName('content').length > 0;

      if (hasContentDiv) {
        return pd.xmlmin(message);
      }

      const contentDiv = `<div class="content">${doc.body.innerHTML}</div>`;
      doc.body.innerHTML = contentDiv;

      return pd.xmlmin(doc.body.innerHTML);
    },
    getContentChildren(content) {
      const domparser = new DOMParser();
      const doc = domparser.parseFromString(content, 'text/html');
      const contentDiv = doc.getElementsByClassName('content');
      const hasContentDiv = contentDiv.length > 0;
      return hasContentDiv ? contentDiv[0].innerHTML : content;
    },
    parseMarkdown() {
      const content = this.getContentChildren(this.markup);
      const converter = new showdown.Converter();
      const markdown = converter.makeMarkdown(content);
      this.markdownField = markdown;
    },
    parseHtml() {
      const converter = new showdown.Converter({ completeHTMLDocument: false });
      const html = converter.makeHtml(this.markdownField);
      this.htmlField = html;
      this.parsedHtml = `<style>${this.styles}</style>${this.wrapContent(html)}`;
    },
  },
  watch: {
    htmlField() {
      this.$emit('change', this.markdownField, this.wrapContent(this.htmlField));
    },
    markdown() {
      this.markdownField = this.markdown;
    },
    markup() {
      this.parseMarkdown();
    },
    markdownField() {
      this.parseHtml();
    },
    styles() {
      this.parseHtml();
    },
  },
};
</script>
