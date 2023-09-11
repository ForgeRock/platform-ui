<!-- Copyright (c) 2020-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div
    :class="[{'d-flex': booleanOrCheckbox}, 'fr-field']"
    :id="fieldName"
    :data-testid="`fr-field-${fieldName}`">
    <slot
      v-if="!checkboxField"
      name="label"
      :is-inline-label="checkboxField" />
    <Component
      v-bind="attrs"
      v-on="$listeners"
      :is="component"
      :name="fieldName"
      :type="fieldType"
      :original-type="type"
      :inner-component="innerComponent"
      :testid="testid"
      @input="valueUpdated">
      <template
        v-for="(key, slotName) in $scopedSlots"
        #[slotName]="slotData">
        <slot
          :name="slotName"
          v-bind="slotData" />
      </template>
    </Component>
  </div>
</template>

<script>
import FrBasicInput from '@forgerock/platform-shared/src/components/Field/BasicInput';
import FrCheckbox from '@forgerock/platform-shared/src/components/Field/Checkbox';
import FrDateInput from '@forgerock/platform-shared/src/components/Field/DateInput';
import FrDateTimeInput from '@forgerock/platform-shared/src/components/Field/DateTimeInput';
import FrDurationInput from '@forgerock/platform-shared/src/components/Field/DurationInput';
import FrJsonInput from '@forgerock/platform-shared/src/components/Field/JsonInput';
import FrKeyValueList from '@forgerock/platform-shared/src/components/Field/KeyValueList';
import FrMultiselect from '@forgerock/platform-shared/src/components/Field/Multiselect';
import FrSelectInput from '@forgerock/platform-shared/src/components/Field/SelectInput';
import FrSelectWithActions from '@forgerock/platform-shared/src/components/Field/SelectWithActions';
import FrSpinButton from '@forgerock/platform-shared/src/components/Field/SpinButton';
import FrSwitch from '@forgerock/platform-shared/src/components/Field/Switch';
import FrTag from '@forgerock/platform-shared/src/components/Field/Tag';
import FrTextArea from '@forgerock/platform-shared/src/components/Field/TextArea';
import FrTimeInput from '@forgerock/platform-shared/src/components/Field/TimeInput';
import FrReadonlyPlaceholderInput from '@forgerock/platform-shared/src/components/Field/ReadonlyPlaceholderInput';
import FrEsvInputWrapper from '@forgerock/platform-shared/src/components/Field/EsvInputWrapper';
import {
  doesValueContainPlaceholder,
  isFieldTypeSupportedForPlaceholderEntry,
} from '@forgerock/platform-shared/src/utils/esvUtils';

export default {
  name: 'FrField',
  components: {
    FrBasicInput,
    FrCheckbox,
    FrDateInput,
    FrDateTimeInput,
    FrDurationInput,
    FrJsonInput,
    FrKeyValueList,
    FrMultiselect,
    FrSelectInput,
    FrSelectWithActions,
    FrSpinButton,
    FrSwitch,
    FrTag,
    FrTextArea,
    FrTimeInput,
    FrReadonlyPlaceholderInput,
    FrEsvInputWrapper,
  },
  props: {
    name: {
      type: String,
      default: '',
    },
    /**
     * Available types: string/text, textarea, password, number/integer,
     * select, selectWithActions, multiselect, tag/array, boolean, checkbox, object.
     */
    type: {
      type: String,
      default: 'string',
    },
    testid: {
      type: String,
      default: '',
    },
    id: {
      type: String,
      default: '',
      required: false,
    },
    /**
     * Defines whether extended field behaviour for entering ESV placeholders should be exposed
     */
    canEnterPlaceholders: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      fieldContainsPlaceholder: doesValueContainPlaceholder(this.$attrs.value),
    };
  },
  watch: {
    // eslint-disable-next-line object-shorthand
    '$attrs.value'(newValue) {
      this.valueUpdated(newValue);
    },
  },
  computed: {
    attrs() {
      return { ...this.$options.propsData, ...this.$attrs };
    },
    checkboxField() {
      if (this.fieldContainsPlaceholder) return false;
      return this.fieldType === 'checkbox';
    },
    booleanOrCheckbox() {
      if (this.fieldContainsPlaceholder) return false;
      return this.fieldType === 'boolean' || this.fieldType === 'checkbox';
    },
    /**
     * Top level component to be rendered by the Field
     */
    component() {
      if (this.fieldContainsPlaceholder) {
        return 'FrReadonlyPlaceholderInput';
      }
      if (this.canEnterPlaceholders && isFieldTypeSupportedForPlaceholderEntry(this.type)) {
        return 'FrEsvInputWrapper';
      }
      return this.determineInputComponent();
    },
    /**
     * Component to be displayed together with extended ESV functionality when placeholders can be entered
     */
    innerComponent() {
      if (!this.fieldContainsPlaceholder && this.canEnterPlaceholders) {
        return this.determineInputComponent();
      }
      return undefined;
    },
    fieldName() {
      return this.name || this.$attrs.label;
    },
    /**
     * Maps type aliases to known values
     *
     * @returns {String} Final field type
     */
    fieldType() {
      const typeMap = {
        text: 'string',
        array: 'tag',
        integer: 'number',
      };
      if (typeMap[this.type]) {
        return typeMap[this.type];
      }
      return this.type;
    },
  },
  methods: {
    valueUpdated(newVal) {
      // Only check value changes for placeholders in when the value can contain a placeholder change
      if (this.component === 'FrReadonlyPlaceholderInput' || this.canEnterPlaceholders) {
        this.fieldContainsPlaceholder = doesValueContainPlaceholder(newVal);
      }
    },
    determineInputComponent() {
      const componentMap = {
        boolean: 'FrSwitch',
        checkbox: 'FrCheckbox',
        date: 'FrDateInput',
        datetime: 'FrDateTimeInput',
        duration: 'FrDurationInput',
        json: 'FrJsonInput',
        multiselect: 'FrMultiselect',
        number: 'FrBasicInput',
        object: 'FrKeyValueList',
        password: 'FrBasicInput',
        select: 'FrSelectInput',
        selectWithActions: 'FrSelectWithActions',
        spinbutton: 'FrSpinButton',
        string: 'FrBasicInput',
        tag: 'FrTag',
        textarea: 'FrTextArea',
        time: 'FrTimeInput',
      };
      return componentMap[this.fieldType];
    },
  },
};
</script>
