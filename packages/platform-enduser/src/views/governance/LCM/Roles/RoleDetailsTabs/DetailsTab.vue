<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BCard
    v-if="roleValues"
    class="d-flex form-section p-4">
    <BRow class="pb-0">
      <BCol
        xs="12"
        class="mt-2">
        <FrField
          v-model="roleValues.name"
          class="mb-3"
          :disabled="readOnly"
          :label="$t('common.name')"
          @input="updateRoleAndEmit('name', $event)"
        />
      </BCol>
    </BRow>
    <BRow>
      <BCol xs="12">
        <FrField
          v-model="roleValues.description"
          type="textarea"
          class="mb-3"
          :disabled="readOnly"
          :label="$t('common.description')"
          @input="updateRoleAndEmit('description', $event)"
        />
      </BCol>
    </BRow>
    <h3 class="h5 mb-4">
      {{ $t('governance.entitlements.glossaryAttributes') }}
    </h3>
    <FrGlossaryEditForm
      v-if="isInitialized"
      class="mb-2"
      :glossary-schema="glossarySchema"
      :model-value="glossaryValues"
      :read-only="readOnly || isLoading"
      @update:modelValue="updateGlossaryAndEmit" />
  </BCard>
</template>

<script setup>
/**
 * Displays the details of the item
 * @component DetailsTab
 * @prop {Object} item - Request details info
 * @prop {String} type - The details type for this item
 * @prop {Boolean} isSaving - Flag to determine if this item is read-only
 */
import {
  onMounted,
  ref,
  watch,
} from 'vue';
import {
  BCard,
  BCol,
  BRow,
} from 'bootstrap-vue';
import { isEmpty } from 'lodash';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { getGlossarySchema } from '@forgerock/platform-shared/src/utils/governance/glossary';
import FrGlossaryEditForm from '@forgerock/platform-shared/src/components/governance/GlossaryEditForm';
import FrField from '@forgerock/platform-shared/src/components/Field';
import i18n from '@/i18n';

const emit = defineEmits(['updateTabData']);

const props = defineProps({
  items: {
    type: Object,
    default: () => ({}),
  },
  role: {
    type: Object,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  readOnly: {
    type: Boolean,
    default: false,
  },
  roleId: {
    type: String,
    default: '',
  },
});

const roleValues = ref(null);
const glossarySchema = ref([]);
const glossaryValues = ref(null);
const isInitialized = ref(false);

/**
 * Updates the glossary with the provided value and emits an event.
 * @param {Object} value - new glossary value.
 */
function updateGlossaryAndEmit(value) {
  glossaryValues.value = value;
  const bundledFormData = {
    role: {
      ...roleValues.value,
    },
    glossary: value,
  };
  emit('updateTabData', 'details', 'update', bundledFormData);
}

/**
 * Updates the top-level role data with the provided value and emits an event.
 * @param {String} field - The field to update.
 * @param {Object} value - The new role property value.
 */
function updateRoleAndEmit(field, value) {
  const bundledFormData = {
    role: {
      ...roleValues.value,
      [field]: value,
    },
    glossary: glossaryValues.value,
  };
  emit('updateTabData', 'details', 'update', bundledFormData);
}

/**
 * Get the role glossary schema.
 */
async function getSchemaData() {
  try {
    // get glossary schema and values
    const data = await getGlossarySchema('role');
    glossarySchema.value = data;
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.administer.entitlements.errorGettingEntitlement'));
  }
}

watch(glossaryValues.value, (newVal) => {
  const bundledFormData = {
    role: roleValues.value,
    glossary: newVal,
  };
  emit('updateTabData', 'details', bundledFormData);
}, { deep: true, immediate: true });

watch(roleValues.value, (newVal) => {
  const bundledFormData = {
    role: newVal,
    glossary: glossaryValues.value,
  };
  emit('updateTabData', 'details', bundledFormData);
}, { deep: true, immediate: true });

watch(() => props.items, () => {
  if (!isEmpty(props.items.role) && !isInitialized.value) {
    const { role, glossary } = props.items;
    roleValues.value = role;
    glossaryValues.value = glossary;
    isInitialized.value = true;
  }
}, { deep: true, immediate: true });

onMounted(() => {
  getSchemaData();
});
</script>
