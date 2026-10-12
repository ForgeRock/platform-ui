<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrField
    v-model="offsetModel"
    type="select"
    :label="placeholder"
    :name="name"
    :options="options"
    :searchable="false" />
</template>

<script setup>
import { computed } from 'vue';
import FrField from '@forgerock/platform-shared/src/components/Field';
import i18n from '@/i18n';

/**
 * Common UTC offsets, UTC first. Values are offset hours (the same numeric
 * contract as the TimezoneOffset slider), so a picked local datetime converts
 * to UTC by subtracting the value. Abbreviations are fixed offsets — they do
 * not shift with daylight saving — and the GMT text disambiguates them.
 * Labels live under common.timezoneOffsets in the shared en.json.
 */
const OPTIONS = [
  { key: 'utc', value: 0 },
  { key: 'hst', value: -10 },
  { key: 'akst', value: -9 },
  { key: 'pst', value: -8 },
  { key: 'mst', value: -7 },
  { key: 'cst', value: -6 },
  { key: 'est', value: -5 },
  { key: 'brt', value: -3 },
  { key: 'gmt', value: 0 },
  { key: 'cet', value: 1 },
  { key: 'eet', value: 2 },
  { key: 'msk', value: 3 },
  { key: 'gst', value: 4 },
  { key: 'pkt', value: 5 },
  { key: 'ist', value: 5.5 },
  { key: 'ict', value: 7 },
  { key: 'sgt', value: 8 },
  { key: 'jst', value: 9 },
  { key: 'aest', value: 10 },
  { key: 'nzst', value: 12 },
];

const props = defineProps({
  /**
   * @model Offset in hours (-12 to +14, in 0.25 steps)
   */
  value: {
    type: Number,
    default: 0,
  },
  /**
   * Label that floats inside the select.
   */
  placeholder: {
    type: String,
    default: '',
  },
  name: {
    type: String,
    default: 'timezoneOffset',
  },
});

const emit = defineEmits(['input']);

/**
 * Builds the select options, translating each zone abbreviation so locale
 * switches are picked up.
 * @returns {Array<{text: String, value: Number}>} FrField select options
 */
function buildOptions() {
  return OPTIONS.map(({ key, value }) => ({
    text: i18n.global.t(`common.timezoneOffsets.${key}`),
    value,
  }));
}

const options = computed(buildOptions);

const offsetModel = computed({
  get: () => props.value,
  set: (value) => emit('input', value),
});
</script>
