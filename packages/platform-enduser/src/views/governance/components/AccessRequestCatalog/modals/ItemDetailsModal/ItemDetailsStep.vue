<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <FrSpinner
      v-if="!isLoaded"
      class="my-3" />
    <template v-else>
      <!-- Description field (for all types) -->
      <BRow>
        <BCol>
          <small class="mb-1 h5">{{ $t('common.description') }}</small>
          <p
            class="mb-4"
            data-testid="description">
            {{ item.description || blankValueIndicator }}
          </p>
        </BCol>
      </BRow>

      <!-- Dynamic glossary fields -->
      <BRow data-testid="glossary-fields">
        <BCol
          md="6"
          class="mb-4"
          v-for="(glossary, key) in glossaryValues"
          :key="key">
          <small
            class="mb-1 h5"
            :data-testid="`glossary-title-${key}`">
            {{ glossary.displayName }}
          </small>
          <p :data-testid="`glossary-item-${key}`">
            {{ glossary.value }}
          </p>
        </BCol>
      </BRow>
    </template>
  </div>
</template>

<script setup>
/**
 * Component to show the details of an item in the ItemDetailsModal.
 */
import { computed, ref, watch } from 'vue';
import {
  isEmpty,
} from 'lodash';
import {
  BCol,
  BRow,
} from 'bootstrap-vue';
import { getResource } from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';
import i18n from '@/i18n';

// data
const glossaryValues = ref({});

const props = defineProps({
  glossarySchema: {
    type: Array,
    default: () => [],
  },
  item: {
    type: Object,
    default: () => ({}),
  },
});

const isLoaded = computed(() => {
  let allFieldsLoaded = true;
  Object.values(glossaryValues.value).forEach((value) => {
    if (!value.isLoaded) allFieldsLoaded = false;
  });
  return allFieldsLoaded;
});

/**
 * Retrieves the display data for a specific resource.
 *
 * @param {string} resourceType - The type of the resource. application, role, user, org
 * @param {string} id - The ID of the resource.
 * @returns {Promise} - A promise that resolves to the display data of the resource.
 */
async function getResourceDisplayData(resourceType, id) {
  try {
    const { data } = await getResource(resourceType, { queryString: id });
    if (resourceType === 'user') {
      const user = data.result[0];
      return Promise.resolve(i18n.global.t('common.userFullName', {
        givenName: user.givenName,
        sn: user.sn,
      }));
    }
    return Promise.resolve(data.result[0].name);
  } catch {
    return Promise.resolve(id);
  }
}

/**
 * Sets the value of a glossary property.
 *
 * @param {string} propertyName - The name of the glossary property.
 * @param {any} value - The value to set for the glossary property.
 */
function setGlossaryValue(propertyName, value) {
  glossaryValues.value[propertyName].value = value;
  glossaryValues.value[propertyName].isLoaded = true;
}

/**
 * Sets the glossary values based on the provided schema and values.
 *
 * @param {Object} glossarySchema - The schema object defining the glossary.
 * @param {Object} values - The values to be set in the glossary.
 */
async function setGlossaryValues(glossarySchema, values) {
  glossarySchema.forEach(async (glossaryItem) => {
    const propertyName = glossaryItem.name;
    // no value for glossary property
    if (!values[propertyName]) {
      setGlossaryValue(propertyName, blankValueIndicator);
      return;
    }
    // look up value for managed object types
    if (glossaryItem.type === 'managedObject') {
      let ids = glossaryItem.isMultiValue ? values[propertyName] : [values[propertyName]];
      ids = ids.map((id) => id.split('/').pop());
      const resourceType = glossaryItem.managedObjectType.split('/').pop();
      const value = await Promise.all(ids.map((id) => getResourceDisplayData(resourceType, id)));
      setGlossaryValue(propertyName, value.join(', '));
    } else {
      // set value for non-managed object types
      setGlossaryValue(propertyName, values[propertyName] || blankValueIndicator);
    }
  });
}

/**
 * Retrieves the base glossary array based on the provided glossary schema.
 *
 * @param {Object} glossarySchema - The glossary schema object.
 * @returns {Array} - The base glossary array.
 */
function getBaseGlossaryArray(glossarySchema) {
  const glossary = {};
  glossarySchema.forEach((glossaryItem) => {
    glossary[glossaryItem.name] = {
      displayName: glossaryItem.displayName,
      isLoaded: false,
    };
  });
  return glossary;
}

/**
 * Sets the glossary schema and values for the ItemDetailsModal component.
 *
 * @param {Object} glossarySchema - The glossary schema object.
 * @param {Array} values - The values array.
 */
function setGlossarySchemaAndValues(glossarySchema, values) {
  if (!glossarySchema?.length) return;
  glossaryValues.value = getBaseGlossaryArray(glossarySchema);
  setGlossaryValues(glossarySchema, values);
}

watch(() => props.item, () => {
  if (!isEmpty(props.item)) {
    setGlossarySchemaAndValues(props.glossarySchema, props.item.glossary);
  }
}, { deep: true, immediate: true });

</script>
