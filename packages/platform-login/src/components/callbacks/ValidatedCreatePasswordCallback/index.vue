<!--
Copyright (c) 2020 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details.
-->

<template>
  <div>
    <FrField
      :failed-policies="failuresForField"
      :field="password"
      @input="updateCallback" />
    <FrPolicyPanel
      class="mt-2"
      :num-columns="1"
      :policies="policies"
      :policy-failures="failuresForPanel" />
  </div>
</template>

<script>
import { FRAuth, CallbackType } from '@forgerock/javascript-sdk';
import FrField from '@forgerock/platform-shared/src/components/Field';
import PolicyPanel from '@forgerock/platform-shared/src/components/PolicyPanel';
import { debounce } from 'lodash';

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
      failuresForField: [],
      failuresForPanel: [],
      password: {
        title: this.callback.getPrompt(),
        type: 'password',
        value: '',
      },
      policies: [],
    };
  },
  mounted() {
    // need to set validateOnly flag to true so that tree does not advance when validating input
    this.callback.setValidateOnly(true);

    this.setPolicies(this.callback.getPolicies().policies);
    this.setFailingPolicies(this.callback.getFailedPolicies());
  },
  methods: {
    /**
     * Returns a boolean indicating whether to show the policy in the policy panel
     * @param {Object} policy required policy object
     */
    showInPanel(policy) {
      return this.policies.some((x) => x.name === policy.policyRequirement);
    },
    /**
     * Sets required policies for PolicyPanel component
     * Policies are filtered to exclude some unnecessary policies
     * @param {Object[]} policies required policies provided in callback
     */
    setPolicies(policies) {
      this.$emit('on-policies-set', policies);

      const excluded = [
        'CANNOT_CONTAIN_OTHERS',
        'IS_NEW',
        'REQUIRED',
        'VALID_TYPE',
      ];

      this.policies = policies
        .filter((x) => !excluded.includes(x.policyRequirements[0]))
        .map((x) => ({
          name: x.policyRequirements[0],
          params: x.params ? { ...x.params } : undefined,
        }));
    },
    /**
     * Sets failing policies for PolicyPanel component
     * @param {Object[]} policies failing policy objects
     */
    setFailingPolicies(policies) {
      const failingPolicies = policies.map((x) => JSON.parse(x));

      this.$emit('on-failing-policies-set', failingPolicies);

      this.failuresForField = failingPolicies
        .filter((x) => !this.showInPanel(x))
        .map((x) => this.$t(`common.policyValidationMessages.${x.policyRequirement}`, x.params));

      this.failuresForPanel = failingPolicies
        .filter((x) => this.showInPanel(x))
        .map((x) => x.policyRequirement);

      this.$emit('on-validated', this.password.value, failingPolicies.length === 0);
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
      FRAuth.next(this.step, stepParams)
        .then((step) => {
          const callback = step.getCallbackOfType(CallbackType.ValidatedCreatePasswordCallback);
          this.setFailingPolicies(callback.getFailedPolicies());
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
