<template>
  <BContainer>
    <BRow>
      <BCol>
        <template v-for="(field, index) in formFields">
          <BFormGroup
            :label="field.name"
            label-for="field.key"
            horizontal
            :key="field.name +index"
            v-if="(field.type === 'string' || field.type === 'number')"
          >
            <BFormInput
              horizontal
              type="text"
              :name="field.key"
              v-model="formValues[field.key]"
            />
          </BFormGroup>

          <!-- for boolean values -->
          <BFormGroup
            :key="field.name +index"
            v-if="field.type === 'boolean'"
          >
            <div class="form-row">
              <label
                class="col-form-label col-sm-3"
                :for="field.name"
              >
                {{ field.name }}
              </label>

              <div class="mr-auto">
                <ToggleButton
                  class="mt-2 p-0 fr-toggle-primary"
                  :height="28"
                  :width="56"
                  :sync="true"
                  :css-colors="true"
                  :labels="{checked: $t('common.form.yes'), unchecked: $t('common.form.no')}"
                  v-model="formValues[field.key]"
                />
              </div>
            </div>
          </BFormGroup>
        </template>
      </BCol>
    </BRow>
    <div class="float-right mt-4">
      <BBtn
        type="button"
        @click="$emit('submit', formValues)"
        variant="primary"
      >
        {{ $t('common.form.save') }}
      </BBtn>
      <BBtn
        type="button"
        @click="$emit('cancel')"
        variant="primary"
      >
        {{ $t('common.form.cancel') }}
      </BBtn>
    </div>
  </BContainer>
</template>

<script>
import _ from 'lodash';

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
      default: () => '',
    },
  },
  data() {
    const tempFormFields = [];
    const tempFormValues = {
      _processDefinitionId: this.id,
    };

    // Establish type and default values
    _.each(this.workflowDetails, (detail) => {
      const detailKey = _.lowerCase(detail.name);

      tempFormFields.push({
        name: detail.name,
        key: detailKey,
        type: detail.type.name,
        value: detail.type.value,
      });

      if (detail.type.name === 'boolean') {
        tempFormValues[detailKey] = false;
      } else if (detail.type.name === 'number') {
        tempFormValues[detailKey] = 0;
      } else if (detail.type.name === 'string') {
        tempFormValues[detailKey] = '';
      }
    });

    return {
      formFields: tempFormFields,
      formValues: tempFormValues,
    };
  },
  methods: {
    resetForm() {
      _.each(this.formValues, (value, key) => {
        if (_.isNumber(value)) {
          this.formValues[key] = 0;
        } else if (_.isBoolean(value)) {
          this.formValues[key] = false;
        } else {
          this.formValues[key] = '';
        }
      });
    },
  },
};
</script>
