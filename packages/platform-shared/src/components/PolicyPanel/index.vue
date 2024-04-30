<!-- Copyright (c) 2019-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BRow>
    <BCol
      v-for="i in numColumns"
      :key="`password_policy_${i}`">
      <small>
        <ul
          :class="policyDisplayCheckmark ? 'pl-1' : 'pl-4'"
          :id="policyPanelId"
        >
          <li
            v-for="(policy) in policyColumns[i-1]"
            class="text-muted fr-policy-list-item"
            :key="policy.policyId"
            :class="getPolicyClasses(policy)">
            <template v-if="policyDisplayCheckmark">
              <FrIcon
                v-if="isPolicyMet(policy)"
                icon-class="text-success"
                name="check" />
              <FrIcon
                v-else
                :icon-class="{ 'text-danger': displayDangerStyle }"
                name="close" />
            </template>
            <span aria-hidden="true">
              {{ getPolicyDescription(policy) }}
            </span>
            <p
              v-if="touched && isPolicyMet(policy)"
              class="sr-only"
              data-testid="passed-policy"
              role="alert">
              {{ $t('common.policyValidationMessages.srOnlyMet', { policy: getPolicyDescription(policy) }) }}
            </p>
            <p
              v-if="touched && !isPolicyMet(policy)"
              class="sr-only"
              data-testid="failed-policy"
              :role="valueEntered ? 'alert': null">
              {{ $t('common.policyValidationMessages.srOnlyNotMet', { policy: getPolicyDescription(policy) }) }}
            </p>
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
import FrIcon from '@forgerock/platform-shared/src/components/Icon';

/**
 * Part of the password policy component that displays the list of policy items required.
 * Shows failed policies in a normal text and passing policies in a light text.
 * */
export default {
  name: 'PolicyPanel',
  components: {
    BCol,
    BRow,
    FrIcon,
  },
  props: {
    /**
     * Whether the text-danger class should be shown on any password policy
     */
    displayDangerStyle: {
      default: false,
      type: Boolean,
    },
    /**
     * Number of columns to display. Policies are evenly distributed between columns.
     */
    numColumns: {
      type: Number,
      default: 1,
    },
    /**
     * Array of policy objects [{ policyRequirement: POLICYNAME, params: { PARAMNAME: VALUE } }, ...]
     */
    policies: {
      type: Array,
      default: () => [],
    },
    /**
     * Whether policy items should be displayed as ✔/X
     */
    policyDisplayCheckmark: {
      default: false,
      type: Boolean,
    },
    /**
     * Array of failing policies. Must match a value for name in policies array. ['FAILED1', 'FAILED2', ...]
     */
    policyFailures: {
      type: Array,
      default: () => [],
    },
    /**
     * Whether a value has been entered in the field tied to this policy panel
     */
    valueEntered: {
      default: false,
      type: Boolean,
    },
    policyPanelId: {
      type: String,
      default: '',
    },
    /**
     * Whether the associated field has been focused
     */
    touched: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      policyColumns: [],
    };
  },
  methods: {
    /**
     * Returns a boolean indicating if the policy has been met.
     * @param {Object} policy required policy object to evaluate
     */
    isPolicyMet(policy) {
      return this.valueEntered && !includes(this.policyFailures, policy.policyRequirement);
    },
    /**
     * Builds policy class array based on field state
     * @param {Object} policy required policy object to evaluate
     */
    getPolicyClasses(policy) {
      const classes = [];
      if (this.policyDisplayCheckmark) {
        classes.push('list-unstyled opacity-100');
        if (!this.isPolicyMet(policy) && this.displayDangerStyle) {
          classes.push('text-danger');
        }
      } else if (this.isPolicyMet(policy)) {
        classes.push('opacity-50 fr-valid');
      }
      return classes;
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
        policyColumns[curColumnIndex].push(policy);
        const limit = curColumnIndex < remaining ? (policiesPerColumn + 1) : policiesPerColumn;
        if (policyColumns[curColumnIndex].length >= limit) {
          curColumnIndex += 1;
        }
      });
      return policyColumns;
    },
    /**
     * Get the translated policy messages
     * @param {Object} policy object containing policy data needed for translation
     */
    getPolicyDescription(policy) {
      let formattedParams = policy.params;
      if (typeof policy.params === 'object') {
        formattedParams = Object.keys(policy.params).reduce((newParams, param) => {
          // Remove hyphens in server generated policy params as these do not work as interpolations keys in vue-i18n 9.x
          const formattedParam = param.replace(/-/g, '');
          newParams[formattedParam] = policy.params[param];
          return newParams;
        }, {});
      }
      return this.$t(`common.policyValidationMessages.${policy.policyRequirement}`, formattedParams);
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
ul {
  li.checkmark {
    color: $red !important;
  }
}

:deep(.material-icons-outlined) {
  line-height: 1.13rem;
}
</style>
