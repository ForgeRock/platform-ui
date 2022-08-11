<!-- Copyright (c) 2021-2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrInputLayout
    :id="id"
    :name="name"
    :description="description"
    :errors="errors"
    :is-html="isHtml"
    :label="label"
    :validation="validation"
    :validation-immediate="validationImmediate"
    :data-testid="testid">
    <VuePrismEditor
      v-model="inputValue"
      :aria-label="$t('editor.accessibilityHelp')"
      :disabled="disabled"
      :readonly="readonly"
      language="json"
      :line-numbers="true"
      :highlight="highlighter"
      @change="$emit('input', $event)"
      @keydown="blurOnEscape" />
  </FrInputLayout>
</template>

<script>
import { highlight, languages } from 'prismjs/components/prism-core';
import VuePrismEditor from 'vue-prism-editor';
import 'prismjs';
import 'prismjs/components/prism-json';
import 'prismjs/themes/prism.css';
import 'vue-prism-editor/dist/VuePrismEditor.css';
import blurOnEscape from '@forgerock/platform-shared/src/utils/codeEditor';
import FrInputLayout from '../Wrapper/InputLayout';
import InputMixin from '../Wrapper/InputMixin';

/**
 *  Prism based editor for JSON input
 *
 *  @Mixes InputMixin - default props and methods for inputs
 *  @param {String} value default ''
 */
export default {
  name: 'JsonInput',
  mixins: [InputMixin],
  components: {
    FrInputLayout,
    VuePrismEditor,
  },
  props: {
    testid: {
      type: String,
      default: '',
    },
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
      return highlight(code, languages.json);
    },
  },
};
</script>
