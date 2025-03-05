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
      :line-numbers="true"
      :highlight="(code) => highlighter(code, 'json')"
      @input="$emit('input', $event)"
    />
  </FrInputLayout>
</template>

<script>
import { PrismEditor as VuePrismEditor } from 'vue-prism-editor';
import blurOnEscape, { highlighter } from '@forgerock/platform-shared/src/utils/codeEditor';

import { useField } from 'vee-validate';
import uuid from 'uuid/v4';
import { ref, toRef, watch } from 'vue';
import { debounce } from 'lodash';
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
      value: inputValue,
      errors: fieldErrors,
      meta,
      handleBlur,
      validate,
    } = useField(
      () => `${props.name}-id-${uuid()}`,
      toRef(props, 'validation'),
      {
        validateOnMount: props.validationImmediate,
        initialValue: '',
        bails: false,
        validateOnValueUpdate: false,
      },
    );

    const wasInvalid = ref(false);
    const debouncedValidate = debounce(validate, 250);

    // Eager validation on input if previously invalid
    watch(inputValue, () => {
      if (wasInvalid.value) {
        debouncedValidate();
      }
    });

    // Track when field becomes valid again
    watch(fieldErrors, (newErrors) => {
      wasInvalid.value = newErrors.length > 0;
    });

    // Blur validation — triggers immediate validation on blur
    const validationListeners = {
      blur: async (evt) => {
        handleBlur(evt, true);
        await validate();
        wasInvalid.value = fieldErrors.value.length > 0; // Reset tracking
      },
    };

    return {
      inputValue, fieldErrors, meta, validationListeners,
    };
  },
  methods: {
    blurOnEscape,
    highlighter,
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
