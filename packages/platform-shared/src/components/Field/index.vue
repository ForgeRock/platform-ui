<!-- Copyright (c) 2020-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div
    v-if="containsPlaceholder"
    class="fr-field"
    :id="fieldName">
    <slot name="label" />
    <slot name="appendLabel" />
    <FrBasicInput
      v-bind="attrs"
      :name="fieldName"
      type="string"
      :testid="testid"
      :value="placeholderValue"
      readonly
    />
  </div>
  <div
    v-else
    :class="[{'d-flex': booleanOrCheckbox}, 'fr-field']"
    :id="fieldName">
    <slot name="label" />
    <Component
      v-bind="attrs"
      v-on="$listeners"
      :is="component"
      :name="fieldName"
      :type="fieldType"
      :testid="testid">
      <template
        v-for="(key, slotName) in $scopedSlots"
        v-slot:[slotName]="slotData">
        <slot
          :name="slotName"
          v-bind="slotData" />
      </template>
    </Component>
    <slot name="appendLabel" />
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
import FrSelect from '@forgerock/platform-shared/src/components/Field/Select';
import FrSelectWithActions from '@forgerock/platform-shared/src/components/Field/SelectWithActions';
import FrSpinButton from '@forgerock/platform-shared/src/components/Field/SpinButton';
import FrSwitch from '@forgerock/platform-shared/src/components/Field/Switch';
import FrTag from '@forgerock/platform-shared/src/components/Field/Tag';
import FrTextArea from '@forgerock/platform-shared/src/components/Field/TextArea';
import FrTimeInput from '@forgerock/platform-shared/src/components/Field/TimeInput';

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
    FrSelect,
    FrSelectWithActions,
    FrSpinButton,
    FrSwitch,
    FrTag,
    FrTextArea,
    FrTimeInput,
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
  },
  computed: {
    attrs() {
      return { ...this.$options.propsData, ...this.$attrs };
    },
    booleanOrCheckbox() {
      return this.fieldType === 'boolean' || this.fieldType === 'checkbox';
    },
    component() {
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
        select: 'FrSelect',
        selectWithActions: 'FrSelectWithActions',
        spinbutton: 'FrSpinButton',
        string: 'FrBasicInput',
        tag: 'FrTag',
        textarea: 'FrTextArea',
        time: 'FrTimeInput',
      };
      return componentMap[this.fieldType];
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
  updated() {
    this.hasPlaceholder();
  },
  created() {
    /**
     * RegExp to determine if a property is a placeholder
     * must be a string with numbers/letters/fullstops and enclosed by &{}
     */
    this.PLACEHOLDER_REGEX = new RegExp(/^([\w '"",.:/$£@]+)?(&{(([\w])+(.[\w]+)*)})([\w '"",.:/$£@]+)?$/);
    this.hasPlaceholder();
  },
  methods: {
    hasPlaceholder() {
      this.containsPlaceholder = false;
      this.placeholderValue = this.attrs.value;
      if (this?.attrs?.value) {
        if (typeof this.attrs.value === 'object' && Object.values(this.attrs.value)[0]) {
          this.containsPlaceholder = Object.values(this.attrs.value).some((value) => this.PLACEHOLDER_REGEX.test(value));
          this.getPlaceHolderValue();
        }

        if (typeof this.attrs.value !== 'object') {
          this.containsPlaceholder = this.PLACEHOLDER_REGEX.test(this.attrs.value);
        }
      }
      return this.containsPlaceholder;
    },
    getPlaceHolderValue() {
      if (this.containsPlaceholder) {
        this.placeholderValue = Object.values(this.attrs.value)[0]?.toString();
      }
    },
  },
};
</script>
