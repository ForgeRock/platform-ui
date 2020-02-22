<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <BContainer class="fr-requirements-list">
    <BRow>
      <BCol
        v-for="i in numColumns"
        :key="`password_policy_${i}`">
        <ul class="mt-3 mb-0 px-1">
          <li
            v-for="(policy, index) in policyColumns[i-1]"
            :key="index"
            :class="policiesMetColumns[i-1][index].val ? 'opacity-30' : 'text-muted'">
            <small v-if="policy.val !== true">
              {{ $t(`passwordPolicy.${policy.policy}`, {count: policy.val}) }}
            </small>
            <small v-else>
              {{ $t(`passwordPolicy.${policy.policy}`) }}
            </small>
          </li>
        </ul>
      </BCol>
    </BRow>
  </BContainer>
</template>

<script>
import {
  BCol,
  BRow,
  BContainer,
} from 'bootstrap-vue';

/**
 * Requirements List is used to give a user immediate feedback on failed or passing requirements.
 */
export default {
  name: 'RequirementsList',
  components: {
    BContainer,
    BCol,
    BRow,
  },
  props: {
    /**
     * Number of columns to display. Policies are evenly distributed between columns.
     */
    numColumns: {
      type: Number,
      default: 1,
    },
    /**
     * List of all required rules. Key should be the rule name.
     * Value is true if boolean rule or a parameter value if non-boolean e.g. { requireNumber: true, minLength: 6 }
     */
    rules: {
      type: Object,
      default: () => {},
    },
    /**
     * List of all failing rules. Needs to match rule name provided in rules prop.
     */
    failedRules: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      policyColumns: [],
      policiesMet: [],
    };
  },
  computed: {
    numPolicies() {
      return Object.keys(this.rules).length;
    },
    policiesMetColumns() {
      return this.getPolicyColumns(this.policiesMet, this.numColumns);
    },
  },
  methods: {
    /**
     * Divides policies into columns, distributing them evenly
     *
     * @param {object} policyList - object containing all policies
     */
    getPolicyColumns(policyList, numColumns) {
      const policyColumns = [];
      const numPolicies = Object.keys(policyList).length;
      const policiesPerColumn = Math.floor(numPolicies / numColumns);
      const remaining = (numPolicies % numColumns);
      let curColumnIndex = 0;

      // Split policies between columns
      Object.keys(policyList).forEach((policy) => {
        if (typeof policyColumns[curColumnIndex] === 'undefined') {
          policyColumns.push([]);
        }
        policyColumns[curColumnIndex].push({ policy, val: policyList[policy] });
        const limit = curColumnIndex < remaining ? (policiesPerColumn + 1) : policiesPerColumn;
        if (policyColumns[curColumnIndex].length >= limit) {
          curColumnIndex += 1;
        }
      });

      return policyColumns;
    },
  },
  created() {
    this.policyColumns = this.getPolicyColumns(this.rules, this.numColumns);
  },
  watch: {
    failedRules: {
      immediate: true,
      handler(val) {
        const indexes = [];
        // find which indexes correlate to the failed policies
        Object.keys(val).forEach((policyName) => {
          const index = Object.keys(this.rules).indexOf(policyName);
          indexes.push(index);
          this.policiesMet.splice(index, 1, false);
        });
        // set policies for the ones that meet requirements
        Object.keys(this.rules).forEach((policy, index) => {
          if (!indexes.includes(index)) {
            this.policiesMet.splice(index, 1, true);
          }
        });
      },
    },
    numColumns() {
      this.policyColumns = this.getPolicyColumns(this.rules, this.numColumns);
    },
  },
};
</script>

<style lang="scss" scoped>
small {
  font-size: 0.875rem;
}
</style>
