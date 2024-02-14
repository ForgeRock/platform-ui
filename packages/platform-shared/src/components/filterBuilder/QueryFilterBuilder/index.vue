<!-- Copyright (c) 2022-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BCard body-class="p-3 p-sm-4">
    <template v-if="isBasic && allowBasicMode">
      <FrFilterBuilderGroup
        path="0"
        :class="{ 'pb-3': hideAdvanced }"
        :condition-options="conditionOptions"
        :disabled="disabled"
        :rules="queryFilter"
        :resource-name="resourceName"
        :depth="0"
        :max-depth="maxDepth"
        :hide-group="hideGroup"
        :index="0"
        :operator-options="operatorOptions"
        :properties="slashedProperties"
        :prefix-group-text="prefixGroupText"
        @add-rule="updateFilter('add-rule', $event)"
        @remove-rule="updateFilter('remove-rule', $event)"
        @operator-change="updateFilter('operator-change', $event)"
        @rule-change="updateFilter('rule-change', $event)" />
      <BButton
        v-if="!hideAdvanced"
        class="px-0 pt-4 pb-0"
        variant="link"
        @click="toggleMode(false)">
        {{ $t("queryFilterBuilder.advancedEditor") }}
      </BButton>
    </template>
    <template v-else-if="isBasic === false">
      <FrScriptEditor
        :value="{ source: filterString.toString() }"
        :script-title="$t('queryFilterBuilder.basicEditorHeadline')"
        :show-file-upload="false"
        :show-variables="false"
        @input="checkFilterString($event.source)"
        :readonly="disabled"
      />
      <BButton
        :disabled="!allowBasicMode"
        class="px-0"
        variant="link"
        @click="toggleMode(true, validatedQueryFilter)">
        {{ $t('queryFilterBuilder.basicEditor') }}
      </BButton>
    </template>
  </BCard>
</template>

<script>
import { BButton, BCard } from 'bootstrap-vue';
import { cloneDeep } from 'lodash';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import FrScriptEditor from '@forgerock/platform-shared/src/components/ScriptEditor';
import FrFilterBuilderGroup from '../components/FilterBuilderGroup';
import { defaultConditionOptions, operatorOptions, getTypeFromValue } from '../utils/QueryFilterDefaults';
import { findGroup, checkIfWithinThreeLayers } from '../utils/filterBuilderUtils';

const defaultFilterOperator = operatorOptions.Any.delimeter;

export default {
  name: 'QueryFilterBuilder',
  components: {
    BButton,
    BCard,
    FrFilterBuilderGroup,
    FrScriptEditor,
  },
  mixins: [RestMixin],
  computed: {
    slashedProperties() {
      return this.properties.map((prop) => ({
        ...prop,
        value: `/${prop.value}`,
      }));
    },
  },
  data() {
    return {
      isBasic: null,
      maxDepth: 4,
      queryFilter: {},
      filterString: this.queryFilterString,
      allowBasicMode: false,
      uniqueIndex: 0,
      validatedQueryFilter: {},
      conditionOptions: defaultConditionOptions,
      operatorOptions,
    };
  },
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    resourceName: {
      required: true,
      type: String,
    },
    properties: {
      default: () => [],
      type: Array,
    },
    queryFilterString: {
      default: '/ co ""',
      type: [String, Boolean],
    },
    hideAdvanced: {
      type: Boolean,
      default: false,
    },
    hideGroup: {
      default: false,
      type: Boolean,
    },
    prefixGroupText: {
      default: '',
      type: String,
    },
  },
  methods: {
    /**
     * Generates default group based on values passed in
     *
     * @property {Array} data - the rules that belong in this group
     * @property {String} operator - 'and' or 'or' operator
     *
     * @returns {Object} Newly generated group with given rules or default rule
     */
    getDefaultGroup(
      data = [this.getDefaultRule()],
      operator = defaultFilterOperator,
    ) {
      return {
        subfilters: data,
        operator,
        uniqueIndex: this.getUniqueIndex(),
      };
    },
    /**
     * Generates default rule based on values passed in
     *
     * @property {String} operator - Operator to compare the field's value to
     * @property {String} field - Field name of new rule
     * @property {String} value - Field value of new rule
     *
     * @returns {Object} Newly generated rule with given values or default values
     */
    getDefaultRule(operator = 'co', field = '/', value = '') {
      return {
        operator,
        field,
        value,
        uniqueIndex: this.getUniqueIndex(),
      };
    },
    /**
     * Ensures our keys in v-if iteration have unique values
     *
     * @returns {number} New unique index
     */
    getUniqueIndex() {
      this.uniqueIndex += 1;
      return this.uniqueIndex;
    },
    /**
     * Builds updated filter with newly changed rules
     *
     * @property {string} eventName - name of emitted event to determine exactly what to update
     * @property {Object} data - updated values
     */
    updateFilter(eventName, data) {
      const {
        depth, index, path, value, type,
      } = data;

      const tempFilter = cloneDeep(this.queryFilter);
      const paths = path.split(':');
      const group = findGroup(tempFilter, paths, 0, depth);

      switch (eventName) {
        case 'add-rule':
          if (type === 'row') {
            group.subfilters.splice(index + 1, 0, this.getDefaultRule());
          } else {
            group.subfilters.splice(index + 1, 0, this.getDefaultGroup());
          }
          this.$emit('error');
          break;
        case 'operator-change':
          group.operator = value;
          break;
        case 'rule-change':
          group.subfilters[index] = { ...group.subfilters[index], ...value };
          break;
        case 'remove-rule':
          group.subfilters.splice(index, 1);
          break;
        default:
          break;
      }
      this.$set(this.$data, 'queryFilter', tempFilter);
    },
    /**
     * Converts filter from object form to string form
     *
     * @property {Object} filter - Current layer of query filter in object form
     * @property {number} depth - Current depth within the filter object
     *
     * @returns {String} stringified filter
     */
    toFilterString(filter, depth) {
      if (filter.subfilter) {
        if (filter.subfilter.operator.charAt(0) === '!') {
          return `!${this.toFilterString(filter.subfilter, depth + 1)}`;
        }
        if (depth > 0) {
          return `(${this.toFilterString(filter.subfilter, depth + 1)})`;
        }
        return `${this.toFilterString(filter.subfilter, depth + 1)}`;
      }
      if (filter.subfilters) {
        const subfiltersString = filter.subfilters.map((subfilter) => this.toFilterString(subfilter, depth + 1)).join(` ${filter.operator} `);
        if (depth > 0 || filter.subfilters.length > 1) {
          return `(${subfiltersString})`;
        }
        return `${subfiltersString}`;
      } if (filter.operator === true || filter.operator === false) {
        return filter.operator;
      }
      const isNot = filter.operator.charAt(0) === '!';
      const ruleOperator = isNot
        ? filter.operator.substring(1, 3)
        : filter.operator;
      let rule = `${filter.field} ${ruleOperator}`;
      if (ruleOperator !== 'pr') {
        const value = this.toType(filter.value.replace(/"/g, '\\"'), filter.field);
        rule += ` ${value}`;
      }
      return isNot ? `!(${rule})` : `${rule}`;
    },
    /**
     * Combs through query filter to determine if filter contains a true/false operator or a complex '!' operator
     *
     * @property {Object} filter - Current query filter
     * @property {Boolean} advancedFound - Whether we have already found an advanced feature
     *
     * @returns {Boolean} indicating whether we found an advanced feature
     */
    hasAdvancedProperty(filter, advancedFound) {
      if (advancedFound) {
        return advancedFound;
      }
      // Check for true/false operators
      if (Object.keys(filter).includes('operator') && (filter.operator === true || filter.operator === false)) {
        return true;
      }
      // Check for complex '!' operators
      if (filter.operator === '!'
        && (filter.subfilters
        || (filter.subfilter && (filter.subfilter.operator === 'or' || filter.subfilter.operator === 'and')))) {
        return true;
      }
      if (filter.subfilter) {
        return this.hasAdvancedProperty(filter.subfilter, advancedFound);
      }
      if (filter.subfilters) {
        return filter.subfilters.find((subfilter) => this.hasAdvancedProperty(subfilter, advancedFound));
      }
      return false;
    },
    /**
     * Converts value based on what the field type is
     *
     * @property {String} val - field value
     * @property {String} field - Escaped field name
     *
     * @returns {String|number|Boolean} Converted value
     */
    toType(val, field) {
      const type = getTypeFromValue(field.substring(1), this.properties);
      switch (type) {
        case 'string':
          return `"${val}"`;
        case 'number':
          return val;
        case 'boolean':
          if (val === 'True' || val === 'true' || val === true) return true;
          if (val === 'False' || val === 'false' || val === false) return false;
          break;
        default:
          return `"${val}"`;
      }
      return `"${val}"`;
    },
    /**
     * Toggles between advanced and basic mode
     *
     * @property {Boolean} mode - whether we want to toggle to basic mode
     * @property {Object} validatedQueryFilter - validated queryFilter in Object form
     */
    toggleMode(mode, validatedQueryFilter) {
      if (mode) {
        const strippedString = this.filterString.replace(/^\s+|\s+$/g, '');
        if (strippedString === '') {
          this.setQueryFilter(this.getDefaultGroup());
        } else {
          this.setQueryFilter(validatedQueryFilter);
        }

        if (this.filterString === '') {
          this.checkFilterString('');
        }
        this.isBasic = mode;
      } else {
        this.validateFilter(this.filterString).then((validFilter) => {
          if (!validFilter) {
            this.allowBasicMode = false;
            this.$emit('error');
          } else {
            this.validatedQueryFilter = validFilter;
          }
          this.isBasic = mode;
        });
      }
    },
    /**
     * Uses util/validateQueryFilter api to validate that current filter works
     *
     * @property {String} filterSting - Query filter in string form
     *
     * @returns {Object} Validated filter if successful, false if not
     */
    validateFilter(filterString) {
      if (!filterString) return new Promise((resolve) => resolve(false));
      const idmInstance = this.getRequestService();
      const payload = { _queryFilter: filterString };
      return idmInstance.post('/util/validateQueryFilter?_action=validate', payload).then((query) => query.data, () => false);
    },
    /**
     * Walks through each layer of query filter object, removing excess parenthesis, and
     * checks for complex '!' operators
     *
     * @property {Object} queryFilter - Current query filter in object form after passing through validate api
     */
    normalizeQueryFilterObject(queryFilter) {
      if (queryFilter) {
        let normalized;
        if (queryFilter.subfilters) {
          normalized = queryFilter.subfilters.map((subfilter) => {
            if (subfilter.value === true) {
              subfilter.value = 'True';
            } else if (subfilter.value === false) {
              subfilter.value = 'False';
            }
            if (subfilter.subfilters) {
              this.normalizeQueryFilterObject(subfilter);
            } else if (subfilter.operator === '!') {
              if (subfilter.subfilter.operator === '!'
                || subfilter.subfilter.operator === 'and'
                || subfilter.subfilter.operator === 'or') {
                this.normalizeQueryFilterObject(subfilter);
              } else {
                delete subfilter.operator;
                const rule = {
                  ...subfilter.subfilter,
                  operator: `!${subfilter.subfilter.operator}`,
                };
                return rule;
              }
            }
            if (!subfilter.uniqueIndex) {
              subfilter.uniqueIndex = this.getUniqueIndex();
            }
            return subfilter;
          });
          queryFilter.subfilters = normalized;
        }
      }
      return queryFilter;
    },
    /**
     * Normalizes query filter object and emits it out to parent
     *
     * @property {Object} validatedQueryFilter - Previously validated query filter in object form
     */
    setQueryFilter(validatedQueryFilter) {
      const queryFilterUnnormalized = validatedQueryFilter.subfilters ? validatedQueryFilter : this.getDefaultGroup([validatedQueryFilter]);
      const queryFilter = this.normalizeQueryFilterObject(queryFilterUnnormalized);
      this.$set(this.$data, 'queryFilter', queryFilter);
    },
    /**
     * Validates the advanced filter string and allows returning to basic if valid
     *
     * @property {String} filterString - Query filter in string form
     */
    checkFilterString(filterString) {
      const strippedString = filterString.replace(/^\s+|\s+$/g, '');
      if (strippedString === '') {
        this.filterString = filterString;
        this.allowBasicMode = true;
        this.$emit('error');
      } else {
        this.validateFilter(strippedString).then((validatedQueryFilter) => {
          this.allowBasicMode = false;
          if (validatedQueryFilter) {
            this.validatedQueryFilter = validatedQueryFilter;
            const emptyPropertyNames = strippedString.match(/\/ /g);
            if (emptyPropertyNames && emptyPropertyNames.length) {
              this.$emit('error');
            } else {
              this.$emit('change', strippedString);
            }
            if (checkIfWithinThreeLayers(strippedString, this.maxDepth)
              && !this.hasAdvancedProperty(validatedQueryFilter, false)) {
              this.allowBasicMode = true;
            }
          } else {
            this.$emit('error');
          }
        });
      }
    },
  },
  watch: {
    queryFilter(queryFilter) {
      this.$emit('filter-update', queryFilter);
      const filterString = this.toFilterString(queryFilter, 0);
      this.filterString = filterString;
      const emptyPropertyNames = filterString.match(/\/ /g);
      if (emptyPropertyNames && emptyPropertyNames.length) {
        this.$emit('error');
      } else {
        this.$emit('change', filterString);
      }
    },
  },
  created() {
    this.validateFilter(this.queryFilterString).then((validatedQueryFilter) => {
      if (!checkIfWithinThreeLayers(this.queryFilterString, this.maxDepth)
        || this.hasAdvancedProperty(validatedQueryFilter, false)) {
        this.toggleMode(false);
      } else if (validatedQueryFilter) {
        this.toggleMode(true, validatedQueryFilter);
        this.allowBasicMode = true;
      } else if (this.queryFilterString !== '/ co ""' && this.queryFilterString !== '') {
        this.toggleMode(false);
        this.$emit('error');
      } else {
        this.toggleMode(true, this.getDefaultGroup());
        this.allowBasicMode = true;
      }
    });
  },
};
</script>

<style lang="scss">
.card-queryfilter-builder {
  &.depth-1 {
    border-left: 2px solid $blue;
  }

  &.depth-2 {
    border-left: 2px solid $green;
  }

  &.depth-3 {
    border-left: 2px solid $yellow;
  }
}
</style>
