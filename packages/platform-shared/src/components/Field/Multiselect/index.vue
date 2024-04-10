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
      v-if="selectOptions"
      track-by="multiselectId"
      :data-testid="testid"
      :testid="testid"
      ref="vms"
      :id="internalId"
      :model-value="inputValue"
      @update:modelValue="inputHandler"
      :class="classes"
      :close-on-select="closeOnSelect"
      :disabled="disabled"
      :hide-selected="true"
      :multiple="true"
      :name="name"
      :option-height="optionHeightCalculation"
      :options="selectOptions"
      :placeholder="defaultPlaceholder"
      :searchable="defaultSearchable"
      :internal-search="internalSearch"
      :show-labels="false"
      :tag-placeholder="$t('common.placeholders.addOption')"
      :taggable="taggable"
      :autofocus="autofocus"
      label="text"
      :combobox-labelledby="inputLabelledby"
      @close="closeHandler"
      @open="openHandler"
      @search-change="searchChange"
      @tag="addTag">
      <template #noResult>
        {{ $t('common.noResult') }}
      </template>
      <template
        v-for="(key, slotName) in $slots"
        #[slotName]="slotData">
        <!-- @slot pass-through slot -->
        <slot
          :name="slotName"
          v-bind="slotData" />
      </template>
    </FrMultiselectBase>
    <template
      v-for="(key, slotName) in $slots"
      #[slotName]="slotData">
      <!-- @slot pass-through slot -->
      <slot
        :name="slotName"
        v-bind="slotData" />
    </template>
  </FrInputLayout>
</template>

<script>
import {
  find,
  has,
  map,
  isEqual,
} from 'lodash';
import { useField } from 'vee-validate';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin/';
import {
  toRef, ref, computed, watch,
} from 'vue';
import uuid from 'uuid/v4';
import i18n from '@/i18n';
import FrMultiselectBase from '../../MultiselectBase/MultiselectBase';
import FrInputLayout from '../Wrapper/InputLayout';
import { useGetId } from '../Wrapper/InputComposable';

export default {
  name: 'MultiSelect',
  mixins: [NotificationMixin],
  components: {
    FrInputLayout,
    FrMultiselectBase,
  },
  props: {
    /**
     * Autofocus field when rendered.
     */
    autofocus: {
      type: Boolean,
      default: false,
    },
    /**
     * Enable/disable closing after selecting an option
     */
    closeOnSelect: {
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
      default: () => [],
    },
    /**
     * Placeholder text
     */
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
    /**
     * Allow searching
     */
    searchable: {
      type: Boolean,
      default: true,
    },
    /**
     * Allow tagging
     */
    taggable: {
      type: Boolean,
      default: false,
    },
    testid: {
      type: String,
      default: '',
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
    /**
     * CSS class for selected values
     */
    valueClass: {
      type: String,
      default: '',
    },
  },
  setup(props, context) {
    const internalId = useGetId(props);

    const nextIdTag = ref(0);
    const tagOptions = ref([]);

    /**
     * Generate a unique id for a tag
     *
     * @returns tag id
     */
    function generateTagId() {
      const popIdTag = nextIdTag.value;
      nextIdTag.value += 1;
      return popIdTag;
    }

    function setFloatLabels(isOpen, value) {
      if (props.floatingLabel) {
        if (props.searchable && isOpen) {
          return true;
        }
        return value.length > 0 && !!props.label;
      }
      return false;
    }

    const selectOptions = computed(() => {
      let mapOptions = [];
      if (props.options.length) {
        if (has(props.options[0], 'value')) {
          mapOptions = map(props.options, (option) => ({
            text: option.text,
            value: option.value,
            multiselectId: option.multiselectId !== undefined ? option.multiselectId : generateTagId(),
            ...option,
          }));
        } else {
          mapOptions = map(props.options, (option) => ({
            text: option,
            value: option,
            multiselectId: generateTagId(),
          }));
        }
      }
      return [...mapOptions, ...tagOptions.value];
    });
    /**
     * Process value prop to match with existing values
     * Checks for the option in the select options and to see if new value is actually new
     *
     * @param {Object} newVal new input value
     * @returns {Object} input value
     */
    function processValue(value) {
      let newInputValue = [...value];
      if (!has(newInputValue[0], 'value')) {
        newInputValue = map(value, (val) => find(selectOptions.value, { value: val }));
      }
      return newInputValue;
    }

    const {
      value: inputValue, errors: fieldErrors,
    } = useField(() => `${props.name}-id-${uuid()}`, toRef(props, 'validation'), {
      validateOnMount: props.validationImmediate,
      initialValue: processValue(props.value),
      bails: false,
    });
    const combinedErrors = computed(() => [...props.errors, ...fieldErrors.value]);
    const floatLabels = ref(setFloatLabels(false, inputValue.value));
    const searchValue = ref('');

    const classes = computed(() => [
      { 'polyfill-placeholder': floatLabels.value },
      { 'h-100': props.floatingLabel },
      { 'no-multiselect-label': !props.label },
      'form-control',
      'p-0',
    ]);

    const defaultSearchable = computed(() => props.searchable || props.selectOptions.length > 9);

    const defaultPlaceholder = computed(() => props.placeholder || i18n.global.t('common.typeToSearch'));

    const isOpen = ref(false);
    /**
     * @description focus the Vue Multi Select component (vms) and floats the label
     * Also scrolls the selected option into view if showSelectedOptionOnOpen is true
     */
    function openHandler() {
      context.emit('open');
      isOpen.value = true;
      floatLabels.value = setFloatLabels(isOpen.value, inputValue.value);
    }

    function closeHandler() {
      context.emit('closed');
      isOpen.value = false;
      floatLabels.value = setFloatLabels(isOpen.value, inputValue.value);
    }

    function inputHandler(e) {
      inputValue.value = e;
    }
    /**
     * Handler for when the user types in the search input.
     * Track the value and bubble the event up.
     *
     * @param {String} value search text
     */
    function searchChange(value) {
      searchValue.value = value;
      context.emit('search-change', value);
    }

    function addTag() {
      if (props.taggable && searchValue.value.length > 0) {
        searchValue.value.split(',').forEach((untrimmedVal) => {
          const newVal = untrimmedVal.trim();
          const existsInCurrentValues = find(inputValue.value, { value: newVal });
          if (!existsInCurrentValues) {
            tagOptions.value.push({
              multiselectId: generateTagId(), text: newVal, value: newVal,
            });
            inputValue.value.push({
              multiselectId: generateTagId(), text: newVal, value: newVal,
            });
            context.emit('input', map(inputValue.value, 'value'));
          }
        });
      }
    }

    watch(() => inputValue.value, (value) => {
      floatLabels.value = setFloatLabels(isOpen.value, inputValue.value);
      context.emit('input', map(value, 'value'));
    });

    watch(() => props.value, (value) => {
      const newValues = processValue(value);
      if (!isEqual(inputValue.value, newValues)) {
        inputValue.value = newValues;
      }
    });

    return {
      addTag,
      classes,
      closeHandler,
      combinedErrors,
      defaultPlaceholder,
      defaultSearchable,
      fieldErrors,
      inputHandler,
      inputValue,
      internalId,
      openHandler,
      searchChange,
      selectOptions,
    };
  },
};
</script>

<style lang="scss" scoped>
:deep .polyfill-placeholder {
  .multiselect__tags {
    padding: 1.1rem 50px 0.1rem 0.75rem;
    }
}
</style>
