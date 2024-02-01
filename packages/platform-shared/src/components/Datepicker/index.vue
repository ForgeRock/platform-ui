<!-- Copyright (c) 2020-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BFormDatepicker
    data-testid="datepicker"
    v-model="inputValue"
    v-bind="$attrs"
    v-on="$listeners"
    hide-header
    label-help=""
    menu-class="shadow-lg"
    :class="{'input-has-value': value, 'fr-field-error': errors.length > 0}"
    :label-selected="placeholder"
    :placeholder="placeholder">
    <template #button-content>
      <FrIcon
        name="calendar_today"
      />
    </template>
    <template #nav-prev-year>
      <FrIcon
        name="first_page"
      />
    </template>
    <template #nav-prev-month>
      <FrIcon
        name="chevron_left"
      />
    </template>
    <template #nav-this-month>
      <FrIcon
        name="calendar_today"
      />
    </template>
    <template #nav-next-month>
      <FrIcon
        name="chevron_right"
      />
    </template>
    <template #nav-next-year>
      <FrIcon
        name="last_page"
      />
    </template>
  </BFormDatepicker>
  <FrValidationError
    class="error-messages flex-grow-1"
    :validator-errors="errors" />
</template>

<script>
import {
  BFormDatepicker,
} from 'bootstrap-vue';

import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrValidationError from '@forgerock/platform-shared/src/components/ValidationErrorList';
import { useField } from 'vee-validate';
import { toRef } from 'vue';
import uuid from 'uuid/v4';

/**
 * Bootstrap datepicker with custom icons, default values set.
 */
export default {
  name: 'Datepicker',
  components: {
    BFormDatepicker,
    FrIcon,
    FrValidationError,
  },
  props: {
    /**
     * @model String representation of date. Format YYYY-MM-DD
     */
    value: {
      type: String,
      default: '',
    },
    /**
     * Text label. Floats when a value is selected.
     */
    placeholder: {
      type: String,
      default: '',
    },
    /* Vee-validate validation types to check against
    */
    validation: {
      type: [String, Object],
      default: '',
    },
    /**
     * Whether error validation should happen when this component renders
     */
    validationImmediate: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      required: true,
      default: () => uuid(),
    },
  },
  setup(props) {
    const {
      value: inputValue, errors,
    } = useField(() => `${props.name}-id-${uuid()}`, toRef(props, 'validation'), { validateOnMount: props.validationImmediate, initialValue: props.value });

    return {
      inputValue, errors,
    };
  },
  watch: {
    inputValue(newValue) {
      this.$emit('input', newValue);
    },
  },
};
</script>

<style lang="scss" scoped>
.fr-field-error {
  border: 1px solid $red !important;
}
// floating label support
.input-has-value {
  :deep(label) {
    padding-top: 1.25rem;
    padding-bottom: 0.25rem;
    position: relative;

    .sr-only {
      width: auto;
      height: auto;
      padding-top: 0.25rem;
      padding-bottom: 0.25rem;
      margin: 0;
      overflow: hidden;
      clip: auto;
      top: 0;
      left: 0.25rem;
      font-size: 12px;
      color: $gray-600;
    }
  }
}

// remove blue border of calendar grid
.b-form-datepicker {
  :deep(.form-control) {
    border: none;
    box-shadow: none;
    overflow: hidden;
  }
}

:deep(.b-calendar-grid-help) {
  border-top: none !important;
}

.dropdown {
  padding: 0;
}
</style>
