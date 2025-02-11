<!-- Copyright (c) 2024-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <VeeForm
    v-slot="{ meta: { valid } }"
    as="span">
    <BModal
      no-close-on-backdrop
      no-close-on-esc
      size="lg"
      title-class="h5"
      title-tag="h2"
      :id="modalId"
      :static="isTesting"
      :title="$t('reports.template.addAParameter')"
      @hidden="resetValues">
      <BFormGroup>
        <FrField
          v-model="parameterName"
          name="parameter-name"
          :label="$t('common.name')"
          :placeholder="$t('common.name')"
          :validation="parameterNameValidation" />
      </BFormGroup>
      <BFormGroup>
        <BFormGroup>
          <FrField
            v-model="inputLabel"
            name="parameter-label"
            validation="required"
            :label="$t('reports.template.inputLabel')"
            :placeholder="$t('reports.template.inputLabel')" />
        </BFormGroup>
        <BFormGroup
          v-if="dataSourceParameterTypes.length"
          v-slot="{ ariaDescribedby }"
          :label="$t('reports.template.inputType')">
          <BFormRadioGroup
            v-model="inputTypeParameter"
            name="input-type"
            :options="parameterInputTypeOptions"
            :aria-describedby="ariaDescribedby"
            @change="resetInputTypesValues()" />
        </BFormGroup>
        <BFormGroup
          v-if="inputTypeParameter === 'datasource'"
          class="mb-0">
          <BFormGroup>
            <FrField
              v-model="dataSourceSelection"
              name="data-source"
              type="select"
              :internal-search="true"
              :label="$t('reports.template.dataSource')"
              :options="dataSourceParameterTypes"
              :validation="inputTypeParameter === 'datasource' ? 'required' : ''">
              <template #singleLabel="{ option }">
                {{ getTranslation(option.text.label) }}
              </template>
              <template #option="{ option }">
                {{ getTranslation(option.text.label) }}
              </template>
            </FrField>
          </BFormGroup>
          <BFormGroup v-if="dataSourceSelection">
            <FrField
              v-model="dataSourcePropertySelection"
              name="data-source-property"
              type="select"
              :internal-search="true"
              :label="$t('reports.template.propertyType', { property: getTranslation(dataSourceSelection.label) })"
              :options="dataSourceSelection.attributes"
              :validation="dataSourceSelection ? 'required' : ''">
              <template #singleLabel="{ option }">
                {{ getTranslation(option.text) }}
              </template>
              <template #option="{ option }">
                {{ getTranslation(option.text) }}
              </template>
            </FrField>
          </BFormGroup>
        </BFormGroup>
        <BFormGroup v-else>
          <FrField
            v-model="inputType"
            name="input-type"
            type="select"
            validation="required"
            :internal-search="true"
            :label="$t('reports.template.inputType')"
            :options="basicParameterTypes">
            <template
              v-for="(slotName, index) in ['singleLabel', 'option']"
              :key="index"
              #[slotName]="{ option }">
              {{ getTranslation(option.text) }}
            </template>
          </FrField>
        </BFormGroup>
        <BFormGroup>
          <FrField
            v-model="helpText"
            name="help-text"
            :label="$t('reports.template.helpText')"
            :placeholder="$t('common.optionalFieldTitle', {fieldTitle: $t('reports.template.helpText')})" />
        </BFormGroup>
        <BFormGroup v-if="showMultivaluedCheckbox">
          <FrField
            v-model="multivalued"
            name="multivalued"
            type="checkbox"
            :label="$t('common.multivalued')" />
        </BFormGroup>
        <BFormGroup
          v-if="showEnumsCheckbox"
          class="mb-0">
          <FrField
            v-model="showEnumeratedValues"
            class="mb-4"
            name="enumerated-values"
            type="checkbox"
            :label="$t('common.enumeratedValues')" />
          <BCollapse :visible="showEnumeratedValues">
            <BCard
              body-class="bg-light"
              class="shadow-none border-0">
              <BCardTitle
                class="h5 mb-2"
                title-tag="h3">
                {{ $t('common.enumeratedValues') }}
              </BCardTitle>
              <BCardText class="mb-4">
                {{ $t('reports.template.nameAndValue') }}
              </BCardText>
              <BFormGroup
                v-for="(row, index) in enumeratedValues"
                :key="index"
                class="mb-3">
                <div class="d-flex">
                  <BFormRow class="flex-grow-1 pr-3">
                    <BCol
                      lg="6"
                      class="mb-1 mb-lg-0">
                      <FrField
                        v-model="row.name"
                        class="flex-grow-1"
                        :label="$t('common.name')"
                        :name="`enumerated-name-${index}`"
                        :placeholder="$t('common.name')"
                        :validation="showEnumeratedValues ? 'required' : ''" />
                    </BCol>
                    <BCol
                      lg="6"
                      class="mb-1 mb-lg-0">
                      <FrField
                        v-model="row.value"
                        class="flex-grow-1"
                        :label="$t('common.value')"
                        :name="`enumerated-value-${index}`"
                        :placeholder="$t('common.value')"
                        :validation="showEnumeratedValues ? 'required' : ''" />
                    </BCol>
                  </BFormRow>
                  <BFormRow class="fr-enumerated-values-buttons">
                    <BButton
                      v-if="enumeratedValues.length > 1"
                      class="text-dark"
                      variant="link"
                      @click="removeEnumeratedValue(index)">
                      <FrIcon
                        icon-class="md-24"
                        name="remove" />
                    </BButton>
                    <BButton
                      class="text-dark"
                      variant="link"
                      @click="addEnumeratedValue(index)">
                      <FrIcon
                        icon-class="md-24"
                        name="add" />
                    </BButton>
                  </BFormRow>
                </div>
              </BFormGroup>
            </BCard>
          </BCollapse>
        </BFormGroup>
      </BFormGroup>
      <template #modal-footer="{ cancel }">
        <div class="d-flex">
          <BButton
            variant="link"
            :disabled="isSaving"
            @click="cancel()">
            {{ $t('common.cancel') }}
          </BButton>
          <FrButtonWithSpinner
            :disabled="isSaving || !valid"
            :show-spinner="isSaving"
            variant="primary"
            @click="emit('update-parameter', existingDefinitionIndex, formValues)" />
        </div>
      </template>
    </BModal>
  </VeeForm>
</template>

<script setup>
/**
 * @description
 * Modal for adding a parameter to a custom analytics report template.
 */
import { computed, ref, watch } from 'vue';
import { Form as VeeForm } from 'vee-validate';
import {
  BButton,
  BCard,
  BCardText,
  BCardTitle,
  BCol,
  BCollapse,
  BFormGroup,
  BFormRow,
  BModal,
  BFormRadioGroup,
} from 'bootstrap-vue';
import { getTranslation } from '@forgerock/platform-shared/src/utils/translations';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner/';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import i18n from '@/i18n';

// Definitions
const emit = defineEmits(['update-parameter']);
const props = defineProps({
  basicParameterTypes: {
    type: Array,
    default: () => [],
  },
  dataSourceParameterTypes: {
    type: Array,
    default: () => [],
  },
  existingParameter: {
    type: Object,
    default: () => ({}),
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
  isTesting: {
    type: Boolean,
    default: false,
  },
  parameterKeys: {
    type: Array,
    default: () => [],
  },
});

// Globals
const enumeratedValues = ref([{
  name: '',
  value: '',
}]);
const modalId = 'report-parameters-modal';
const parameterName = ref('');
const inputTypeParameter = ref('basic');
const parameterInputTypeOptions = [
  {
    text: i18n.global.t('common.basic'),
    value: 'basic',
  },
  {
    text: i18n.global.t('reports.template.dataSource'),
    value: 'datasource',
  },
];

const dataSourcePropertySelection = ref(null);
const dataSourceSelection = ref('');
const helpText = ref('');
const inputLabel = ref('');
const inputType = ref('');
const multivalued = ref(false);
const showEnumeratedValues = ref(false);

// Functions
function addEnumeratedValue(index) {
  enumeratedValues.value.splice(index + 1, 0, {
    name: '',
    value: '',
  });
}

function resetInputTypesValues() {
  dataSourceSelection.value = '';
  dataSourcePropertySelection.value = null;
  inputType.value = '';
}

function removeEnumeratedValue(index) {
  if (enumeratedValues.value.length > 1) {
    enumeratedValues.value.splice(index, 1);
  }
}

function resetValues() {
  parameterName.value = '';
  inputLabel.value = '';
  inputTypeParameter.value = 'basic';
  inputType.value = '';
  helpText.value = '';
  multivalued.value = false;
  showEnumeratedValues.value = false;
  enumeratedValues.value = [{
    name: '',
    value: '',
  }];
  resetInputTypesValues();
  emit('hidden');
}

// Computed

const enumeratedValuesAreEmpty = computed(() => {
  const enumArray = enumeratedValues.value;
  const [firstValue] = enumArray;
  return enumArray.length === 1 && (!firstValue.name || !firstValue.value);
});
const existingDefinitionIndex = computed(() => {
  const existingIndex = props.existingParameter.index;
  return existingIndex !== undefined ? existingIndex : -1;
});
const parameterNameValidation = computed(() => ({
  whitespace: true,
  required: true,
  unique: props.parameterKeys,
}));
const showMultivaluedCheckbox = computed(() => {
  if (inputTypeParameter.value === 'basic' || inputTypeParameter.value === 'user_provided') {
    return inputType.value.type === 'string';
  }
  if (inputTypeParameter.value === 'datasource') {
    const attributeType = dataSourcePropertySelection.value?.type;
    return attributeType === 'string' || attributeType === 'array';
  }
  return false;
});
const showEnumsCheckbox = computed(() => {
  if (inputTypeParameter.value === 'basic' || inputTypeParameter.value === 'user_provided') {
    return inputType.value.type === 'string';
  }
  return false;
});
const formValues = computed(() => {
  const dataSourceInputType = {
    ...(inputTypeParameter.value === 'datasource' && {
      dataSource: dataSourceSelection.value.type,
      dataSourceProperty: dataSourcePropertySelection.value?.name,
      inputType: dataSourcePropertySelection.value?.type,
      ...(dataSourcePropertySelection.value?.enum && { enumeratedValues: dataSourcePropertySelection.value.enum }),
    }),
  };
  const enumsCondition = !enumeratedValuesAreEmpty.value && showEnumeratedValues.value;
  const dataType = inputType.value.type === 'array' ? inputType.value.item.type : inputType.value.type;

  return {
    parameterName: parameterName.value,
    inputLabel: inputLabel.value,
    inputType: dataType,
    helpText: helpText.value,
    multivalued: showMultivaluedCheckbox.value && multivalued.value,
    source: inputTypeParameter.value,
    ...dataSourceInputType,
    ...(enumsCondition && { enumeratedValues: enumeratedValues.value }),
  };
});

// Watchers
watch(() => props.existingParameter, (parameter) => {
  const { definition } = parameter;
  if (definition) {
    if (props.dataSourceParameterTypes.length) {
      dataSourceSelection.value = props.dataSourceParameterTypes.find((option) => option.type === definition.dataSource);
      dataSourcePropertySelection.value = dataSourceSelection.value?.attributes.find((option) => option.value.name === definition.dataSourceProperty).value;
    }

    if (definition.source === 'datasource') {
      inputType.value = props.dataSourceParameterTypes
        .find((option) => option.type === definition.dataSource)
        .attributes
        .find((attribute) => attribute.value.name === definition.dataSourceProperty).value
        || 'string';
    } else {
      inputType.value = props.basicParameterTypes.find((option) => option.value.type === definition.inputType.toLowerCase()).value;
    }

    parameterName.value = definition.parameterName || '';
    inputLabel.value = definition.inputLabel || '';
    // user_provided is the old source value for custom parameters so this needs to be taken
    // into consideration for old reports created prior to the new parameters rewrite IAM-8085.
    inputTypeParameter.value = definition.source === 'user_provided' ? 'basic' : definition.source;
    helpText.value = definition.helpText || '';
    multivalued.value = definition.multivalued || false;
    showEnumeratedValues.value = !!definition.enumeratedValues?.length;
    enumeratedValues.value = definition.enumeratedValues?.length ? definition.enumeratedValues : [{
      name: '',
      value: '',
    }];
  }
});
</script>

<style lang="scss" scoped>
.fr-enumerated-values-buttons {
  min-width: 132px;
}
</style>
