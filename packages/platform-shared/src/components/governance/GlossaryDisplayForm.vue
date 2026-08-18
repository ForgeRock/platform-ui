<!-- Copyright (c) 2024-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrSpinner
    v-if="isLoading"
    class="py-3" />
  <BRow v-else>
    <template
      v-for="(prop, index) in glossaryData"
      :key="`prop-${index}`">
      <dt
        :data-testid="`prop-${index}`"
        class="col-lg-4">
        {{ prop.name }}
      </dt>
      <dd
        :data-testid="`prop-value-${index}`"
        class="col-lg-8 mb-4">
        {{ prop.value }}
      </dd>
    </template>
  </BRow>
</template>

<script setup>
import { BRow } from 'bootstrap-vue';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import { ref, watch } from 'vue';
import { getResourceDisplayData } from '@forgerock/platform-shared/src/utils/governance/resource';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';

/**
 * Display the glossary data
 */

const props = defineProps({
  displayData: {
    type: Object,
    default: () => ({}),
  },
  glossarySchema: {
    type: Array,
    default: () => ([]),
  },
  glossaryValues: {
    type: Object,
    default: () => ({}),
  },
});

const glossaryData = ref([]);
const isLoading = ref(false);

/**
 * Resolves a managed object ref to a display string using displayData first,
 * falling back to a live API call.
 */
async function resolveRef(resourceRef, managedObjectType) {
  const entry = props.displayData?.[resourceRef];
  if (entry) {
    if (entry.givenName || entry.sn) return `${entry.givenName || ''} ${entry.sn || ''}`.trim();
    if (entry.name) return entry.name;
  }
  return getResourceDisplayData(managedObjectType, resourceRef);
}

/**
 * Initialize the glossary data
 */
async function init() {
  isLoading.value = true;
  const schema = props.glossarySchema;

  const promises = schema.map(async (prop) => {
    const propValue = props.glossaryValues[prop.name];
    const name = prop.displayName || prop.name;
    let value = propValue || blankValueIndicator;

    if (prop.type === 'managedObject' && propValue) {
      const refs = Array.isArray(propValue) ? propValue : [propValue];
      const resolved = await Promise.all(refs.map((r) => resolveRef(r, prop.managedObjectType)));
      value = resolved.join(', ');
    }

    return { name, value };
  });

  const glossData = await Promise.all(promises);
  glossaryData.value = glossData.sort((a, b) => a.name.localeCompare(b.name));
  isLoading.value = false;
}

init();

watch(() => props.displayData, (newVal) => {
  if (newVal && Object.keys(newVal).length > 0) init();
});
</script>
