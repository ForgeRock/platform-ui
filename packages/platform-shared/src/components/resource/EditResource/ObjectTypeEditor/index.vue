<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div>
    <div
      v-if="showToggle"
      class="d-flex justify-content-between align-items-center px-4 pt-4">
      <label />
      <div
        id="jsonToggle"
        class="align-items-center text-nowrap custom-control custom-switch b-custom-control-sm">
        <BFormCheckbox
          :disabled="!isValidJson"
          v-model="showJson"
          switch>
          {{ $t('pages.objectTypeEditor.json') }}
        </BFormCheckbox>
        <BTooltip
          v-if="!isValidJson"
          target="jsonToggle"
          placement="top"
          triggers="hover">
          {{ $t('pages.objectTypeEditor.jsonError') }}
        </BTooltip>
      </div>
    </div>
    <template
      v-if="showJson">
      <div
        class="mt-4"
        :class="{
          borderTop: isValidJson,
          'error-state': !isValidJson
        }"
      >
        <VuePrismEditor
          language="json"
          v-model="stringifiedValue"
          :line-numbers="true"
          @input="currentJson = $event.target.innerText; validateCurrentJson();" />
      </div>
    </template>
    <div
      v-else
      class="card-body m-4">
      <ValidationObserver ref="observer">
        <template v-for="(field, index) in displayProperties">
          <div
            v-if="(field.type === 'string' || field.type === 'number' || field.type === 'boolean') && field.encryption === undefined"
            class="mb-4"
            :key="'editResource' + index">
            <FrField
              :field="field"
              :display-description="field.type !== 'boolean'" />
          </div>

          <FrListField
            v-else-if="field.type === 'array' && field.key !== 'privileges'"
            :key="'editResource' + index"
            :field="field"
            :index="index"
            v-on="$listeners"
            @valueChange="updateField(index, $event)"
            @add-object="addObjectToList(index, $event, displayProperties)"
            @remove-object="removeElementFromList(index, $event, displayProperties)"
            @add-list="addElementToList(index, $event, displayProperties)"
            @remove-list="removeElementFromList(index, $event, displayProperties)" />

          <div
            v-if="field.type === 'relationship'"
            class="mb-4"
            :key="'editResource' + index">
            <FrRelationshipEdit
              class="mb-4"
              v-if="field.type === 'relationship'"
              :disabled="field.disabled"
              :relationship-property="field"
              :index="index"
              v-model="field.value"
              @setValue="setSingletonRelationshipValue($event, field)" />
          </div>
        </template>
      </ValidationObserver>
    </div>
    <div
      class="card-footer">
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
  startCase,
} from 'lodash';
import {
  BButton,
  BFormCheckbox,
  BTooltip,
} from 'bootstrap-vue';
import { ValidationObserver } from 'vee-validate';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrRelationshipEdit from '@forgerock/platform-shared/src/components/resource/RelationshipEdit';
import FrListField from '@forgerock/platform-shared/src/components/ListField';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import ResourceMixin from '@forgerock/platform-shared/src/mixins/ResourceMixin';
import ListsMixin from '@forgerock/platform-shared/src/mixins/ListsMixin';
import 'prismjs';
import 'prismjs/components/prism-json';
import 'prismjs/themes/prism.css';
import VuePrismEditor from 'vue-prism-editor';
import 'vue-prism-editor/dist/VuePrismEditor.css';

export default {
  name: 'ObjectTypeEditor',
  components: {
    FrField,
    FrRelationshipEdit,
    FrListField,
    ValidationObserver,
    BButton,
    BFormCheckbox,
    VuePrismEditor,
    BTooltip,
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
    resourceTitle: {
      type: String,
      default: '',
    },
    subPropertyName: {
      type: String,
      default: null,
      required: false,
    },
    showToggle: {
      type: Boolean,
      defualt: false,
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
      oldFormFields: {},
      showJson: false,
      isValidJson: true,
      currentJson: {},
    };
  },
  computed: {
    stringifiedValue: {
      get() {
        if (this.displayProperties) {
          return JSON.stringify(this.displayProperties, null, 2);
        }
        return '';
      },
      set(newValue) {
        return JSON.stringify(newValue, null, 2);
      },
    },
  },
  mounted() {
    // make sure display properties have a title
    this.displayProperties.forEach((displayProperty) => {
      const hasTitle = displayProperty.title && displayProperty.title.length > 0;
      const hasDescription = displayProperty.description && displayProperty.description.length > 0;

      if (!hasTitle && hasDescription) {
        displayProperty.title = displayProperty.description;
      } else if (!hasTitle && !hasDescription) {
        // best effort to create a title when none is provided
        displayProperty.title = startCase(camelCase(displayProperty.key));
      }
    });

    this.oldFormFields = cloneDeep(this.formFields);
  },
  methods: {
    setSingletonRelationshipValue(value, field) {
      field.value = value;
    },
    async saveResource() {
      const idmInstance = this.getRequestService();

      this.$refs.observer.reset();

      const isValid = await this.$refs.observer.validate();
      if (isValid) {
        let saveData;

        this.displayProperties.forEach((field) => {
          if (field.value !== null) {
            this.formFields[field.key] = field.value;
          }
        });

        if (this.subPropertyName) {
          const originalSubProp = {};
          const newSubProp = {};

          originalSubProp[this.subPropertyName] = cloneDeep(this.oldFormFields);
          newSubProp[this.subPropertyName] = cloneDeep(this.formFields);

          saveData = this.generateUpdatePatch(originalSubProp, newSubProp);
        } else {
          saveData = this.generateUpdatePatch(cloneDeep(this.oldFormFields), cloneDeep(this.formFields));
        }

        idmInstance.patch(this.resourcePath, saveData).then(() => {
          const resourceName = this.resourceTitle ? this.resourceTitle : this.resourcePath.split('/')[1];
          this.oldFormFields = cloneDeep(this.formFields);
          this.displayNotification('IDMMessages', 'success', this.$t('pages.access.successEdited', { resource: resourceName }));
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
    updateField(index, newValue) {
      this.displayProperties[index].value = newValue;
    },
  },
};
</script>
<style lang="scss" scoped>
.error-state {
  border: 1px solid $red;
}
</style>
