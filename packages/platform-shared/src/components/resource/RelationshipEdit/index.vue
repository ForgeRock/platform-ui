<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div>
    <BFormGroup
      v-if="showResourceType"
      :label-cols="isRelationshipArray || newResource ? 11 : 0"
      :label="relationshipProperty.title + ' Type'"
      :label-for="'editResourceType' + index"
      horizontal>
      <Multiselect
        :value="resourceCollection"
        :options="rescourceCollectionTypes"
        open-direction="below"
        :show-labels="false"
        label="label"
        track-by="label"
        @select="setResourceCollectionType">
        <template
          v-slot:option="{ option }">
          {{ option.text }}
        </template>
      </Multiselect>
    </BFormGroup>

    <BFormGroup
      :label-cols-sm="isRelationshipArray || newResource ? 11 : 0"
      :label-cols-md="isRelationshipArray || newResource ? 11 : 0"
      :label-cols-lg="isRelationshipArray || newResource ? 11 : 2"
      :label-class="{'ml-3': !isRelationshipArray && !newResource }"
      :label="relationshipProperty.title"
      label-for="relationshipProperty.key"
      horizontal>
      <Multiselect
        v-model="selected"
        :id="relationshipProperty.key + index"
        :options="options"
        :placeholder="'Type to search for ' + this.resourceCollection.label"
        open-direction="bottom"
        :show-labels="false"
        :internal-search="false"
        :clear-on-select="false"
        :multiple="isRelationshipArray"
        :close-on-select="!isRelationshipArray"
        :preserve-search="isRelationshipArray"
        :options-limit="10"
        :limit="10"
        :max-height="600"
        :show-no-results="false"
        :hide-selected="true"
        @search-change="setOptions"
        @select="setSelected"
        @open="setSelected"
        :show-no-options="false">
        <template
          v-slot:singleLabel="{ option }">
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
        <template
          v-slot:tag="{ option }"
          class="mb-3">
          <div class="media">
            <div class="media-body p-1 border-bottom border-light">
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
      </Multiselect>
    </BFormGroup>
    <BFormGroup
      v-if="relationshipProperty.relationshipGrantTemporalConstraintsEnforced"
      :label-cols="isRelationshipArray || newResource ? 11 : 0"
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
// eslint-disable-next-line import/no-extraneous-dependencies
import { getSchema } from '@forgerock/platform-shared/src/api/SchemaApi';

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
    relationshipProperty: {
      type: Object,
      required: true,
    },
    value: {
      type: Object,
      required: false,
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
      isRelationshipArray: false,
      temporalConstraint: '',
      temporalConstraintEnabled: {
        value: false,
        type: 'boolean',
      },
    };
  },
  mounted() {
    this.isRelationshipArray = has(this.relationshipProperty, 'items');

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
      if (this.selected && this.selected.length) {
        this.selected.forEach((selection) => {
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
        if (this.selected && this.selected.length) {
          this.selected.forEach((selection) => {
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

      this.selected = null;

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

      this.options = [];

      if (!query && !this.selected && this.value) {
        // eslint-disable-next-line no-underscore-dangle
        this.selected = { value: this.value._ref, resource: this.value, displayFields };
      }

      if (query) {
        queryFilter = map(displayFields, (field) => `/${field} sw "${query}"`).join(' or ');

        const urlQuery = `?_sortKeys=${this.resourceCollection.query.fields[0]}&_pageSize=${maxPageSize}&_fields=${displayFields.join(',')}&_queryFilter=${queryFilter}`;
        const idmInstance = this.getRequestService();

        idmInstance.get(`${this.resourceCollection.path}${urlQuery}`).then((queryResults) => {
          each(queryResults.data.result, (resource) => {
            // eslint-disable-next-line no-underscore-dangle
            this.options.push({ value: `${this.resourceCollection.path}/${resource._id}`, resource, displayFields });
          });
        })
          .catch((error) => {
            this.displayNotification('IDMMessages', 'error', error.response.data.message);
          });
      }
    },
    setSelected(selected) {
      if (selected.value && this.relationshipProperty.relationshipGrantTemporalConstraintsEnforced && this.temporalConstraint.length > 0) {
        const refProperties = { temporalConstraints: [{ duration: this.temporalConstraint }] };
        this.selected = selected;
        this.$emit('setValue', { property: this.relationshipProperty.key, value: { _ref: selected.value, _refProperties: refProperties } });
      } else if (selected.value) {
        this.selected = selected;
        this.$emit('setValue', { property: this.relationshipProperty.key, value: { _ref: selected.value } });
      } else {
        this.selected = null;
        this.$emit('setValue', { property: this.relationshipProperty.key, value: null });
      }
    },
  },
};
</script>
<style lang="scss" scoped>
@import '~vue-multiselect/dist/vue-multiselect.min.css';

/deep/ {
  .multiselect {
    color: $input-color;

    .multiselect__placeholder {
      position: relative;
      top: 5px;
      padding-top: 0;
    }

    .multiselect__tags {
      padding-top: 10px;
      padding-bottom: 10px;
    }

    .multiselect__select {
      top: 6px;
    }

    .multiselect__option--selected.multiselect__option--highlight {
      background-color: $primary;
    }

    .multiselect__option.multiselect__option--highlight {
      background-color: $light;
      color: $input-color;
    }

    .multiselect__single {
      position: relative;
      top: 4px;
    }

    .multiselect__input {
      position: relative;
      top: 3px;
    }
  }
}
</style>
