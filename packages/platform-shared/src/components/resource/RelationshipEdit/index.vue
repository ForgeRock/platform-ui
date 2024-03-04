<!-- Copyright (c) 2020-2024 ForgeRock. All rights reserved.

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
      <Component
        :is="multiselectComponent"
        open-direction="below"
        label="label"
        options-label-key="label"
        track-by="label"
        :disabled="disabled"
        :value="resourceCollection"
        :options="rescourceCollectionTypes"
        :show-labels="false"
        @select="setResourceCollectionType">
        <template #option="{ option }">
          {{ option.text }}
        </template>
      </Component>
    </BFormGroup>

    <FrField
      :value="relationshipField.value"
      @input="relationshipField.value = $event; emitSelected($event)"
      :allow-empty="true"
      :close-on-select="closeOnSelect"
      :disabled="disabled"
      :description="!hideFieldDescription ? fieldDescription : ''"
      :id="`${relationshipField.key}${index}`"
      :internal-search="false"
      :label="floatingLabel"
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
      :validation-immediate="relationshipField.validationImmediate"
      @open="setOptions"
      @search-change="debouncedSetOptions">
      <template #singleLabel="{ option }">
        <div
          v-if="option"
          class="media">
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
      <template #tag="{ option, remove }">
        <div
          v-if="option"
          class="multiselect__tag">
          <div>
            <span tabindex="0">
              <span
                v-for="(displayField, idx) in option.displayFields"
                :key="`displayField_${displayField}_${idx}`"
                v-show="idx !== 0"
                class="pr-1 font-weight-bold">
                {{ option.resource[displayField] }}
              </span>
            </span>
            <span
              class="multiselect__tag-icon"
              tabindex="0"
              :aria-label="$t('common.remove')"
              @click.prevent="remove(option)"
              @keydown.enter="remove(option)" />
          </div>
          {{ option.resource[option.displayFields[0]] }}
        </div>
      </template>
      <template #option="{ option }">
        <div
          v-if="option"
          class="media">
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
      v-if="relationshipProperty.relationshipGrantTemporalConstraintsEnforced && showTimeConstraintsSwitch"
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
import { getManagedResourceList } from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import { getInternalResourceList } from '@forgerock/platform-shared/src/api/InternalResourceApi';
import TimeConstraint from '@forgerock/platform-shared/src/components/TimeConstraint';
import FrField from '@forgerock/platform-shared/src/components/Field';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import ResourceMixin from '@forgerock/platform-shared/src/mixins/ResourceMixin';
import FrMultiselectBase from '@forgerock/platform-shared/src/components/MultiselectBase/MultiselectBase';
// import vue-multiselect from src because dist min/uglified package gets removed in build
import VueMultiSelect from '../../../../../../node_modules/vue-multiselect/src/index';
import store from '@/store';

export default {
  name: 'RelationshipEdit',
  components: {
    VueMultiSelect,
    FrMultiselectBase,
    BFormGroup,
    FrField,
    FrTimeConstraint: TimeConstraint,
  },
  mixins: [
    NotificationMixin,
    ResourceMixin,
  ],
  props: {
    closeOnSelect: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    hideFieldDescription: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      default: '',
    },
    relationshipProperty: {
      type: Object,
      required: true,
    },
    value: {
      type: [Object, String, Array],
      default: () => ({}),
    },
    index: {
      type: Number,
      required: true,
    },
    newResource: {
      type: Boolean,
      required: false,
    },
    /**
     * Extends the query defined in relationship queryFilter request
     */
    queryFilterExtension: {
      type: String,
      default: '',
    },
    showTimeConstraintsSwitch: {
      type: Boolean,
      default: true,
    },
    singleSelection: {
      type: Boolean,
      required: false,
    },
  },
  data() {
    const multiselectComponent = store.state?.SharedStore?.newMultiselectEnabled ? FrMultiselectBase : VueMultiSelect;
    return {
      fieldDescription: this.relationshipProperty.description !== this.relationshipProperty.title
        ? this.relationshipProperty.description
        : '',
      floatingLabel: this.label || this.relationshipProperty.title,
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
        value: '',
      },
      debouncedSetOptions: debounce(this.setOptions, 1000),
      searchPlaceholder: '',
      multiselectComponent,
    };
  },
  mounted() {
    this.setupEditor();
  },
  watch: {
    temporalConstraint(newVal) {
      if (this.relationshipField.value?.length) {
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
      if (this.relationshipField.value?.length) {
        const relationships = this.relationshipField.value.map((selection) => {
          const refProperties = newVal ? { temporalConstraints: [{ duration: this.temporalConstraint }] } : null;
          return { _ref: selection, _refProperties: refProperties };
        });

        this.$emit('setValue', relationships);
      }
    },
    /**
     * Replaces drop down value with new value to make it a single
     * selection if singleSelection prop is true and value is an array
     */
    relationshipField: {
      handler(newField) {
        if (Array.isArray(newField.value) && newField.value.length > 1 && this.singleSelection) {
          this.relationshipField.value.shift();
        }
      },
      deep: true,
    },
  },
  methods: {
    setupEditor() {
      this.allResourceCollections = this.isRelationshipArray ? this.relationshipProperty.items.resourceCollection : this.relationshipProperty.resourceCollection;

      this.rescourceCollectionTypes = map(this.allResourceCollections, (prop, index) => ({ value: prop.path, text: prop.label, index }));

      if (this.value) {
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
        index = rescourceCollectionType.index;
      }

      this.relationshipField.value = '';

      // set the default resourceCollection to the first resourceCollection
      this.resourceCollection = this.allResourceCollections[index];

      this.showResourceType = this.allResourceCollections.length > 1;
      this.setOriginalValues();
    },
    setSearchPlaceholder(numChars) {
      if (numChars) {
        this.searchPlaceholder = this.$t('common.placeholders.typeXCharactersToSearchFor', { numChars, item: this.label || this.resourceCollection.label });
      } else {
        this.searchPlaceholder = this.$t('common.placeholders.typeToSearchFor', { item: this.label || this.resourceCollection.label });
      }
    },
    async setOptions(query) {
      const [resourceType, managedObjectName] = this.resourceCollection.path.split('/');
      let resourceName = managedObjectName;
      if (resourceType === 'internal' && managedObjectName === 'role') {
        resourceName = 'internalrole';
      }
      const queryThreshold = await this.getMinimumUIFilterLength(resourceName);
      const maxPageSize = 10;
      const { fields: displayFields } = this.resourceCollection.query;
      const queryFilter = true;
      let requestEnabled = true;

      if (queryThreshold) {
        this.setSearchPlaceholder(queryThreshold);
      }

      const urlParams = {
        pageSize: maxPageSize,
        fields: displayFields.join(','),
        queryFilter,
      };

      if (query) {
        urlParams.queryFilter = map(displayFields, (field) => `/${field} sw "${query}"`).join(' or ');
        [urlParams.sortKeys] = displayFields;
        if (this.queryFilterExtension) {
          urlParams.queryFilter = `(${urlParams.queryFilter}) and ${this.queryFilterExtension}`;
        }
      } else if (this.queryFilterExtension) {
        urlParams.queryFilter = this.queryFilterExtension;
      }

      if ((queryThreshold && query?.length < queryThreshold) && query.length !== 0) {
        requestEnabled = false;
      }

      if (requestEnabled) {
        const getResourceList = resourceType === 'managed' ? getManagedResourceList : getInternalResourceList;
        getResourceList(managedObjectName, urlParams).then((queryResults) => {
          this.relationshipField.options = [];
          each(queryResults.data.result, (resource) => {
            this.relationshipField.options.push({ value: `${this.resourceCollection.path}/${resource._id}`, resource, displayFields });
          });
        })
          .catch((error) => {
            this.showErrorMessage(error, this.$t('errors.errorRetrievingResource'));
          });
      }
    },
    /**
     * Adds original values to options and field value to allow field to display initial values
     * before managed query is sent of.
     */
    setOriginalValues() {
      if (this.value) {
        const displayFields = this.resourceCollection.query.fields;
        if (Array.isArray(this.value)) {
          this.relationshipField.options = this.value.map((value) => ({ value: value._ref, resource: value, displayFields }));
          this.relationshipField.value = this.value.map((value) => value._ref);
        } else {
          this.relationshipField.options = [{ value: this.value._ref, resource: this.value, displayFields }];
          this.relationshipField.value = this.value._ref;
        }
      }
    },
    emitSelected(selected) {
      let emitValues;
      if (selected && Array.isArray(selected)) {
        // Replace drop down value with single value if singleSelection prop is true
        if (this.singleSelection && selected.length > 1) {
          selected.shift();
        }

        // Ensure only unique values in array. Search executes a query,
        // so we can't simply adjust options to exclude selected values
        const uniqueSelected = selected.filter((val, index, selectedArray) => selectedArray.indexOf(val) === index);
        this.relationshipField.value = uniqueSelected;

        if (this.relationshipProperty.relationshipGrantTemporalConstraintsEnforced && this.temporalConstraint.length > 0) {
          const refProperties = { temporalConstraints: [{ duration: this.temporalConstraint }] };
          emitValues = uniqueSelected.map((currentValue) => ({ _ref: currentValue, _refProperties: refProperties }));
        } else {
          emitValues = uniqueSelected.map((currentValue) => ({ _ref: currentValue, _refProperties: {} }));
        }

        if (this.relationshipField?.options?.length) {
          const resourceSelections = selected.map((selection) => {
            const findOptionValueThatMatchesSelection = this.relationshipField.options.find((option) => option.value === selection);
            return findOptionValueThatMatchesSelection?.resource;
          });
          this.$emit('resource-selections', resourceSelections);
        }
      } else if (selected) {
        if (this.relationshipProperty.relationshipGrantTemporalConstraintsEnforced && this.temporalConstraint.length > 0) {
          const refProperties = { temporalConstraints: [{ duration: this.temporalConstraint }] };
          emitValues = { _ref: selected, _refProperties: refProperties };
        } else {
          emitValues = { _ref: selected, _refProperties: {} };
        }
      } else {
        this.relationshipField.value = null;
        emitValues = '';
      }

      this.$emit('setValue', emitValues);
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

.close-button {
  border: none;
  outline: none;
}
</style>
