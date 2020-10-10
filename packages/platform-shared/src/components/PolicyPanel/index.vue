<!-- Copyright 2019-2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <BRow>
    <BCol
      v-for="i in numColumns"
      :key="`password_policy_${i}`">
      <small>
        <ul class="pl-4">
          <li
            v-for="(policy) in policyColumns[i-1]"
            :key="policy.policyId"
            :class="[{'fr-valid': dynamic && isPolicyMet(policy)}, 'text-muted fr-policy-list-item']">
            {{ getPolicyDescription(policy) }}
          </li>
        </ul>
      </small>
    </BCol>
  </BRow>
</template>

<script>
import {
  includes,
} from 'lodash';
import {
  BCol,
  BRow,
} from 'bootstrap-vue';

/**
 * @description Part of the password policy component that displays the list of policy items required.
 * Shows failed policies in a normal text and passing policies in a light text.
 * */
export default {
  name: 'PolicyPanel',
  components: {
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
     * Array of policy objects [{ name: POLICYNAME, params: { PARAMNAME: VALUE } }, ...]
     */
    policies: {
      type: Array,
      default: () => [],
    },
    /**
     * Array of failing policies. Must match a value for name in policies array. ['FAILED1', 'FAILED2', ...]
     */
    policyFailures: {
      type: Array,
      default: () => [],
    },
    dynamic: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      policyColumns: [],
    };
  },
  computed: {
    numPolicies() {
      return this.policies.length;
    },
  },
  methods: {
    includes,
    /**
     * Returns a boolean indicating if the policy has been met.
     * @param {Object} policy required policy object to evaluate
     */
    isPolicyMet(policy) {
      return !includes(this.policyFailures, policy.name);
    },
    /**
     * Given an array of policies and a number of columns, distribute policies evenly.
     * @param {Object[]} policyList policies to be split
     * @param {Number} numColumns number of columns to split into
     * @return {Object[][]} Array of arrays indicating the policies in each column
     */
    getPolicyColumns(policyList, numColumns) {
      const policyColumns = [];
      const numPolicies = policyList.length;
      const policiesPerColumn = Math.floor(numPolicies / numColumns);
      const remaining = (numPolicies % numColumns);
      let curColumnIndex = 0;

      // Split policies between columns
      policyList.forEach((policy) => {
        if (typeof policyColumns[curColumnIndex] === 'undefined') {
          policyColumns.push([]);
        }
        policyColumns[curColumnIndex].push({ name: policy.name, params: policy.params });
        const limit = curColumnIndex < remaining ? (policiesPerColumn + 1) : policiesPerColumn;
        if (policyColumns[curColumnIndex].length >= limit) {
          curColumnIndex += 1;
        }
      });
      return policyColumns;
    },
    getPolicyDescription(policy) {
      return this.$t(`common.policyValidationMessages.${policy.name}`, policy.params);
    },
  },
  watch: {
    policies: {
      handler(value) {
        this.policyColumns = this.getPolicyColumns(value, this.numColumns);
      },
      immediate: true,
    },
  },
};
</script>

<style lang="scss" scoped>
.fr-valid {
  opacity: 0.5;
}
</style>
