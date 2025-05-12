<!-- Copyright (c) 2020-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer>
    <BRow>
      <BCol>
        <template v-for="(field, index) in formFields">
          <BFormGroup
            :label="field.name"
            label-for="field.key"
            horizontal
            :key="field.name + index"
            v-if="(field.type === 'string' || field.type === 'number')">
            <BFormInput
              horizontal
              type="text"
              :name="field.key"
              v-model="formValues[field.key]" />
          </BFormGroup>

          <!-- for boolean values -->
          <BFormGroup
            :key="field.name + index"
            v-if="field.type === 'boolean'">
            <div class="form-row">
              <label
                class="col-form-label col-sm-3"
                :for="field.name">
                {{ field.name }}
              </label>

              <div class="mr-auto">
                <BFormCheckbox
                  switch
                  size="lg"
                  v-model="formValues[field.key]"
                  class="fr-toggle-primary inner-text">
                  {{ formValues[field.key] ? $t('pages.workflow.yes') : $t('pages.workflow.no') }}
                </BFormCheckbox>
              </div>
            </div>
          </BFormGroup>
        </template>
      </BCol>
    </BRow>
    <div class="float-right mt-4">
      <BButton
        class="mr-2"
        @click="$emit('submit', formValues)"
        variant="primary">
        {{ $t('pages.workflow.save') }}
      </BButton>
      <BButton
        @click="$emit('cancel')"
        variant="primary">
        {{ $t('pages.workflow.cancel') }}
      </BButton>
    </div>
  </BContainer>
</template>

<script>
import {
  BButton,
  BCol,
  BContainer,
  BFormCheckbox,
  BFormGroup,
  BFormInput,
  BRow,
} from 'bootstrap-vue';

/**
 * @description Widget that provides generic fallback for a workflow process
 *
 * */
export default {
  name: 'GenericProcess',
  components: {
    BButton,
    BCol,
    BContainer,
    BFormCheckbox,
    BFormGroup,
    BFormInput,
    BRow,
  },
  props: {
    workflowDetails: {
      type: Array,
      default: () => [],
    },
    id: {
      type: String,
      default: '',
    },
  },
  data() {
    const tempFormFields = [];
    const tempFormValues = {
      _processDefinitionId: this.id,
    };

    // Establish type and default values
    this.workflowDetails.forEach((detail) => {
      const detailKey = detail.name.toLowerCase();

      tempFormFields.push({
        name: detail.name,
        key: detail._id,
        type: detail.type.name,
        value: detail.type.value,
      });

      tempFormValues[detailKey] = this.setDefaults(detail.type.name);
    });

    return {
      formFields: tempFormFields,
      formValues: tempFormValues,
    };
  },
  methods: {
    resetForm() {
      this.formFields.forEach((field) => {
        this.formValues[field.key] = this.setDefaults(field.type);
      });
    },
    setDefaults(type) {
      switch (type) {
        case 'boolean':
          return Boolean();
        case 'number':
          return Number();
        case 'string':
          return String();
        default:
          return null;
      }
    },
  },
};
</script>
