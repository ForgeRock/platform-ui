<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div>
    <div class="card-body m-4">
      <ValidationObserver ref="observer">
        <template v-for="(field, index) in displayProperties">
          <div
            class="mb-4"
            v-if="(field.type === 'string' || field.type === 'number' || field.type === 'boolean') && field.encryption === undefined"
            :key="'editResource' + index">
            <FrField :field="field" />
          </div>
          <!-- for singletonRelationhip values -->
          <template v-if="field.type === 'relationship' && formFields[field.key] !== ''">
            <BFormGroup
              :key="'readResource' + index"
              v-if="field.disabled">
              <label
                class="col-form-label col-sm-3"
                :for="field.title">
                {{ field.title }}
              </label>
              <div class="media-body">
                <!-- Using the first display field here "[0]"-->
                <div class="text-bold pl-1">
                  {{ formFields[field.key][getRelationshipDisplayFields(field, formFields[field.key])[0]] }}
                </div>
                <div>
                  <!-- Loop over the rest of the display fields and print each in a span -->
                  <span
                    v-for="(displayField, displayFieldIndex) in getRelationshipDisplayFields(field, formFields[field.key])"
                    :key="`displayField_${displayField}_${displayFieldIndex}`"
                    v-show="displayFieldIndex !== 0"
                    class="pl-1 pr-1 text-muted">
                    {{ formFields[field.key][displayField] }}
                  </span>
                </div>
              </div>
            </BFormGroup>
            <FrRelationshipEdit
              v-else
              :relationship-property="field"
              :key="'editResource' + index"
              :index="index"
              :value="field.value"
              @setValue="setSingletonRelationshipValue($event, field)" />
          </template>
        </template>
      </ValidationObserver>
    </div>
    <div
      v-if="!disableSaveButton"
      class="card-footer">
      <div class="float-right mb-4">
        <BButton
          type="button"
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
  capitalize,
  clone,
  find,
} from 'lodash';
import {
  BButton,
  BFormGroup,
} from 'bootstrap-vue';
import { ValidationObserver } from 'vee-validate'; // ValidationProvider,
import FrField from '@forgerock/platform-shared/src/components/Field';
import RelationshipEdit from '@forgerock/platform-shared/src/components/resource/RelationshipEdit';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import ResourceMixin from '@forgerock/platform-shared/src/mixins/ResourceMixin';

export default {
  name: 'ObjectTypeEditor',
  components: {
    FrField,
    FrRelationshipEdit: RelationshipEdit,
    ValidationObserver,
    BButton,
    BFormGroup,
  },
  props: {
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
    subPropertyName: {
      type: String,
      default: null,
      required: false,
    },
  },
  mixins: [
    ResourceMixin,
    RestMixin,
    NotificationMixin,
  ],
  data() {
    return {
      oldFormFields: {},
    };
  },
  methods: {
    getRelationshipDisplayFields(property, value) {
      // eslint-disable-next-line no-underscore-dangle
      return find(property.resourceCollection, { path: value._refResourceCollection }).query.fields;
    },
    setSingletonRelationshipValue(data, field) {
      field.value = data.value;
    },
    async saveResource() {
      const idmInstance = this.getRequestService();

      this.$refs.observer.reset();

      const isValid = await this.$refs.observer.validate();
      if (isValid) {
        let saveData;

        this.displayProperties.forEach((field) => {
          this.formFields[field.key] = field.value;
        });

        if (this.subPropertyName) {
          const originalSubProp = {};
          const newSubProp = {};

          originalSubProp[this.subPropertyName] = clone(this.oldFormFields);
          newSubProp[this.subPropertyName] = clone(this.formFields);

          saveData = this.generateUpdatePatch(originalSubProp, newSubProp);
        } else {
          saveData = this.generateUpdatePatch(clone(this.oldFormFields), clone(this.formFields));
        }

        idmInstance.patch(this.resourcePath, saveData).then(() => {
          const resourceName = this.resourcePath.split('/')[1];
          this.oldFormFields = clone(this.formFields);
          this.displayNotification('IDMMessages', 'success', this.$t('pages.access.successEdited', { resource: capitalize(resourceName) }));
        },
        (error) => {
          const generatedErrors = this.findPolicyError(error.response, this.displayProperties);

          this.$refs.observer.reset();

          if (generatedErrors.length > 0) {
            generatedErrors.forEach((generatedError) => {
              if (generatedError.exists) {
                const newError = {};
                newError[generatedError.field] = [generatedError.msg];
                this.$refs.observer.setErrors(newError);
              }
            });
          }

          this.displayNotification('IDMMessages', 'error', this.$t('pages.access.invalidEdit'));
        });
      } else {
        this.displayNotification('IDMMessages', 'error', this.$t('pages.access.invalidEdit'));
      }
    },
  },
  mounted() {
    // make sure display properties have a title
    this.displayProperties.forEach((displayProperty) => {
      const hasTitle = displayProperty.title && displayProperty.title.length > 0;
      const hasDescription = displayProperty.description && displayProperty.description.length > 0;
      if (!hasTitle && hasDescription) {
        displayProperty.title = displayProperty.description;
      }
    });

    this.oldFormFields = clone(this.formFields);
  },
};
</script>
