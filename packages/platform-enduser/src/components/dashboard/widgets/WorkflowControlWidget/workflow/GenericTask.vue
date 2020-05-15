<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <BContainer>
    <BRow>
      <BCol>
        <template v-for="(field, key) in readOnlyFields">
          <BFormGroup
            :label="key | capitalize"
            label-for="field"
            horizontal
            :key="key">
            <BFormInput
              horizontal
              type="text"
              :readonly="true"
              :plaintext="true"
              :value="field" />
          </BFormGroup>
        </template>

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
              :plaintext="field.readOnly"
              :name="field.key"
              :value="formValues[field.key]"
              v-model="formValues[field.key]" />
          </BFormGroup>

          <!-- For boolean values -->
          <BFormGroup
            :key="field.name + index"
            v-else-if="field.type === 'boolean'">
            <div class="form-row">
              <label
                class="col-form-label col-sm-3"
                :for="field.name">
                {{ field.name }}
              </label>

              <div class="mr-auto">
                <ToggleButton
                  class="mt-2 p-0 fr-toggle-primary"
                  :height="28"
                  :width="56"
                  :disabled="field.readOnly"
                  :sync="true"
                  :css-colors="true"
                  :labels="{checked: $t('pages.workflow.yes'), unchecked: $t('pages.workflow.no')}"
                  v-model="formValues[field.key]" />
              </div>
            </div>
          </BFormGroup>

          <!-- For enum type -->
          <BFormGroup
            :key="field.name + index"
            v-else-if="field.type === 'enum'">
            <div class="form-row">
              <label
                class="col-form-label col-sm-3"
                :for="field.name">
                {{ field.name }}
              </label>

              <div class="mr-auto">
                <BFormSelect
                  v-model="formValues[field.key]"
                  :options="field.options"
                  class="mb-3" />
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
/* eslint-disable no-underscore-dangle */
import {
  omit, clone, capitalize, isUndefined, each,
} from 'lodash';

/**
 * @description Widget that provides generic fallback for a workflow task
 *
 * */
export default {
  name: 'GenericTask',
  props: {
    variables: {
      type: Object,
      default: () => {},
    },
    taskFields: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    const tempFormFields = [];
    const tempFormValues = {};
    const tempVariables = omit(clone(this.variables), ['approverId', 'initiatorId', 'openidmObjectId']);

    // Generate list of possible editable/none editable properties with values
    each(this.taskFields.formPropertyHandlers, (field) => {
      const tempField = {
        key: field._id,
        name: field.name,
        value: this.variables[field._id],
        type: field.type.name,
        readOnly: !field.writable,
      };

      // Handel dropdown use case
      if (field.type.name === 'enum') {
        tempField.options = field.type.values;

        // If no variable value set default value to first option
        if (isUndefined(tempField.value) && field.type.values) {
          // eslint-disable-next-line prefer-destructuring
          tempField.value = Object.keys(field.type.values)[0];
          tempFormValues[field._id] = tempField.value;
        }
      }

      // In the case of no enum set trackable input values to be bond by Vue
      if (isUndefined(tempFormValues[field._id])) {
        tempFormValues[field._id] = this.variables[field._id];
      }

      tempFormFields.push(tempField);

      delete tempVariables[field._id];
    });

    return {
      formFields: tempFormFields,
      readOnlyFields: tempVariables,
      formValues: tempFormValues,
    };
  },
  filters: {
    capitalize(val) {
      return capitalize(val);
    },
  },
};
</script>
