<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <template v-if="dropdownWithinInput === false">
      <div class="d-flex">
        <Component
          v-bind="$attrs"
          v-on="$listeners"
          :type="type"
          :is="innerComponent">
          <template
            v-for="(key, slotName) in $scopedSlots"
            #[slotName]="slotData">
            <slot
              :name="slotName"
              v-bind="slotData" />
          </template>
        </Component>
        <FrEsvDropdown
          :field-type="type"
          @esv-selected="handlePlaceholderEntered" />
      </div>
    </template>
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
import {
  coercePlaceholderByType,
} from '@forgerock/platform-shared/src/utils/esvUtils';
import FrEsvDropdown from '../EsvDropdown';

/**
 * Component for providing a version of an input which allows ESV placeholders to be chosen as values.
 * This is typically done by adding a new control either alongside or inside the relevant input (via a slot).
 */
export default {
  name: 'FrEsvInputWrapper',
  components: {
    FrEsvDropdown,
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
    /**
     * Field component to be wrapped
     */
    innerComponent: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      dropdownWithinInput: this.isDropdownWithinInput(this.type),
    };
  },
  methods: {
    /**
     * Determines whether the ESV dropdown should be shown inside or beside the wrapped component
     */
    isDropdownWithinInput(fieldType) {
      let dropdownWithinInput;
      switch (fieldType) {
        case 'string':
        case 'text':
        case 'password':
          dropdownWithinInput = true;
          break;
        case 'checkbox':
          dropdownWithinInput = false;
          break;
        default:
          dropdownWithinInput = false;
          break;
      }

      return dropdownWithinInput;
    },
    /**
     * Handles a placeholder value being entered or chosen by wrapping the value in a coercion function and notifying the parent of the wrapped value
     * @param {Object} placeholder the placeholder value
     */
    handlePlaceholderEntered(placeholder) {
      const coercedPlaceholder = coercePlaceholderByType(this.type, placeholder);
      this.$emit('input', coercedPlaceholder);
    },
  },
};
</script>
