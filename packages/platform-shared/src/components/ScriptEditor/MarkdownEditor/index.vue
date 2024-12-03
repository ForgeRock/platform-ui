<!-- Copyright (c) 2020-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div
    v-if="!isPublished"
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
          v-model="markdownField"
          role="textbox"
          :class="{ 'pt-4': wideNavbar}"
          :aria-label="$t('editor.accessibilityHelp')"
          :highlight="(code) => highlighter(code, 'html')"
          :line-numbers="true"
          :readonly="disabled"
          @keydown="blurOnEscape"
        />
        <VuePrismEditor
          v-else
          v-model="stylesField"
          role="textbox"
          :aria-label="$t('editor.accessibilityHelp')"
          :class="{ 'pt-4': wideNavbar}"
          :highlight="(code) => highlighter(code, 'css')"
          :line-numbers="true"
          :readonly="disabled"
          @keydown="blurOnEscape"
        />
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
  <div
    v-else
    class="d-flex h-100 position-relative justify-content-center"
    style="padding-top: 9.625rem;"
  >
    <div class="d-flex">
      <div class="h-100 vw-100 overflow-auto bg-white p-5">
        <article class="row justify-content-center">
          <div
            v-html="parsedHtml"
            class="col-md-10 col-lg-8 col-xl-6"
          />
        </article>
      </div>
    </div>
  </div>
</template>

<script>
import { PrismEditor as VuePrismEditor } from 'vue-prism-editor';
import blurOnEscape, { highlighter } from '@forgerock/platform-shared/src/utils/codeEditor';
import 'prismjs/components/prism-markdown';
import MarkdownIt from 'markdown-it';
import markdownItAnchor from 'markdown-it-anchor';
import TurndownService from 'turndown';
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
      markdownField: null,
      stylesField: null,
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
    /**
     * Display markdown editor. CSS if not.
     */
    isMarkdown: {
      default: true,
      required: false,
      type: Boolean,
    },
    /**
     * Show header
     */
    showHeader: {
      default: false,
      required: false,
      type: Boolean,
    },
    /**
     * Applies correct css for a wider navbar
     */
    wideNavbar: {
      default: false,
      required: false,
      type: Boolean,
    },
    /**
     * Disable the editors
     */
    disabled: {
      default: false,
      required: false,
      type: Boolean,
    },
    /**
     * If content is published
     */
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    blurOnEscape,
    highlighter,
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
      const turndownService = new TurndownService();
      const markdown = turndownService.turndown(content);
      this.markdownField = markdown ?? '';
    },
    /**
     * Get HTML from markdown
     */
    parseHtml() {
      const md = new MarkdownIt().use(markdownItAnchor, {
        level: 1, // Minimum header level to apply anchors (default: 1)
        slugify: (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, ''), // Custom ID generator
      });
      const html = md.render(this.markdownField);

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
    markup: {
      handler() {
        this.parseMarkdown();
      },
      immediate: true,
    },
    markdownField() {
      this.parseHtml();
    },
    styles: {
      handler() {
        this.stylesField = this.styles;
        this.parseHtml();
      },
      immediate: true,
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
