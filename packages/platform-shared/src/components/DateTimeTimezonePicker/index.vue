<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="datetime-timezone-picker">
    <FrField
      v-model="dateModel"
      class="datetime-timezone-picker__datetime"
      type="datetime"
      :adjust-for-timezone="adjustForTimezone"
      :disabled="disabled"
      :label="label"
      :name="name"
      :show-seconds="showSeconds"
      :validation="validation" />
    <FrTimezoneOffsetSelect
      v-if="timezoneSelect"
      v-model="timezoneModel"
      class="datetime-timezone-picker__timezone"
      :disabled="disabled"
      :label="timezoneLabel" />
    <FrTimezoneOffset
      v-else
      v-model="timezoneModel"
      class="datetime-timezone-picker__timezone"
      :disabled="disabled"
      :display-help-text="displayHelpText"
      :placeholder="timezoneLabel" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrTimezoneOffset from '@forgerock/platform-shared/src/components/TimezoneOffset';
import FrTimezoneOffsetSelect from '@forgerock/platform-shared/src/components/TimezoneOffsetSelect';

defineOptions({
  name: 'DateTimeTimezonePicker',
});

const props = defineProps({
  /**
   * @model Local datetime string from the date and time pickers,
   * e.g. '2026-10-01T09:00'. Empty string when nothing is picked.
   */
  date: {
    type: String,
    default: '',
  },
  /**
   * @model Time zone offset in hours (-12 to +14, in 0.25 steps), used by the
   * caller to convert the picked datetime to UTC.
   */
  timezone: {
    type: Number,
    default: 0,
  },
  label: {
    type: String,
    default: '',
  },
  /**
   * Label for the time zone picker; floats inside its box.
   */
  timezoneLabel: {
    type: String,
    default: '',
  },
  /**
   * Render the time zone picker as a select dropdown of common zones (UTC
   * default) instead of the GMT offset slider.
   */
  timezoneSelect: {
    type: Boolean,
    default: false,
  },
  name: {
    type: String,
    default: '',
  },
  /**
   * Validation rules for the datetime, forwarded to the inner FrField
   * (e.g. 'required' or an { is_after_date: {...} } object).
   */
  validation: {
    type: [String, Object],
    default: '',
  },
  /**
   * Must stay false whenever the datetime is paired with a time zone picker,
   * so the emitted value is not adjusted for the browser's time zone and the
   * caller can convert to UTC with the selected offset.
   */
  adjustForTimezone: {
    type: Boolean,
    default: false,
  },
  showSeconds: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  displayHelpText: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['update:date', 'update:timezone']);

const dateModel = computed({
  get: () => props.date,
  set: (value) => emit('update:date', value),
});

const timezoneModel = computed({
  get: () => props.timezone,
  set: (value) => emit('update:timezone', value),
});
</script>

<style lang="scss" scoped>
.datetime-timezone-picker {
  &__datetime {
    width: 60%;
  }

  // Sits on its own row below the datetime, left-aligned with the date input.
  // The 5px subtraction matches the date input: the datetime's internal
  // form-row gutters leave each of its inputs at 30% - 5px.
  &__timezone {
    width: calc(30% - 5px);
    margin-top: 1rem;
  }
}
</style>
