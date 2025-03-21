<!-- Copyright (c) 2020-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <div class="card-body m-4">
      <VeeForm
        ref="observer"
        as="span">
        <template
          v-for="(field, index) in clonedDisplayProperties"
          :key="'editResource' + index">
          <div
            v-if="(field.type === 'string' || field.type === 'number' || field.type === 'boolean') && field.encryption === undefined"
            class="mb-4">
            <FrField
              v-model="field.value"
              :disabled="field.disabled"
              :description="field.type !== 'boolean' ? field.description : ''"
              :label="field.title"
              :name="field.key"
              :options="field.options || field.enum"
              :type="getFieldType(field)"
              :validation="field.validation" />
          </div>
          <FrListField
            v-else-if="field.type === 'array' && field.items?.type && field.key !== 'privileges' && !field.items.isRelationship"
            v-model="field.value"
            v-on="$listeners"
            :description="field.description"
            :index="index"
            :items="field.items"
            :label="field.title"
            :name="field.key"
            :required="field.required"
            @input="updateField(index, $event)" />
          <div
            v-else-if="field.type === 'relationship'"
            class="mb-4">
            <FrRelationshipEdit
              class="mb-4"
              v-if="field.type === 'relationship'"
              :close-on-select="isCloseOnSelect(field)"
              :disabled="field.disabled"
              :relationship-property="field"
              :index="index"
              v-model="field.value"
              @setValue="setSingletonRelationshipValue($event, field)" />
          </div>
        </template>
      </VeeForm>
      <slot name="additionalFields" />
    </div>
    <div class="card-footer">
      <div class="float-right mb-4">
        <BButton
          :disabled="disableSaveButton"
          @click="saveResource"
          variant="primary">
          {{ $t('common.save') }}
        </BButton>
      </div>
    </div>
  </div>
</template>

<script>

import {
  camelCase,
  cloneDeep,
  has,
  startCase,
} from 'lodash';
import {
  BButton,
} from 'bootstrap-vue';
import { Form as VeeForm } from 'vee-validate';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrRelationshipEdit from '@forgerock/platform-shared/src/components/resource/RelationshipEdit';
import FrListField from '@forgerock/platform-shared/src/components/ListField';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import ResourceMixin from '@forgerock/platform-shared/src/mixins/ResourceMixin';
import ListsMixin from '@forgerock/platform-shared/src/mixins/ListsMixin';
import { setFieldError } from '@forgerock/platform-shared/src/utils/veeValidateUtils';

export default {
  name: 'ObjectTypeEditor',
  components: {
    FrField,
    FrRelationshipEdit,
    FrListField,
    VeeForm,
    BButton,
  },
  props: {
    revision: {
      type: String,
      default: '',
    },
    displayProperties: {
      type: Array,
      default: () => [],
    },
    formFields: {
      type: Object,
      default: () => {},
    },
    resourcePath: {
      type: String,
      default: '',
    },
    disableSaveButton: {
      type: Boolean,
      default: false,
    },
    isOpenidmAdmin: {
      type: Boolean,
      default: false,
    },
    resourceTitle: {
      type: String,
      default: '',
    },
    subPropertyName: {
      type: String,
      default: null,
      required: false,
    },
  },
  mixins: [
    ListsMixin,
    NotificationMixin,
    ResourceMixin,
    RestMixin,
  ],
  data() {
    return {
      clonedDisplayProperties: [],
      oldFormFields: {},
    };
  },
  watch: {
    displayProperties: {
      immediate: true,
      deep: true,
      handler(displayProperties) {
        this.clonedDisplayProperties = cloneDeep(displayProperties);
        this.loadData(this.clonedDisplayProperties);
      },
    },
  },
  mounted() {
    this.oldFormFields = cloneDeep(this.formFields);
  },
  methods: {
    isCloseOnSelect(field) {
      return !has(field, 'items');
    },
    loadData(clonedDisplayProperties) {
      // make sure display properties have a title
      clonedDisplayProperties.forEach((displayProperty) => {
        const hasTitle = displayProperty.title?.length > 0;
        const hasDescription = displayProperty.description?.length > 0;

        if (!hasTitle && hasDescription) {
          displayProperty.title = displayProperty.description;
        } else if (!hasTitle && !hasDescription) {
          // best effort to create a title when none is provided
          displayProperty.title = startCase(camelCase(displayProperty.key));
        }
      });
    },
    setSingletonRelationshipValue(value, field) {
      field.value = value;
    },
    async saveResource() {
      const idmInstance = this.getRequestService({
        headers: {
          'if-match': this.revision,
        },
      });

      const { valid } = await this.$refs.observer.validate();
      if (valid) {
        let saveData;
        const formFields = cloneDeep(this.formFields);

        this.clonedDisplayProperties.forEach((field) => {
          if (field.value !== null) {
            formFields[field.key] = field.value;
          }
        });

        if (this.subPropertyName) {
          const originalSubProp = {};
          const newSubProp = {};

          originalSubProp[this.subPropertyName] = cloneDeep(this.oldFormFields);
          newSubProp[this.subPropertyName] = cloneDeep(formFields);

          saveData = this.generateUpdatePatch(originalSubProp, newSubProp);
        } else {
          saveData = this.generateUpdatePatch(cloneDeep(this.oldFormFields), cloneDeep(formFields));
        }

        idmInstance.patch(this.resourcePath, saveData).then(() => {
          const resourceName = this.resourceTitle ? this.resourceTitle : this.resourcePath.split('/')[1];
          this.oldFormFields = cloneDeep(formFields);
          this.$emit('refresh-data');
          this.displayNotification('success', this.$t('pages.access.successEdited', { resource: resourceName }));
        },
        (error) => {
          const generatedErrors = this.findPolicyError(error.response, this.clonedDisplayProperties);

          if (generatedErrors.length > 0) {
            generatedErrors.forEach((generatedError) => {
              if (generatedError.exists) {
                setFieldError(generatedError.field, generatedError.msg, this.$refs.observer);
              }
            });
          }

          this.showErrorMessage(error, this.$t('pages.access.invalidEdit'));
        });
      } else {
        this.showErrorMessage('error', this.$t('pages.access.invalidEdit'));
      }
    },
    updateField(index, newValue) {
      this.clonedDisplayProperties[index].value = newValue;
      this.$forceUpdate();
    },
    /**
     * Determines the exact field type component to use.
     * IAM-4692: Brings a change to use checkbox component when the field type is boolean. Earlier it used to use the switch component.
     * @param {Object} field - The field object for which the type is to be determined.
     * @returns {String} - The type of the field.
     */
    getFieldType(field) {
      if (field.format) {
        return field.format;
      }
      if (field.type === 'boolean') {
        return 'checkbox';
      }
      if (has(field, 'enum')) {
        return 'select';
      }
      return field.type;
    },
  },
};
</script>
<style lang="scss" scoped>
.error-state {
  border: 1px solid $red;
}
</style>
