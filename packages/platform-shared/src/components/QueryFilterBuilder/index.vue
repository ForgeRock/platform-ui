<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <BForm>
    <template v-if="isReady()">
      <BCard body-class="p-3 p-sm-4">
        <template v-if="isBasic">
          <div class="pb-4">
            <FrQueryFilterGroup
              path="0"
              group-path="0"
              :rules="queryFilter"
              :resource="resource"
              :depth="0"
              :max-depth="maxDepth"
              :index="0"
              :properties="slashedProperties"
              @add-group="triggerFilter('add-group', $event)"
              @add-rule="triggerFilter('add-rule', $event)"
              @remove-group="triggerFilter('remove-group', $event)"
              @remove-rule="triggerFilter('remove-rule', $event)"
              @operator-change="triggerFilter('operator-change', $event)"
              @rule-change="triggerFilter('rule-change', $event)"
            />
          </div>
          <BButton
            class="px-0"
            variant="link"
            @click="toggleMode(false)">
            {{ $t("queryFilterBuilder.advancedEditor") }}
          </BButton>
        </template>
        <template v-else>
          <QueryFilterAdvanced
            :query-filter="this.toFilterString(this.queryFilter)"
            @on-mode-button-click="toggleMode(true)"
            @on-change="setQueryFilter"
          />
        </template>
      </BCard>
    </template>
  </BForm>
</template>

<script>
import { BButton, BCard, BForm } from 'bootstrap-vue';
import { cloneDeep } from 'lodash';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import QueryFilterAdvanced from './QueryFilterAdvanced';
import QueryFilterGroup from './QueryFilterGroup';
import filterOperators, { getTypeFromValue } from './QueryFilterDefaults';


const defaultFilterOperator = filterOperators.Any.delimeter;

export default {
  name: 'QueryFilterBuilder',
  components: {
    QueryFilterAdvanced,
    BButton,
    BCard,
    BForm,
    FrQueryFilterGroup: QueryFilterGroup,
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
      isBasic: true,
      isDataComplete: false,
      maxDepth: 3,
      queryFilter: this.defaultGroup(),
    };
  },
  props: {
    resource: {
      required: true,
      type: String,
    },
    properties: {
      default: () => [],
      required: true,
      type: Array,
    },
    queryFilterString: {
      default: '()',
      required: false,
      type: String,
    },
  },
  methods: {
    cloneDeep,
    isReady() {
      return this.isDataComplete && this.properties.length > 0;
    },
    defaultGroup(
      data = [this.defaultRule()],
      operator = defaultFilterOperator,
    ) {
      return {
        subfilters: data,
        operator,
      };
    },
    defaultRule(operator = 'co', field = '', value = '') {
      return {
        operator,
        field,
        value,
      };
    },
    triggerFilter(name, data) {
      const {
        depth, index, path, value,
      } = data;

      const tempFilter = cloneDeep(this.queryFilter);
      const paths = path.split(':');
      const group = this.findGroup(tempFilter, paths, 0, depth);

      switch (name) {
      case 'add-rule':
        group.subfilters.splice(index + 1, 0, this.defaultRule());
        break;
      case 'add-group':
        group.subfilters.splice(index + 1, 0, this.defaultGroup());
        break;
      case 'operator-change':
        group.operator = value;
        break;
      case 'rule-change':
        group.subfilters[index] = { ...group.subfilters[index], ...value };
        break;
      case 'remove-group':
        group.subfilters.splice(index, 1);
        break;
      case 'remove-rule':
        group.subfilters.splice(index, 1);
        break;
      default:
        break;
      }
      this.$set(this.$data, 'queryFilter', tempFilter);
    },
    findGroup(filter, paths, pathIndex, depth) {
      if (depth === 0) return filter;
      if (pathIndex === 0) return this.findGroup(filter, paths, pathIndex + 1, depth);

      const tempFilter = filter.subfilters[paths[pathIndex]];

      if (pathIndex === depth) return tempFilter;
      return this.findGroup(tempFilter, paths, pathIndex + 1, depth);
    },
    toFilterString(subfilters) {
      const { operator } = subfilters;
      let str = '(';
      subfilters.subfilters.forEach((item) => {
        const isGroup = Object.keys(item).includes('subfilters');
        if (!isGroup) {
          const isNot = item.operator.charAt(0) === '!';
          const ruleOperator = isNot
            ? item.operator.substring(1, 3)
            : item.operator;
          const value = this.toType(item.value, item.field);
          const rule = ruleOperator !== 'pr'
            ? `${item.field} ${ruleOperator} ${value}`
            : `${item.field} ${ruleOperator}`;
          str += isNot ? `!(${rule})` : `${rule}`;
          str += ` ${operator} `;
        } else {
          str += `${this.toFilterString(item)} ${operator} `;
        }
      });
      str = `${str.substring(0, str.length - operator.length - 2)})`;
      return str;
    },
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
    toggleMode(mode) {
      this.$set(this.$data, 'isBasic', mode);
    },
    async validateFilter(str) {
      const idmInstance = this.getRequestService();
      const payload = {
        type: 'text/javascript',
        source:
          'org.forgerock.json.resource.QueryFilters.parse(queryFilter).accept(new org.forgerock.util.query.MapFilterVisitor(), null);',
        globals: {
          queryFilter: str,
        },
      };

      let resp;
      try {
        const query = await idmInstance.post('/script?_action=eval', payload);
        resp = query.data.operator && typeof query.data.operator === 'string' ? query.data : false;
      } catch (error) {
        resp = false;
      }

      console.log('resp:', resp);

      if (!this.isDataComplete) this.$set(this.$data, 'isDataComplete', true);
      return resp;
    },
    normalizeQueryFilterArray(queryFilter) {
      let normalized;
      if (queryFilter && queryFilter.subfilters) {
        normalized = queryFilter.subfilters.map((subfilter) => {
          if (subfilter.value === true) subfilter.value = 'True';
          if (subfilter.value === false) subfilter.value = 'False';
          if (subfilter.operator === '!') {
            delete subfilter.operator;
            const rule = {
              ...subfilter.subfilter,
              operator: `!${subfilter.subfilter.operator}`,
            };
            return rule;
          }
          if (subfilter.subfilters) this.normalizeQueryFilterArray(subfilter);
          return subfilter;
        });
        queryFilter.subfilters = normalized;
      }
      return queryFilter;
    },
    async setQueryFilter(queryFilterString) {
      const queryFilterValidated = await this.validateFilter(queryFilterString.replace(/^\s+|\s+$/g, ''));
      if (queryFilterValidated) {
        const queryFilterUnnormalized = queryFilterValidated.subfilters ? queryFilterValidated : this.defaultGroup([queryFilterValidated]);
        const queryFilterArray = this.normalizeQueryFilterArray(queryFilterUnnormalized);
        this.$emit('change', queryFilterString);
        this.$set(this.$data, 'queryFilter', cloneDeep(queryFilterArray));
      } else {
        this.$emit('error');
      }
    },
  },
  watch: {
    queryFilter() {
      const filterString = this.toFilterString(this.queryFilter);
      this.$emit('change', filterString);
    },
  },
  created() {
    this.setQueryFilter(this.queryFilterString);
  },
};
</script>

<style lang="scss" scoped>
.card-container-properties {
  border: 1px solid $gray-200;
  border-left: 2px solid $primary;
}

/deep/ .multiselect__tags {
  white-space: nowrap;
}
</style>

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
