<!-- Copyright (c) 2020-2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div
    :class="[{'d-flex': booleanOrCheckbox}, 'fr-field']"
    :id="fieldName">
    <slot name="label" />
    <Component
      v-bind="attrs"
      v-on="$listeners"
      :is="component"
      :name="fieldName"
      :type="fieldType">
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
import FrKeyValueList from '@forgerock/platform-shared/src/components/Field/KeyValueList';
import FrMultiselect from '@forgerock/platform-shared/src/components/Field/Multiselect';
import FrSelect from '@forgerock/platform-shared/src/components/Field/Select';
import FrSelectWithActions from '@forgerock/platform-shared/src/components/Field/SelectWithActions';
import FrSpinButton from '@forgerock/platform-shared/src/components/Field/SpinButton';
import FrSwitch from '@forgerock/platform-shared/src/components/Field/Switch';
import FrTag from '@forgerock/platform-shared/src/components/Field/Tag';
import FrTextArea from '@forgerock/platform-shared/src/components/Field/TextArea';
import FrJsonInput from '@forgerock/platform-shared/src/components/Field/JsonInput';

export default {
  name: 'FrField',
  components: {
    FrBasicInput,
    FrCheckbox,
    FrKeyValueList,
    FrMultiselect,
    FrSelect,
    FrSelectWithActions,
    FrSpinButton,
    FrSwitch,
    FrTag,
    FrTextArea,
    FrJsonInput,
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
        json: 'FrJsonInput',
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
};
</script>
