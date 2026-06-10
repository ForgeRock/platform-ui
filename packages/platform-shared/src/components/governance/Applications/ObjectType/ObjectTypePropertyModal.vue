<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <VeeForm
    v-slot="{ meta: { valid } }"
    as="span">
    <BModal
      :id="modalId"
      no-close-on-backdrop
      size="lg"
      title-class="h5"
      title-tag="h2"
      :title="modalTitle"
      @hidden="resetForm"
      @shown="populateForm">
      <FrField
        v-model="form.name"
        class="mb-4"
        name="name"
        :disabled="isEditing || readOnly"
        :label="$t('common.name')"
        validation="required" />
      <FrField
        v-model="form.displayName"
        class="mb-4"
        name="displayName"
        :disabled="readOnly"
        :label="$t('common.displayName')" />
      <FrField
        v-model="form.type"
        class="mb-4"
        name="type"
        type="select"
        :disabled="readOnly"
        :label="$t('common.type')"
        :options="typeOptions"
        validation="required" />
      <FrField
        v-model="form.multiValued"
        class="mb-4"
        name="multiValued"
        type="checkbox"
        :disabled="readOnly"
        :label="$t('governance.applications.edit.objectTypesTab.multiValued')" />
      <FrField
        v-model="form.required"
        class="mb-4"
        name="required"
        type="checkbox"
        :disabled="readOnly"
        :label="$t('common.required')" />
      <FrField
        v-model="constrainValues"
        class="mb-4"
        name="constrainValues"
        type="checkbox"
        :disabled="readOnly"
        :label="$t('governance.applications.edit.objectTypesTab.constrainValues')" />
      <BCollapse v-model="constrainValues">
        <div class="bg-light rounded p-4 mb-4">
          <BFormGroup v-slot="{ ariaDescribedby }">
            <BFormRadioGroup
              id="sourceOfValues"
              v-model="sourceOfValues"
              stacked
              :aria-describedby="ariaDescribedby">
              <BFormRadio
                class="pb-3"
                name="sourceOfValues"
                value="enumeratedValues">
                {{ $t('governance.applications.edit.objectTypesTab.enumeratedValues') }}
              </BFormRadio>
              <BCollapse :visible="sourceOfValues === 'enumeratedValues'">
                <FrListField
                  v-if="sourceOfValues === 'enumeratedValues' && constrainValues"
                  v-model="form.enumeratedValues"
                  class="mb-4"
                  :disabled="readOnly"
                  :items="enumSchema" />
              </BCollapse>
              <BFormRadio
                v-if="isAccountObjectType"
                name="sourceOfValues"
                value="objectType"
                :disabled="!availableObjectTypeOptions.length">
                {{ $t('governance.applications.edit.objectTypesTab.applicationObjectType') }}
              </BFormRadio>
              <BCollapse
                v-if="isAccountObjectType"
                class="pt-3"
                :visible="sourceOfValues === 'objectType'">
                <FrField
                  v-model="form.applicationObjectType"
                  allow-empty
                  name="applicationObjectType"
                  type="select"
                  :disabled="readOnly"
                  :label="$t('governance.applications.edit.objectTypesTab.applicationObjectType')"
                  :options="availableObjectTypeOptions" />
              </BCollapse>
            </BFormRadioGroup>
          </BFormGroup>
          <BCollapse
            v-if="isAccountObjectType"
            :visible="!!form.applicationObjectType">
            <FrField
              v-model="form.isEntitlement"
              class="mt-3"
              name="isEntitlement"
              type="checkbox"
              :disabled="readOnly"
              :label="$t('common.entitlement')" />
          </BCollapse>
        </div>
      </BCollapse>
      <BButton
        class="pl-0 pb-4"
        variant="link"
        @click="showAdvanced = !showAdvanced">
        {{ showAdvanced ? $t('common.hideAdvanced') : $t('common.showAdvanced') }}
      </BButton>
      <BCollapse v-model="showAdvanced">
        <FrField
          v-model="form.creatable"
          class="mb-3"
          name="creatable"
          type="checkbox"
          :disabled="readOnly"
          :label="$t('governance.applications.edit.objectTypesTab.creatable')" />
        <FrField
          v-model="form.updatable"
          class="mb-3"
          name="updatable"
          type="checkbox"
          :disabled="readOnly"
          :label="$t('governance.applications.edit.objectTypesTab.updatable')" />
      </BCollapse>
      <template #modal-footer="{ cancel }">
        <BButton
          v-if="readOnly"
          variant="primary"
          @click="cancel">
          {{ $t('common.close') }}
        </BButton>
        <template v-else>
          <BButton
            variant="link"
            @click="cancel">
            {{ $t('common.cancel') }}
          </BButton>
          <FrButtonWithSpinner
            variant="primary"
            :button-text="$t('common.save')"
            :disabled="!valid || isSaving"
            :show-spinner="isSaving"
            :spinner-text="$t('common.saving')"
            @click="save" />
        </template>
      </template>
    </BModal>
  </VeeForm>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import {
  BButton,
  BCollapse,
  BFormGroup,
  BFormRadio,
  BFormRadioGroup,
  BModal,
} from 'bootstrap-vue';
import { Form as VeeForm } from 'vee-validate';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrListField from '@forgerock/platform-shared/src/components/ListField';
import i18n from '@/i18n';

const props = defineProps({
  modalId: {
    type: String,
    required: true,
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
  initialValues: {
    type: Object,
    default: null,
  },
  readOnly: {
    type: Boolean,
    default: false,
  },
  isAccountObjectType: {
    type: Boolean,
    default: false,
  },
  availableObjectTypes: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['save']);

const emptyForm = () => ({
  name: '',
  displayName: '',
  type: '',
  multiValued: false,
  required: false,
  creatable: true,
  updatable: true,
  enumeratedValues: [],
  applicationObjectType: '',
  isEntitlement: false,
});

const typeOptions = [
  { value: 'string', text: i18n.global.t('common.string') },
  { value: 'boolean', text: i18n.global.t('common.boolean') },
  { value: 'integer', text: i18n.global.t('common.integer') },
  { value: 'number', text: i18n.global.t('common.number') },
  { value: 'object', text: i18n.global.t('common.object') },
];

const enumSchema = {
  type: 'object',
  properties: {
    text: {
      title: i18n.global.t('common.text'),
      type: 'string',
    },
    value: {
      title: i18n.global.t('common.value'),
      type: 'string',
    },
  },
  order: ['text', 'value'],
  required: [],
};

const form = ref(emptyForm());
const constrainValues = ref(false);
const sourceOfValues = ref('enumeratedValues');
const showAdvanced = ref(false);

const isEditing = computed(() => !!props.initialValues);

const availableObjectTypeOptions = computed(() => props.availableObjectTypes.map((ot) => ({ value: ot.id, text: ot.name || ot.id })));

const modalTitle = computed(() => {
  if (props.readOnly) return i18n.global.t('governance.applications.edit.objectTypesTab.viewProperty');
  if (isEditing.value) return i18n.global.t('governance.applications.edit.objectTypesTab.editProperty');
  return i18n.global.t('governance.applications.edit.objectTypesTab.addProperty');
});

watch(constrainValues, (val) => {
  if (!val) {
    form.value.enumeratedValues = [];
    form.value.applicationObjectType = '';
    form.value.isEntitlement = false;
  }
});

watch(sourceOfValues, (newVal, oldVal) => {
  if (newVal !== 'enumeratedValues' && oldVal === 'enumeratedValues') {
    form.value.enumeratedValues = [];
  }
  if (newVal !== 'objectType' && oldVal === 'objectType') {
    form.value.applicationObjectType = '';
    form.value.isEntitlement = false;
  }
});

function populateForm() {
  showAdvanced.value = false;
  if (props.initialValues) {
    const enumeratedValues = props.initialValues.enumeratedValues || [];
    const applicationObjectType = props.initialValues.applicationObjectType || '';
    if (applicationObjectType) {
      sourceOfValues.value = 'objectType';
      constrainValues.value = true;
    } else if (enumeratedValues.length) {
      sourceOfValues.value = 'enumeratedValues';
      constrainValues.value = true;
    } else {
      sourceOfValues.value = 'enumeratedValues';
      constrainValues.value = false;
    }
    form.value = {
      name: props.initialValues.name,
      displayName: props.initialValues.displayName || '',
      type: props.initialValues.type || '',
      multiValued: props.initialValues.multiValued || false,
      required: props.initialValues.required || false,
      creatable: props.initialValues.creatable !== false,
      updatable: props.initialValues.updatable !== false,
      enumeratedValues,
      applicationObjectType,
      isEntitlement: props.initialValues.isEntitlement || false,
    };
  } else {
    constrainValues.value = false;
    sourceOfValues.value = 'enumeratedValues';
    form.value = emptyForm();
  }
}

function save() {
  const payload = { ...form.value };
  if (!constrainValues.value || sourceOfValues.value !== 'enumeratedValues') {
    payload.enumeratedValues = [];
  }
  if (!constrainValues.value || sourceOfValues.value !== 'objectType') {
    payload.applicationObjectType = '';
    payload.isEntitlement = false;
  }
  emit('save', payload);
}

function resetForm() {
  form.value = emptyForm();
  constrainValues.value = false;
  sourceOfValues.value = 'enumeratedValues';
  showAdvanced.value = false;
}
</script>
