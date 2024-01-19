<!-- Copyright (c) 2021-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrInputLayout
    :id="internalId"
    :name="name"
    :description="description"
    :errors="combinedErrors"
    :is-html="isHtml"
    :label="label"
    :data-testid="testid">
    <VuePrismEditor
      v-model="inputValue"
      v-on="validationListeners"
      class="polyfill-placeholder"
      :aria-label="$t('editor.accessibilityHelp')"
      :disabled="disabled"
      :readonly="readonly"
      language="json"
      :line-numbers="true"
      :highlight="highlighter"
      @change="$emit('input', $event)" />
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
import { useField } from 'vee-validate';
import uuid from 'uuid/v4';
import { toRef } from 'vue';
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
  setup(props) {
    const {
      value: inputValue, errors: fieldErrors, handleBlur,
    } = useField(() => `${props.name}-id-${uuid()}`, toRef(props, 'validation'), { validateOnMount: props.validationImmediate, initialValue: '', bails: false });

    // validationListeners: Contains custom event listeners for validation.
    // Since vee-validate +4 removes the interaction modes, this custom listener is added
    // to validate on blur to perform a similar aggressive validation in addition to the validateOnValueUpdate.
    const validationListeners = {
      blur: (evt) => handleBlur(evt, true),
    };

    return { inputValue, fieldErrors, validationListeners };
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
  computed: {
    combinedErrors() {
      return this.errors.concat(this.fieldErrors);
    },
  },
  mounted() {
    document.addEventListener('keydown', this.blurOnEscape);
  },
  unmounted() {
    document.removeEventListener('keydown', this.blurOnEscape);
  },
};
</script>
