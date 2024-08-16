<!-- Copyright (c) 2022-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BCard body-class="p-3 p-sm-4">
    <template v-if="isBasic">
      <FrFilterBuilderGroup
        is-ldap
        path="0"
        :condition-options="ldapDefaultConditionOptions"
        :depth="0"
        :disabled="disabled"
        :index="0"
        :operator-options="ldapOperatorOptions"
        :max-depth="maxDepth"
        :rules="queryFilter"
        @add-rule="updateFilter('add-rule', $event)"
        @remove-rule="updateFilter('remove-rule', $event)"
        @rule-change="updateFilter('rule-change', $event)"
        @operator-change="updateFilter('operator-change', $event)" />
      <BButton
        class="px-0 pt-4 pb-0"
        variant="link"
        @click="isBasic = false">
        {{ $t("queryFilterBuilder.advancedEditor") }}
      </BButton>
    </template>
    <template v-else>
      <FrScriptEditor
        :value="{ source: filterString.toString() }"
        :script-title="$t('queryFilterBuilder.basicEditorHeadline')"
        :show-file-upload="false"
        :show-variables="false"
        @input="updateScriptEditor"
        :readonly="disabled" />

      <BButton
        :disabled="!allowBasic"
        class="px-0"
        variant="link"
        @click="isBasic = true">
        {{ $t('queryFilterBuilder.basicEditor') }}
      </BButton>
    </template>
  </BCard>
</template>

<script>
import {
  BButton,
  BCard,
} from 'bootstrap-vue';
import {
  cloneDeep,
  find,
  map,
} from 'lodash';
import { parse } from 'ldap-filter';
import FrScriptEditor from '@forgerock/platform-shared/src/components/ScriptEditor';
import FrFilterBuilderGroup from '../components/FilterBuilderGroup';
import { checkIfWithinThreeLayers, findGroup } from '../utils/filterBuilderUtils';
import { ldapDefaultConditionOptions, conditionMap, ldapOperatorOptions } from '../utils/LdapFilterDefaults';

export default {
  name: 'LdapFilterBuilder',
  components: {
    BButton,
    BCard,
    FrFilterBuilderGroup,
    FrScriptEditor,
  },
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    path: {
      type: String,
      default: null,
    },
    value: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      allowBasic: true,
      filterString: '',
      isBasic: true,
      maxDepth: 4,
      queryFilter: {},
      ldapOperatorOptions,
      ldapDefaultConditionOptions,
      uniqueIndex: 0,
    };
  },
  computed: {
    comparators() {
      return Object.keys(ldapDefaultConditionOptions).map((key) => (ldapDefaultConditionOptions[key].value));
    },
  },
  watch: {
    filterString(value) {
      this.$emit('input', { path: this.path, value });
    },
  },
  mounted() {
    this.filterString = this.value ? this.value : '(objectClass=*)';
    this.setFilterObject(this.filterString);
  },
  methods: {
    /**
     * Generates default group based on values passed in
     *
     * @property {String} operator - subfilter operator
     * @property {String} field - subfilter field name
     * @property {String} value - subfilter value
     * @returns {Object} Newly generated group with given rules and 'or' operator
     */
    getDefaultGroup(operator = '=', field = '', value = '') {
      return {
        operator: 'or',
        subfilters: [this.getDefaultRule(operator, field, value)],
        uniqueIndex: this.getUniqueIndex(),
      };
    },
    /**
     * Generates default rule based on values passed in
     *
     * @property {String} operator - Operator to compare the field's value to
     * @property {String} field - Field name of new rule
     * @property {String} value - Field value of new rule
     * @returns {Object} Newly generated rule with given values or default values
     */
    getDefaultRule(operator = '=', field = '', value = '') {
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
     * Get a filter object that matches format needed for FilterBuilderGroup component
     *
     * @property {Object} filterObj - object representation of filter from ldap-filter.parse()
     * @returns {Object} normalized filter object
     */
    getNormalizedFilterObject(filterObj) {
      const normalize = (filter) => {
        const newFilter = {};
        // handle different ldap-filter filter types
        switch (filter.type) {
          case 'and':
          case 'or':
          case 'not':
            newFilter.operator = filter.type;
            break;
          case 'present':
            newFilter.field = filter.attribute;
            newFilter.operator = '=';
            newFilter.value = '*';
            break;
          case 'substring':
            newFilter.field = filter.attribute;
            newFilter.operator = '=';
            newFilter.value = [filter.initial, ...filter.any, filter.final].join('*');
            break;
          default:
            newFilter.operator = filter.rule ? `:${filter.rule}:=` : conditionMap[filter.type];
            newFilter.field = filter.attribute;
            newFilter.value = filter.value;
            break;
        }

        if (!newFilter.uniqueIndex) {
          newFilter.uniqueIndex = this.getUniqueIndex();
        }

        // recurse through subfilters or single subfilter
        if (filter.filters && filter.filters.length) newFilter.subfilters = map(filter.filters, (filterPiece) => normalize(filterPiece));
        else if (filter.filter) newFilter.subfilters = [normalize(filter.filter)];

        return newFilter;
      };
      const normalizedFilter = normalize(filterObj);
      return normalizedFilter;
    },
    /**
     * Set filter object from filter string, if possible
     * if not possible, show advanced editor
     *
     * @property {String} filterString - string representation of filter
     */
    setFilterObject(filterString) {
      try {
        let filterObj = parse(filterString);
        filterObj = this.getNormalizedFilterObject(filterObj);

        if (this.isComplex(filterString, filterObj)) {
          this.allowBasic = false;
          this.isBasic = false;
          return;
        }

        if (!filterObj.subfilters) {
          const { operator, field, value } = filterObj;
          filterObj = this.getDefaultGroup(operator, field, value);
        }

        filterObj = this.negateFilter(filterObj);
        this.queryFilter = filterObj;
        this.allowBasic = true;
      } catch {
        this.allowBasic = false;
        this.isBasic = false;
      }
    },
    /**
     * Checks both filter string and filter object for complexity
     *
     * @property {String} filterString - string representation of filter
     * @property {Object} filterObj - object representation of filter
     * @returns {Boolean} are the filters complex
     */
    isComplex(filterString, filterObj) {
      return this.isAdvancedFilter(filterObj) || !checkIfWithinThreeLayers(filterString, this.maxDepth);
    },
    /**
     * Is a filter advanced
     * checks operators and comparators to ensure they are supported
     * checks 'not' filters for complex subfilters
     *
     * @property {Object} filterObj - object representation of filter
     * @returns {Boolean} does filter contain a complex 'none' filter
     */
    isAdvancedFilter(filterObj) {
      let isAdvanced = false;
      const detectAdvanced = (filter) => {
        // contains a condition not supported by ldapFilterBuilder
        const isSupportedCondition = find(
          ldapDefaultConditionOptions,
          (condition) => (condition.value === filter.operator),
        );

        // contains an operator not supported by ldapFilterBuilder
        const isSupportedOperator = find(
          { ...ldapOperatorOptions, not: { delimeter: 'not' } },
          (operator) => (operator.delimeter === filter.operator),
        );

        if (!filter.operator || (!isSupportedCondition && !isSupportedOperator)) {
          isAdvanced = true;
          return;
        }

        // check for a none with subfilters
        if (filter.operator === 'not' && filter.subfilters) {
          const { operator } = filter.subfilters[0];
          if (operator === 'or' || operator === 'and') {
            isAdvanced = true;
            return;
          }
        }
        // recurse through subfilters
        if (filter.subfilters) {
          filter.subfilters.forEach((subfilter) => {
            detectAdvanced(subfilter);
          });
        }
      };

      detectAdvanced(filterObj);
      return isAdvanced;
    },
    /**
     * for 'none' filters, we must change operator to or and negate the subfilter
     *
     * @property {Object} filterObj - object representation of filter
     * @returns {Object} filter with subfilters negated
     */
    negateFilter(filterObj) {
      let newFilter = cloneDeep(filterObj);
      const negate = (filter, isSubfilter) => {
        if (filter.operator === 'not') {
          const subfilter = filter.subfilters[0];

          if (isSubfilter) {
            filter.field = subfilter.field;
            filter.operator = `!${subfilter.operator}`;
            filter.value = subfilter.value;
            delete filter.subfilters;
          } else {
            filter.operator = 'or';
            subfilter.operator = `!${subfilter.operator}`;
          }
        }

        // recurse through subfilters
        if (filter.subfilters) {
          filter.subfilters.map((subfilter) => (negate(subfilter, true)));
        }

        return filter;
      };

      newFilter = negate(newFilter, false);
      return newFilter;
    },
    /**
     * Converts filter from object form to string form
     *
     * @property {Object} filterObj - Current layer of query filter in object form
     * @returns {String} stringified filter
     */
    toFilterString(filterObj) {
      let tempString = '';
      const buildString = (filter) => {
        const numSubfilters = filter.subfilters ? filter.subfilters.length : 0;
        const negated = filter.operator.charAt(0) === '!';

        switch (filter.operator) {
          case 'and':
            if (numSubfilters > 1) tempString += '(&';
            break;
          case 'or':
            if (numSubfilters > 1) tempString += '(|';
            break;
          default:
            if (negated) tempString += `(!(${filter.field}${filter.operator.substring(1)}${filter.value}))`;
            else tempString += `(${filter.field}${filter.operator}${filter.value})`;
            break;
        }

        // recurse through subfilters
        if (numSubfilters) {
          filter.subfilters.forEach((subfilter) => {
            buildString(subfilter);
          });
        }
        if (numSubfilters > 1) tempString += ')';
      };

      buildString(filterObj);
      return tempString;
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
      this.filterString = this.toFilterString(tempFilter);
      this.queryFilter = tempFilter;
    },
    /**
     * Updates the filter string with the provided script's source code.
     *
     * @param {Object} script - The script object containing the source code.
     *
     */
    updateScriptEditor(script) {
      this.filterString = script.source;
      this.setFilterObject(script.source);
    },
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
