<!-- Copyright (c) 2020-2024 ForgeRock. All rights reserved.

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
    :floating-label="floatingLabel"
    :readonly-label="disabled">
    <FrMultiselectBase
      ref="vms"
      :id="internalId"
      :model-value="inputValue"
      @update:modelValue="inputHandler"
      v-bind="$attrs"
      :option-height="optionHeightCalculation"
      :class="classes"
      :data-testid="testid"
      :testid="testid"
      :name="name"
      :options="selectOptions"
      track-by="value"
      :disabled="disabled"
      :placeholder="internalPlaceholder"
      :searchable="searchable"
      :internal-search="internalSearch"
      :show-labels="false"
      :allow-empty="allowEmpty"
      :autofocus="autofocus"
      label="text"
      :combobox-labelledby="inputLabelledby"
      @select="$emit('select', $event)"
      @open="openHandler"
      @close="closeHandler"
      @tag="$emit('tag', $event)"
      @search-change="$emit('search-change', $event)">
      <template #noResult>
        {{ $t('common.noResult') }}
      </template>
      <template
        v-for="(key, slotName) in $slots"
        #[slotName]="slotData">
        <!-- @slot passthrough slot -->
        <slot
          :name="slotName"
          v-bind="slotData" />
      </template>
    </FrMultiselectBase>
    <template
      v-for="(key, slotName) in $slots"
      #[slotName]="slotData">
      <!-- @slot passthrough slot -->
      <slot
        :name="slotName"
        v-bind="slotData" />
    </template>
  </FrInputLayout>
</template>

<script>
import {
  find, isEqual,
} from 'lodash';
import {
  computed, watch, ref, toRef,
} from 'vue';
import { useField } from 'vee-validate';
import uuid from 'uuid/v4';
import FrMultiselectBase from '../../MultiselectBase/MultiselectBase';
import i18n from '@/i18n';
import FrInputLayout from '../Wrapper/InputLayout';
import { useGetId, useValueIsDifferent } from '../Wrapper/InputComposable';

export default {
  name: 'SelectInput',
  components: {
    FrInputLayout,
    FrMultiselectBase,
  },
  props: {
    allowEmpty: {
      type: Boolean,
      default: false,
    },
    /**
     * Autofocus field when rendered.
     */
    autofocus: {
      type: Boolean,
      default: false,
    },

    /**
     * Related text that displays underneath field.
     */
    description: {
      type: String,
      default: '',
    },
    /**
     * if field should be disabled.
     */
    disabled: {
      type: Boolean,
      default: false,
    },
    /**
     * List of errors related to input value (mostly used for callback components)
     */
    errors: {
      type: Array,
      default: () => [],
    },
    /**
     * Boolean to show a floating label or above label on controls
     */
    floatingLabel: {
      type: Boolean,
      default: true,
    },
    /**
     * Unique ID
     */
    id: {
      type: String,
      default: '',
    },
    /**
     * For accessibility: if you want to manually associate the input field with a label, legend etc.
     */
    inputLabelledby: {
      type: String,
      default: '',
    },
    /**
     * Search through existing options
     */
    internalSearch: {
      type: Boolean,
      default: true,
    },
    /**
     * Boolean to render label and help text as html.
     */
    isHtml: {
      type: Boolean,
      default: false,
    },
    /**
     * Label value that is show as placeholder value on floating labels or static label above control in other case.
     */
    label: {
      type: String,
      default: '',
    },
    /**
     * Input name.
     */
    name: {
      type: String,
      required: true,
      default: () => uuid(),
    },
    /**
     * Height of the individual option items. Important to
     * set accurately so the options menu aligns correctly.
     */
    optionHeightCalculation: {
      type: Number,
      default: 40,
    },
    /**
     * Options for select input.
     */
    options: {
      type: [Array, Object],
      required: true,
    },
    placeholder: {
      type: String,
      default: '',
    },
    /**
     * Boolean to show the input as readonly.
     */
    readonly: {
      type: Boolean,
      default: false,
    },
    searchable: {
      type: Boolean,
      default: true,
    },
    /**
     * Optionally scrolls the selected option into view when the select is opened.
     */
    showSelectedOptionOnOpen: {
      type: Boolean,
      default: false,
    },
    /**
     * Optionally sorts the displayed select options by their text attribute.
     */
    sortOptions: {
      type: Boolean,
      default: false,
    },
    testid: {
      type: String,
      default: null,
    },
    /**
     * Vee-validate validation types to check against.
     */
    validation: {
      type: [String, Object],
      default: '',
    },
    /**
     * Whether error validation should happen when this component renders.
     */
    validationImmediate: {
      type: Boolean,
      default: false,
    },
    /**
     * v-model value
     */
    value: {
      type: [Array, Object, Number, String, Boolean],
      default: '',
    },

  },
  setup(props, context) {
    const vms = ref(null);
    const internalId = useGetId(props);
    const isOpen = ref(false);

    const selectOptions = computed(() => {
      let formattedOptions;

      if (props.options.length && Object.hasOwnProperty.call(props.options[0], 'value')) {
        formattedOptions = [...props.options];
      } else {
        formattedOptions = props.options.map((option) => {
          const formattedOption = typeof (option) === 'string' ? option.trim() : option;
          return {
            text: formattedOption,
            value: formattedOption,
          };
        });
      }

      if (props.sortOptions) {
        formattedOptions.sort((a, b) => a.text.localeCompare(b.text));
      }
      return formattedOptions;
    });

    function setFloatLabels(isOpenArg, value) {
      if (props.floatingLabel) {
        if (props.searchable && isOpenArg && !!props.label) {
          return true;
        }
        return (!!value || value === 0) && !!props.label;
      }
      return false;
    }

    /**
     * Process value prop to match with select options
     * Checks for the option in the select options and to see if new value is actually new
     *
     * @param {Object} newVal new input value
     * @returns {Object} input value
     */
    function processValue(newVal, old) {
      if (newVal !== undefined && newVal !== null) {
        const optionBeingSet = find(selectOptions.value, { value: newVal });
        if (optionBeingSet || useValueIsDifferent(old, newVal)) {
          return optionBeingSet;
        }
      }
      return undefined;
    }

    const {
      value: inputValue, errors: fieldErrors,
    } = useField(() => `${props.name}-id-${uuid()}`, toRef(props, 'validation'), {
      validateOnMount: props.validationImmediate,
      initialValue: processValue(props.value, undefined),
      bails: false,
    });

    const hasPrependBtn = ref(Object.keys(context.slots).includes('prependButton'));
    const floatLabels = ref(setFloatLabels(isOpen.value, inputValue.value));

    const internalPlaceholder = computed(() => (props.placeholder || props.searchable ? i18n.global.t('common.typeToSearch') : ''));
    const combinedErrors = computed(() => [...props.errors, ...fieldErrors.value]);
    const classes = computed(() => [
      { 'polyfill-placeholder': floatLabels.value },
      { 'h-100': props.floatingLabel },
      { 'has-prepend-button': hasPrependBtn.value },
      { 'no-multiselect-label': !props.label },
      'form-control', 'p-0', 'text-nowrap',
    ]);

    function openHandler() {
      context.emit('open');
      isOpen.value = true;
      floatLabels.value = setFloatLabels(true, inputValue.value);
    }

    function closeHandler(value) {
      context.emit('closed');
      isOpen.value = false;
      floatLabels.value = setFloatLabels(false, value);
    }

    function inputHandler(e) {
      inputValue.value = e;
    }

    watch(() => props.options, (newOptions, oldOptions) => {
      if (props.value) {
        const oldValueObject = oldOptions.find(({ value }) => value === props.value);
        const newValueObject = newOptions.find(({ value }) => value === props.value);
        if (!oldValueObject || (newValueObject && (oldValueObject.value === newValueObject.value && oldValueObject.text !== newValueObject.text))) {
          inputValue.value = processValue(props.value, inputValue.value);
        }
      }
    }, { deep: true });

    watch(() => inputValue.value, (value) => {
      const newValue = value !== null
        && value !== undefined
        && typeof value === 'object'
        && Object.hasOwnProperty.call(value, 'value')
        ? value.value : value;

      floatLabels.value = setFloatLabels(isOpen.value, newValue);
      context.emit('input', newValue);
    });

    watch(() => props.value, (value) => {
      const newValues = processValue(value);
      if (!isEqual(inputValue.value, newValues)) {
        inputValue.value = newValues;
      }
    });

    return {
      classes,
      closeHandler,
      combinedErrors,
      fieldErrors,
      floatLabels,
      inputHandler,
      inputValue,
      internalId,
      internalPlaceholder,
      openHandler,
      selectOptions,
      vms,
    };
  },
};
</script>

<style lang="scss" scoped>
.polyfill-placeholder {
  :deep(.multiselect__tags) {
    padding: 1.1rem 50px 0.1rem 0.75rem;
  }
  :deep(.multiselect__single) {
    margin-top: 4px;
    min-height: 26px;
  }
}
</style>
