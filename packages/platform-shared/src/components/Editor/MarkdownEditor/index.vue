<!-- Copyright (c) 2020-2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div
    class="d-flex"
    :class="{ 'fr-spacer h-100 position-relative': wideNavbar}">
    <div class="bg-light border-right w-50 overflow-hidden position-relative">
      <div
        class="h-100"
        :class="{ 'flex-grow-1 overflow-auto': wideNavbar}">
        <h6
          v-if="showHeader"
          class="m-0 p-3 pt-4 text-uppercase text-secondary">
          {{ $t('email.edit.markdown') }}
        </h6>
        <VuePrismEditor
          v-if="isMarkdown"
          role="textbox"
          language="html"
          :line-numbers="true"
          v-model="markdownField"
          :readonly="disabled"
          :class="{ 'pt-4': wideNavbar}" />
        <VuePrismEditor
          v-else
          role="textbox"
          language="css"
          :line-numbers="true"
          v-model="stylesField"
          :readonly="disabled"
          :class="{ 'pt-4': wideNavbar}" />
      </div>
    </div>
    <div class="w-50">
      <div
        class="h-100 w-100 overflow-auto bg-white pt-4 pl-3"
        :class="{ 'py-5 px-3': wideNavbar}">
        <div class="d-flex w-100 h-100 position-relative">
          <div class="flex-grow-1 h-100">
            <iframe
              role="article"
              class="html-preview w-100 h-100 m-0 border-none"
              :srcdoc="parsedHtml" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import VuePrismEditor from 'vue-prism-editor';
import 'prismjs';
import 'prismjs/components/prism-markdown';
import 'prismjs/themes/prism.css';
import 'vue-prism-editor/dist/VuePrismEditor.css';
import showdown from 'showdown';
import { pd } from 'pretty-data';

/**
 * Markdown editor.
 */
export default {
  name: 'MarkdownEditor',
  components: {
    VuePrismEditor,
  },
  data() {
    return {
      htmlField: '',
      markdownField: '',
      stylesField: '',
      parsedHtml: '',
    };
  },
  props: {
    /**
     * Markdown displayed in editor
     */
    markdown: {
      default: '',
      required: false,
      type: String,
    },
    /**
     * HTML
     */
    markup: {
      default: '',
      required: false,
      type: String,
    },
    /**
     * Styles to apply to preview
     */
    styles: {
      required: true,
      type: String,
    },
    isMarkdown: {
      default: true,
      required: false,
      type: Boolean,
    },
    showHeader: {
      default: false,
      required: false,
      type: Boolean,
    },
    wideNavbar: {
      default: false,
      required: false,
      type: Boolean,
    },
    disabled: {
      default: false,
      required: false,
      type: Boolean,
    },
  },
  methods: {
    /**
     * Checks if content is wrapped in a div, and if not, wraps it
     */
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
    /**
     * Get content children
     */
    getContentChildren(content) {
      const domparser = new DOMParser();
      const doc = domparser.parseFromString(content, 'text/html');
      const contentDiv = doc.getElementsByClassName('content');
      const hasContentDiv = contentDiv.length > 0;
      return hasContentDiv ? contentDiv[0].innerHTML : content;
    },
    /**
     * Get a markdown string from HTML
     */
    parseMarkdown() {
      const content = this.getContentChildren(this.markup);
      const converter = new showdown.Converter();
      const markdown = converter.makeMarkdown(content);
      this.markdownField = markdown;
    },
    /**
     * Get HTML from markdown
     */
    parseHtml() {
      const converter = new showdown.Converter({ completeHTMLDocument: false });
      const html = converter.makeHtml(this.markdownField);
      this.htmlField = html;
      this.parsedHtml = `<style>${this.stylesField}</style>${this.wrapContent(html)}`;
      this.$emit('parsed-html', this.parsedHtml);
    },
  },
  watch: {
    htmlField() {
      this.$emit('change', this.markdownField, this.wrapContent(this.htmlField));
    },
    stylesField() {
      this.$emit('styles-change', this.stylesField);
      this.parseHtml();
    },
    markup() {
      this.parseMarkdown();
    },
    markdownField() {
      this.parseHtml();
    },
    styles() {
      this.stylesField = this.styles;
      this.parseHtml();
    },
  },
};
</script>
<style lang="scss" scoped>
    .fr-spacer {
      padding-top: 8.25rem;
    }

    .prism-editor__line-numbers {
      height: 700px;
    }
</style>
