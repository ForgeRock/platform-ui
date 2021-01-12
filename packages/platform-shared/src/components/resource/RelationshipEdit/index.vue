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
      <Multiselect
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
      </Multiselect>
    </BFormGroup>

    <FrField
      open-direction="bottom"
      :field="relationshipField"
      :allow-empty="true"
      :id="relationshipProperty.key + index"
      :placeholder="$t('common.placeholders.typeToSearchFor', {item: resourceCollection.label})"
      :show-labels="false"
      :internal-search="false"
      :clear-on-select="false"
      :preserve-search="isRelationshipArray"
      :options-limit="10"
      :limit="10"
      :max-height="600"
      :show-no-results="false"
      :show-no-options="false"
      :searchable="true"
      @search-change="setOptions"
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
          <div class="text-muted">
            {{ option.resource[option.displayFields[0]] }}
          </div>
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
      <div class="d-flex-row form-group">
        <FrField
          class="d-inline"
          :field="temporalConstraintEnabled" />
        <label class="text-muted">
          {{ $t('common.helpText.timeConstraint') }}
        </label>
      </div>
      <FrTimeConstraint
        v-if="temporalConstraintEnabled.value"
        v-model="temporalConstraint" />
    </BFormGroup>
  </div>
</template>

<script>
import {
  map, each, find, has,
} from 'lodash';
import { BFormGroup } from 'bootstrap-vue';
import Multiselect from 'vue-multiselect';
import TimeConstraint from '@forgerock/platform-shared/src/components/TimeConstraint';
import FrField from '@forgerock/platform-shared/src/components/Field';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import { getSchema } from '@forgerock/platform-shared/src/api/SchemaApi';
import encodeQueryString from '@forgerock/platform-shared/src/utils/encodeQueryString';

export default {
  name: 'RelationshipEdit',
  components: {
    Multiselect,
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
      temporalConstraintEnabled: {
        value: false,
        type: 'boolean',
      },
      relationshipField: {
        ...this.relationshipProperty,
        type: has(this.relationshipProperty, 'items') ? 'multiselect' : 'select',
        options: [],
        disabled: this.disabled,
      },
    };
  },
  mounted() {
    this.allResourceCollections = this.isRelationshipArray ? this.relationshipProperty.items.resourceCollection : this.relationshipProperty.resourceCollection;

    this.rescourceCollectionTypes = map(this.allResourceCollections, (prop, index) => ({ value: prop.path, text: prop.label, index }));

    if (this.value) {
      // eslint-disable-next-line no-underscore-dangle
      const currentResourceCollectionType = find(this.rescourceCollectionTypes, { value: this.value._refResourceCollection });

      this.setResourceCollectionType(currentResourceCollectionType);
    } else {
      this.setResourceCollectionType();
    }
  },
  watch: {
    temporalConstraint(newVal) {
      if (this.relationshipField.value && this.relationshipField.value.length) {
        this.relationshipField.value.forEach((selection) => {
          const refProperties = { temporalConstraints: [{ duration: newVal }] };
          this.$emit('setValue', { property: this.relationshipProperty.key, value: { _ref: selection.value, _refProperties: refProperties } });
        });
      }
    },
    /**
     * adds/removes temporal constraint property of relationship based on toggle value
     */
    temporalConstraintEnabled: {
      handler(newVal) {
        if (this.relationshipField.value && this.relationshipField.value.length) {
          this.relationshipField.value.forEach((selection) => {
            const refProperties = newVal.value ? { temporalConstraints: [{ duration: this.temporalConstraint }] } : null;
            this.$emit('setValue', { property: this.relationshipProperty.key, value: { _ref: selection.value, _refProperties: refProperties } });
          });
        }
      },
      deep: true,
    },
  },
  methods: {
    setResourceCollectionType(rescourceCollectionType) {
      let index = 0;

      if (rescourceCollectionType) {
        // eslint-disable-next-line prefer-destructuring
        index = rescourceCollectionType.index;
      }

      this.relationshipField.value = null;

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
    setOptions(query) {
      const maxPageSize = 10;
      const displayFields = this.resourceCollection.query.fields;
      let queryFilter = true;

      if (!query && (!this.relationshipField.value || this.relationshipField.value.length === 0) && this.value) {
        // eslint-disable-next-line no-underscore-dangle
        this.relationshipField.options = [{ value: this.value._ref, resource: this.value, displayFields }];
        // eslint-disable-next-line no-underscore-dangle
        this.relationshipField.value = this.value._ref;
      }

      if (query) {
        queryFilter = map(displayFields, (field) => `/${field} sw "${query}"`).join(' or ');

        const urlParams = {
          sortKeys: this.resourceCollection.query.fields[0],
          pageSize: maxPageSize,
          fields: displayFields.join(','),
          queryFilter,
        };
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
