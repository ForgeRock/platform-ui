<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <FrSpinner
      v-if="isLoading"
      class="py-5" />
    <template v-else>
      <FrGlossaryEditForm
        class="mb-2"
        :glossary-schema="glossarySchema"
        :model-value="glossaryValues"
        :read-only="readOnly"
        @update:modelValue="updateGlossaryAndEmit" />
      <FrEntitlementEditForm
        :entitlement-schema="entitlementSchema"
        :model-value="entitlementValues"
        :read-only="readOnly"
        @update:modelValue="updateEntitlementAndEmit" />
    </template>
  </div>
</template>

<script setup>
/**
 * Displays the details tab for an entitlement.
 * Allows the user to edit the glossary and entitlement values.
 * Saving submits a request to modify the entitlement.
 */
import { intersection, pickBy } from 'lodash';
import { ref } from 'vue';
import FrEntitlementEditForm from '@forgerock/platform-shared/src/components/governance/EntitlementEditForm';
import FrGlossaryEditForm from '@forgerock/platform-shared/src/components/governance/GlossaryEditForm';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import { getEntitlementSchema } from '@forgerock/platform-shared/src/api/governance/EntitlementApi';
import { getGlossarySchema } from '@forgerock/platform-shared/src/utils/governance/glossary';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import i18n from '@/i18n';

const emit = defineEmits(['update:glossaryValues', 'update:entitlementValues']);

const props = defineProps({
  applicationId: {
    type: String,
    required: true,
  },
  entitlement: {
    type: Object,
    default: () => ({}),
  },
  objectType: {
    type: String,
    required: true,
  },
  readOnly: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: 'UPDATE',
  },
});

const isLoading = ref(null);
const entitlementSchema = ref([]);
const entitlementValues = ref({});
const glossarySchema = ref([]);
const glossaryValues = ref({});

/**
 * Fetches glossary and entitlement schema and values
 */
async function getGlossaryAndEntitlementDetails() {
  isLoading.value = true;
  try {
    // get glossary schema and values
    const data = await getGlossarySchema('assignment');
    glossarySchema.value = data;
    glossaryValues.value = props.entitlement?.glossary?.idx?.['/entitlement'] || {};

    // get entitlement schema and values
    const { data: objectTypeSchema } = await getEntitlementSchema(props.applicationId, props.objectType);
    const hideFlags = props.type === 'CREATE'
      ? ['NOT_CREATABLE']
      : [];
    entitlementSchema.value = pickBy(objectTypeSchema.properties, (value) => {
      const flags = value.flags || [];
      return intersection(flags, hideFlags).length === 0;
    });
    entitlementValues.value = props.entitlement.entitlement || {};
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.administer.entitlements.errorGettingEntitlement'));
  } finally {
    isLoading.value = false;
  }
}

/**
 * Updates the glossary with the provided value and emits an event.
 * @param {Object} value - new glossary value.
 */
function updateGlossaryAndEmit(value) {
  glossaryValues.value = value;
  emit('update:glossaryValues', value);
}

/**
 * Updates the entitlement with the provided value and emits an event.
 * @param {Object} value - new entitlement value.
 */
function updateEntitlementAndEmit(value) {
  entitlementValues.value = value;
  emit('update:entitlementValues', value);
}

getGlossaryAndEntitlementDetails();
</script>
