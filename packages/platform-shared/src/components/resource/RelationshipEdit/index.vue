<!-- Copyright (c) 2020-2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <BFormGroup
      v-if="showResourceType"
      :label-cols="isRelationshipArray || newResource ? 12 : 0"
      :label="$t('common.placeholders.relationshipLabel', {relationshipTitle: relationshipProperty.title})"
      :label-for="'editResourceType' + index"
      horizontal>
      <VueMultiSelect
        open-direction="below"
        label="label"
        track-by="label"
        :disabled="disabled"
        :value="resourceCollection"
        :options="rescourceCollectionTypes"
        :show-labels="false"
        @select="setResourceCollectionType">
        <template
          v-slot:option="{ option }">
          {{ option.text }}
        </template>
      </VueMultiSelect>
    </BFormGroup>

    <FrField
      v-model="relationshipField.value"
      open-direction="bottom"
      :allow-empty="true"
      :clear-on-select="false"
      :disabled="disabled"
      :id="relationshipProperty.key + index"
      :internal-search="false"
      :label="relationshipField.title"
      :limit="10"
      :max-height="600"
      :name="relationshipField.key"
      :options="relationshipField.options"
      :options-limit="10"
      :placeholder="searchPlaceholder"
      :preserve-search="isRelationshipArray"
      :show-labels="false"
      :show-no-results="false"
      :show-no-options="false"
      :searchable="true"
      :type="relationshipField.type"
      :validation="relationshipField.validation"
      :validation-immediade="relationshipField.validation"
      @search-change="debouncedSetOptions"
      @input="emitSelected">
      <template
        v-slot:singleLabel="{ option }">
        <div class="media">
          <div class="media-body">
            <span
              v-for="(displayField, idx) in option.displayFields"
              :key="`displayField_${displayField}_${idx}`"
              v-show="idx !== 0"
              class="pr-1">
              {{ option.resource[displayField] }}
            </span>
            <span class="text-bold red-tag">
              {{ option.resource[option.displayFields[0]] }}
            </span>
          </div>
        </div>
      </template>
      <template
        v-slot:tag="{ option, remove }">
        <div class="multiselect__tag">
          <div>
            <span
              v-for="(displayField, idx) in option.displayFields"
              :key="`displayField_${displayField}_${idx}`"
              v-show="idx !== 0"
              class="pr-1 font-weight-bold">
              {{ option.resource[displayField] }}
            </span>
            <i
              class="material-icons-outlined md-14 multiselect__tag-icon"
              @click="remove(option)">
              close
            </i>
          </div>
          {{ option.resource[option.displayFields[0]] }}
        </div>
      </template>
      <template
        v-slot:option="{ option }">
        <div class="media">
          <div class="media-body">
            <div class="text-bold">
              {{ option.resource[option.displayFields[0]] }}
            </div>
            <div>
              <span
                v-for="(displayField, idx) in option.displayFields"
                :key="`displayField_${displayField}_${idx}`"
                v-show="idx !== 0"
                class="pr-1 text-muted">
                {{ option.resource[displayField] }}
              </span>
            </div>
          </div>
        </div>
      </template>
    </FrField>
    <BFormGroup
      v-if="relationshipProperty.relationshipGrantTemporalConstraintsEnforced"
      :label-cols="isRelationshipArray || newResource ? 12 : 0"
      horizontal>
      <FrField
        v-model="temporalConstraintEnabled"
        class="mb-3"
        name="temporalConstraintEnabled"
        type="boolean"
        :label="$t('common.helpText.timeConstraint')" />
      <FrTimeConstraint
        v-if="temporalConstraintEnabled"
        v-model="temporalConstraint" />
    </BFormGroup>
  </div>
</template>

<script>
import {
  debounce,
  each,
  find,
  has,
  map,
} from 'lodash';
import { BFormGroup } from 'bootstrap-vue';
import VueMultiSelect from 'vue-multiselect';
import TimeConstraint from '@forgerock/platform-shared/src/components/TimeConstraint';
import FrField from '@forgerock/platform-shared/src/components/Field';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import { getSchema } from '@forgerock/platform-shared/src/api/SchemaApi';
import encodeQueryString from '@forgerock/platform-shared/src/utils/encodeQueryString';

export default {
  name: 'RelationshipEdit',
  components: {
    VueMultiSelect,
    BFormGroup,
    FrField,
    FrTimeConstraint: TimeConstraint,
  },
  mixins: [
    NotificationMixin,
    RestMixin,
  ],
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    relationshipProperty: {
      type: Object,
      required: true,
    },
    value: {
      type: [Object, String],
      default: () => {},
    },
    index: {
      type: Number,
      required: true,
    },
    newResource: {
      type: Boolean,
      required: false,
    },
  },
  data() {
    return {
      name: '',
      options: [],
      selected: null,
      showResourceType: false,
      resourceCollection: {},
      rescourceCollectionPath: '',
      rescourceCollectionTypes: [],
      resourceCollections: [],
      isRelationshipArray: has(this.relationshipProperty, 'items'),
      temporalConstraint: '',
      temporalConstraintEnabled: false,
      relationshipField: {
        ...this.relationshipProperty,
        type: has(this.relationshipProperty, 'items') ? 'multiselect' : 'select',
        options: [],
      },
      debouncedSetOptions: debounce(this.setOptions, 1000),
      searchPlaceholder: '',
    };
  },
  mounted() {
    this.setupEditor();
  },
  watch: {
    temporalConstraint(newVal) {
      if (this.relationshipField.value && this.relationshipField.value.length) {
        const relationships = this.relationshipField.value.map((selection) => {
          const refProperties = { temporalConstraints: [{ duration: newVal }] };

          return { _ref: selection, _refProperties: refProperties };
        });

        this.$emit('setValue', relationships);
      }
    },
    /**
     * adds/removes temporal constraint property of relationship based on toggle value
     */
    temporalConstraintEnabled(newVal) {
      if (this.relationshipField.value && this.relationshipField.value.length) {
        const relationships = this.relationshipField.value.map((selection) => {
          const refProperties = newVal ? { temporalConstraints: [{ duration: this.temporalConstraint }] } : null;
          return { _ref: selection, _refProperties: refProperties };
        });

        this.$emit('setValue', relationships);
      }
    },
  },
  methods: {
    setupEditor() {
      this.allResourceCollections = this.isRelationshipArray ? this.relationshipProperty.items.resourceCollection : this.relationshipProperty.resourceCollection;

      this.rescourceCollectionTypes = map(this.allResourceCollections, (prop, index) => ({ value: prop.path, text: prop.label, index }));

      if (this.value) {
        // eslint-disable-next-line no-underscore-dangle
        const currentResourceCollectionType = find(this.rescourceCollectionTypes, { value: this.value._refResourceCollection });

        this.setResourceCollectionType(currentResourceCollectionType);
      } else {
        this.setResourceCollectionType();
      }

      this.setSearchPlaceholder();
    },
    setResourceCollectionType(rescourceCollectionType) {
      let index = 0;

      if (rescourceCollectionType) {
        // eslint-disable-next-line prefer-destructuring
        index = rescourceCollectionType.index;
      }

      this.relationshipField.value = '';

      // set the default resourceCollection to the first resourceCollection
      this.resourceCollection = this.allResourceCollections[index];

      this.showResourceType = this.allResourceCollections.length > 1;

      return getSchema(`${this.resourceCollection.path}`).then((schema) => {
        this.resourceCollection.schema = schema.data;
        this.setOptions();
      })
        .catch((error) => {
          this.displayNotification('IDMMessages', 'error', error.response.data.message);
        });
    },
    setSearchPlaceholder(numChars) {
      if (numChars) {
        this.searchPlaceholder = this.$t('common.placeholders.typeXCharactersToSearchFor', { numChars, item: this.resourceCollection.label });
      } else {
        this.searchPlaceholder = this.$t('common.placeholders.typeToSearchFor', { item: this.resourceCollection.label });
      }
    },
    setOptions(query) {
      const maxPageSize = 10;
      const { fields: displayFields } = this.resourceCollection.query;
      const { uiConfig } = this.$store.state.SharedStore;
      const managedObjectName = this.resourceCollection.path.split('/')[1];
      const queryThreshold = has(uiConfig.configuration.platformSettings.managedObjectsSettings, managedObjectName) ? uiConfig.configuration.platformSettings.managedObjectsSettings[managedObjectName].minimumUIFilterLength : null;
      const queryFilter = true;
      let requestEnabled = true;

      if (queryThreshold) {
        this.setSearchPlaceholder(queryThreshold);
      }

      if (!query && (!this.relationshipField.value || this.relationshipField.value.length === 0) && this.value) {
        // eslint-disable-next-line no-underscore-dangle
        this.relationshipField.options = [{ value: this.value._ref, resource: this.value, displayFields }];
        // eslint-disable-next-line no-underscore-dangle
        this.relationshipField.value = this.value._ref;
      }

      const urlParams = {
        pageSize: maxPageSize,
        fields: displayFields.join(','),
        queryFilter,
      };

      if (query) {
        urlParams.queryFilter = map(displayFields, (field) => `/${field} sw "${query}"`).join(' or ');
        // eslint-disable-next-line prefer-destructuring
        urlParams.sortKeys = displayFields[0];
      }

      if (queryThreshold && query && query.length < queryThreshold) {
        requestEnabled = false;
      }

      if (requestEnabled) {
        const idmInstance = this.getRequestService();
        idmInstance.get(`${this.resourceCollection.path}${encodeQueryString(urlParams)}`).then((queryResults) => {
          this.relationshipField.options = [];
          each(queryResults.data.result, (resource) => {
            // eslint-disable-next-line no-underscore-dangle
            this.relationshipField.options.push({ value: `${this.resourceCollection.path}/${resource._id}`, resource, displayFields });
          });
        })
          .catch((error) => {
            this.displayNotification('IDMMessages', 'error', error.response.data.message);
          });
      }
    },
    emitSelected(selected) {
      if (selected && Array.isArray(selected)) {
        let emitValues;
        if (this.relationshipProperty.relationshipGrantTemporalConstraintsEnforced && this.temporalConstraint.length > 0) {
          const refProperties = { temporalConstraints: [{ duration: this.temporalConstraint }] };
          emitValues = selected.map((currentValue) => ({ _ref: currentValue, _refProperties: refProperties }));
        } else {
          emitValues = selected.map((currentValue) => ({ _ref: currentValue, _refProperties: {} }));
        }
        this.$emit('setValue', emitValues);
      } else if (selected) {
        if (this.relationshipProperty.relationshipGrantTemporalConstraintsEnforced && this.temporalConstraint.length > 0) {
          const refProperties = { temporalConstraints: [{ duration: this.temporalConstraint }] };
          this.$emit('setValue', { _ref: selected, _refProperties: refProperties });
        } else {
          this.$emit('setValue', { _ref: selected, _refProperties: {} });
        }
      } else {
        this.relationshipField.value = null;
        this.$emit('setValue', null);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.red-tag {
  color: $magenta;
  background-color: $gray-100;
  padding: 0.125rem 0.25rem;
  border-radius: 5px;
}
</style>
