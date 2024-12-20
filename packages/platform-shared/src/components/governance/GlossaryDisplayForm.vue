<!-- Copyright (c) 2024-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BRow>
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
import { ref } from 'vue';
import { getResourceDisplayData } from '@forgerock/platform-shared/src/utils/governance/resource';

/**
 * Display the glossary data
 */

const props = defineProps({
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

/**
 * Initialize the glossary data
 */
async function init() {
  const schema = props.glossarySchema;

  // map all items in the schema to have a name and value
  const promises = schema.map(async (prop) => {
    const propValue = props.glossaryValues[prop.name];
    const name = prop.displayName || prop.name;
    let value = propValue || blankValueIndicator;

    // if the value is a managed object, get the display data from the API
    if (prop.type === 'managedObject' && propValue) {
      value = await getResourceDisplayData(prop.managedObjectType, propValue);
    }

    return {
      name,
      value,
    };
  });

  glossaryData.value = await Promise.all(promises);
}

init();
</script>
