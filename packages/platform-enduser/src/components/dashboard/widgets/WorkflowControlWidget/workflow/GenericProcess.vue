<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
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
                <ToggleButton
                  class="mt-2 p-0 fr-toggle-primary"
                  :height="28"
                  :width="56"
                  :sync="true"
                  :css-colors="true"
                  :labels="{checked: $t('pages.workflow.yes'), unchecked: $t('pages.workflow.no')}"
                  v-model="formValues[field.key]" />
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
/**
 * @description Widget that provides generic fallback for a workflow process
 *
 * */
export default {
  name: 'GenericProcess',
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
        key: detailKey,
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
