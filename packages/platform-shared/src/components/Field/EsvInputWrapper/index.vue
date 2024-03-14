<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="esv-input-wrapper">
    <template v-if="dropdownWithinInput">
      <Component
        v-bind="$attrs"
        v-on="$listeners"
        :type="type"
        :is="innerComponent">
        <template
          v-for="(key, slotName) in $slots"
          #[slotName]="slotData">
          <slot
            :name="slotName"
            v-bind="slotData" />
        </template>
        <template #prependButton>
          <FrEsvDropdown
            class="within-input-button"
            is-within-input
            :field-type="originalType"
            @esv-selected="handlePlaceholderEntered" />
        </template>
      </Component>
    </template>
    <template v-else>
      <div class="d-flex">
        <Component
          v-bind="$attrs"
          v-on="$listeners"
          :type="type"
          :is="innerComponent">
          <template
            v-for="(key, slotName) in $slots"
            #[slotName]="slotData">
            <slot
              :name="slotName"
              v-bind="slotData" />
          </template>
        </Component>
        <FrEsvDropdown
          :field-type="originalType"
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
import FrMultiselectDeprecated from '@forgerock/platform-shared/src/components/Field/MultiselectDeprecated';
import FrSelectInputDeprecated from '@forgerock/platform-shared/src/components/Field/SelectInputDeprecated';
import FrSelectWithActions from '@forgerock/platform-shared/src/components/Field/SelectWithActions';
import FrSpinButton from '@forgerock/platform-shared/src/components/Field/SpinButton';
import FrSwitch from '@forgerock/platform-shared/src/components/Field/Switch';
import FrTag from '@forgerock/platform-shared/src/components/Field/Tag';
import FrTextArea from '@forgerock/platform-shared/src/components/Field/TextArea';
import FrTimeInput from '@forgerock/platform-shared/src/components/Field/TimeInput';
import { coercePlaceholderByType } from '@forgerock/platform-shared/src/utils/esvUtils';
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
    FrMultiselectDeprecated,
    FrSelectInputDeprecated,
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
    /**
     * Original type of field, before it has been transformed in to fieldType in
     * the field component
     */
    originalType: {
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
        case 'number':
        case 'integer':
        case 'select':
        case 'selectWithActions':
        case 'tag':
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
      const coercedPlaceholder = coercePlaceholderByType(this.originalType, placeholder);
      this.$emit('input', coercedPlaceholder);
    },
  },
};
</script>

<style lang="scss" scoped>
// Fix for text input with esv dropdown having no border radius on the right hand side
.esv-input-wrapper :deep(.form-label-group input[type="text"]:not(.password-visible)) {
  border-top-right-radius: $border-radius !important;
  border-bottom-right-radius: $border-radius !important;
}

.esv-input-wrapper :deep(.form-label-group) {
  &:hover,
  &:active,
  &:focus,
  &:focus-within {
    input[type="text"] {
      border-top-right-radius: 0 !important;
      border-bottom-right-radius: 0 !important;
    }
  }
}

.esv-input-wrapper :deep(.b-dropdown) {
  display: none;
}

.esv-input-wrapper {
  &:hover,
  &:active,
  &:focus,
  &:focus-within {
    :deep(.b-dropdown) {
      display: inline-flex;
    }
  }
}

:deep(.field-type-checkbox.dropdown .btn) {
  height: 23px;
}

:deep(.field-type-selectWithActions) {
  top: 14px;
}

:deep(.field-type-select) {
  top: 12px;
}

:deep(.field-type-selectWithActions .btn),
:deep(.field-type-select .btn) {
  padding: 0 0.25rem !important;
  margin-right: 0.75rem;
}

.form-label-group:focus-within {
   .input-buttons:not(:focus-within) .within-input-button:not(.field-type-selectWithActions):not(.field-type-select):not(.field-type-array) :deep(.btn) {
        border-color: $primary !important;
        clip-path: inset(-1px -1px -1px 0px) !important;
        box-shadow: 0 0 0 0.0625rem $primary !important;
   }
   &.fr-field-error .input-buttons:not(:focus-within) .within-input-button:not(.field-type-selectWithActions):not(.field-type-select):not(.field-type-array) :deep(.btn) {
        border-color: $danger !important;
        clip-path: inset(-1px -1px -1px 0px) !important;
        box-shadow: 0 0 0 0.0625rem $danger !important;
   }
}
</style>
