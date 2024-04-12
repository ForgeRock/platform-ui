<!-- Copyright 2023-2024 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->

<template>
  <BModal
    no-close-on-backdrop
    no-close-on-esc
    size="lg"
    title-class="h5"
    title-tag="h2"
    :id="modalId"
    :static="isTesting"
    :title="$t('reports.template.addAParameter')">
    <BFormGroup>
      <FrField
        v-model="parameterName"
        name="parameter-name"
        :label="$t('common.name')"
        :placeholder="$t('common.name')" />
    </BFormGroup>
    <BFormGroup
      v-slot="{ ariaDescribedby }"
      :label="$t('reports.template.parameterType')">
      <BFormRadioGroup
        v-model="parameterType"
        :options="parameterTypeOptions"
        :aria-describedby="ariaDescribedby"
        name="parameter-type" />
    </BFormGroup>
    <BFormGroup v-if="parameterType === 'user_provided'">
      <BFormGroup>
        <FrField
          v-model="inputLabel"
          name="parameter-label"
          :label="$t('reports.template.inputLabel')"
          :placeholder="$t('reports.template.inputLabel')" />
      </BFormGroup>
      <BFormGroup>
        <FrField
          v-model="inputType"
          name="input-type"
          type="select"
          :internal-search="true"
          :label="$t('reports.template.inputType')"
          :options="parameterTypes">
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
      <BFormGroup>
        <FrField
          v-model="multivalued"
          name="multivalued"
          type="checkbox"
          :label="$t('common.multivalued')" />
      </BFormGroup>
      <BFormGroup
        v-if="inputType === 'String'"
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
                      name="parameter-label"
                      :label="$t('common.name')"
                      :placeholder="$t('common.name')" />
                  </BCol>
                  <BCol
                    lg="6"
                    class="mb-1 mb-lg-0">
                    <FrField
                      v-model="row.value"
                      class="flex-grow-1"
                      name="parameter-label"
                      :label="$t('common.value')"
                      :placeholder="$t('common.value')" />
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
    <BFormGroup v-else>
      <FrField
        v-model="profileAttribute"
        name="profile-attribute"
        type="select"
        :internal-search="true"
        :label="$t('reports.template.profileAttribute')"
        :options="profileAttributes" />
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
          :disabled="disableSave || isSaving"
          :show-spinner="isSaving"
          variant="primary"
          @click="$emit('update-parameter', 'parameters', formValues)" />
      </div>
    </template>
  </BModal>
</template>

<script setup>
/**
 * @description
 * Modal for adding a parameter to a custom analytics report template.
 */
import { computed, ref, watch } from 'vue';
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
defineEmits(['update-parameter']);
const props = defineProps({
  isSaving: {
    type: Boolean,
    default: false,
  },
  isTesting: {
    type: Boolean,
    default: false,
  },
  parameterTypes: {
    type: Array,
    default: () => [],
  },
  parameter: {
    type: Object,
    default: () => ({}),
  },
  profileAttributes: {
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
const parameterType = ref('user_provided');
const parameterTypeOptions = [
  {
    text: i18n.global.t('reports.template.userProvided'),
    value: 'user_provided',
  },
  {
    text: i18n.global.t('reports.template.profileAttribute'),
    value: 'profile_attribute',
  },
];

const helpText = ref('');
const inputLabel = ref('');
const inputType = ref('');
const multivalued = ref(false);
const profileAttribute = ref('');
const showEnumeratedValues = ref(false);

// Functions
function addEnumeratedValue(index) {
  enumeratedValues.value.splice(index + 1, 0, {
    name: '',
    value: '',
  });
}
function removeEnumeratedValue(index) {
  if (enumeratedValues.value.length > 1) {
    enumeratedValues.value.splice(index, 1);
  }
}

// Computed
const doesNotHaveProfileAttribute = computed(() => parameterType.value === 'profile_attribute' && !profileAttribute.value);
const disableSave = computed(() => {
  if (parameterType.value === 'user_provided') {
    return !parameterName.value || !inputLabel.value || !inputType.value;
  }
  return doesNotHaveProfileAttribute.value;
});
const enumeratedValuesAreEmpty = computed(() => {
  const enumArray = enumeratedValues.value;
  const [firstValue] = enumArray;
  return enumArray.length === 1 && (!firstValue.name || !firstValue.value);
});
const originalParameterName = computed(() => props.parameter.parameterName);

const formValues = computed(() => {
  const sharedBody = {
    _id: originalParameterName.value || parameterName.value,
    parameterName: parameterName.value,
    parameterType: parameterType.value,
  };
  if (parameterType.value === 'user_provided') {
    return {
      ...sharedBody,
      inputLabel: inputLabel.value,
      inputType: inputType.value,
      helpText: helpText.value,
      multivalued: multivalued.value,
      enumeratedValues: !enumeratedValuesAreEmpty.value && showEnumeratedValues.value
        ? enumeratedValues.value
        : [],
    };
  }
  if (parameterType.value === 'profile_attribute') {
    return {
      ...sharedBody,
      profileAttribute: profileAttribute.value,
    };
  }
  return {};
});

// Watchers
watch(() => props.parameter, (parameter) => {
  parameterName.value = parameter.parameterName || '';
  profileAttribute.value = parameter.profileAttribute || '';
  parameterType.value = parameter.parameterType || parameterTypeOptions[0].value;
  inputLabel.value = parameter.inputLabel || '';
  inputType.value = parameter.inputType || '';
  helpText.value = parameter.helpText || '';
  multivalued.value = (parameter.multivalued && parameter.parameterType === 'user_provided') || false;
  showEnumeratedValues.value = parameter.enumeratedValues?.length && parameter.inputType === 'String';
  enumeratedValues.value = parameter.enumeratedValues?.length ? parameter.enumeratedValues : [{
    name: '',
    value: '',
  }];
});
</script>

<style lang="scss" scoped>
.fr-enumerated-values-buttons {
  min-width: 132px;
}
</style>
