<!--
Copyright (c) 2020 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details.
-->

<template>
  <div>
    <FrField
      :failed-policies="serverFailures"
      :field="password"
      @input="updateCallback" />
    <FrPolicyPanel
      class="mt-2"
      :num-columns="1"
      :policies="policies"
      :policy-failures="failedPolicies" />
  </div>
</template>

<script>
import FrField from '@forgerock/platform-shared/src/components/Field';
import PolicyPanel from '@forgerock/platform-shared/src/components/PolicyPanel';
import { debounce, filter } from 'lodash';

/**
 * Handles validating a password through node without advancing the tree.
 * Allows the display of validation errors as the the user types a password.
 */
export default {
  name: 'ValidatedCreatePasswordCallback',
  components: {
    FrField,
    FrPolicyPanel: PolicyPanel,
  },
  props: {
    /**
     * Validated password callback containing all inputs and outputs.
     */
    callback: {
      type: Object,
      required: true,
    },
    /**
     * The current step in the auth tree. Needed to submit to tree.
     */
    step: {
      type: Object,
      required: true,
    },
    /**
     * The current auth object. Needed to submit to tree.
     */
    auth: {
      type: Function,
      required: true,
    },
    /**
     * The current realm. Needed to submit to tree for testing password validity
     */
    realm: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      debounceValidatePassword: debounce(this.validatePassword, 200),
      failedPolicies: [],
      password: {
        title: this.callback.getOutputByName('prompt'),
        type: 'password',
        value: '',
      },
      policies: [],
      serverFailures: [],
    };
  },
  mounted() {
    // need to set validatOnly flag to true so that tree does not advance when validating input
    this.callback.setInputValue(true, 1);

    this.setPolicies(this.callback.getOutputByName('policies').policies);
    this.setFailingPolicies(this.callback.getOutputByName('failedPolicies'));
  },
  methods: {
    /**
     * Removes policies that do not need to display
     * @param {Object} policies required policies provided in callback
     * @return {Object} policy object with only relevant policies
     */
    filterPolicies(policies) {
      const excludedPolicies = [
        'REQUIRED',
        'IS_NEW',
        'VALID_TYPE',
        'CANNOT_CONTAIN_OTHERS',
      ];
      return filter(policies, (policy) => (!excludedPolicies.includes(policy.name)));
    },
    /**
     * Sets required policies for PolicyPanel component
     * Policies are filtered to exclude some unnecessary policies
     * @param {Object[]} policies required policies provided in callback
     */
    setPolicies(policies) {
      // build policy objects
      const policyRequirements = policies.map((policy) => {
        const name = policy.policyRequirements[0];

        // if a policy has parameters, need to add to object
        if (policy.params) {
          const params = {};
          Object.keys(policy.params).forEach((key) => {
            params[key] = policy.params[key];
          });
          return { name, params };
        }
        return { name };
      });

      this.policies = this.filterPolicies(policyRequirements);
    },
    /**
     * Sets failing policies for PolicyPanel component
     * @param {Object[]} failingPolicies failing policy objects
     */
    setFailingPolicies(failingPolicies) {
      const policies = failingPolicies.map((policy) => (JSON.parse(policy)));

      // some failures are not displayed in policy panel and instead are displayed under field input
      this.serverFailures = policies
        .filter((failedPolicy) => (!this.policies.find((policy) => (policy.name === failedPolicy.policyRequirement))))
        .map((pol) => (this.$t(`common.policyValidationMessages.${pol.policyRequirement}`, pol.params)));

      // set failing policies for policy panel
      this.failedPolicies = policies.map((policy) => (policy.policyRequirement));
    },
    /**
     * Triggered off of input event of field. Sets callback value and validates.
     * @param {String} value password string
     */
    updateCallback(value) {
      this.callback.setPassword(value);
      this.debounceValidatePassword();
    },
    /**
     * Sends input to backend to be validated and updates the failing policies.
     */
    validatePassword() {
      const stepParams = {
        realmPath: this.realm,
      };
      // call tree without advancing to next node
      this.auth.next(this.step, stepParams).then((step) => {
        const callback = step.getCallbackOfType('ValidatedCreatePasswordCallback');
        this.setFailingPolicies(callback.getOutputByName('failedPolicies'));
      }).catch(() => {
        // it's possible to timeout while in the tree so have to start from beginning if that happens
        window.location.reload();
      });
    },
  },
};
</script>

<style lang="scss" scoped>
/deep/ {
  li {
    text-align: left;
  }
}
</style>
