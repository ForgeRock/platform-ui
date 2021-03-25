<!-- Copyright (c) 2020-2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
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
import PasswordPolicyMixin from '@forgerock/platform-shared/src/mixins/PasswordPolicyMixin';
import {
  cloneDeep,
  debounce,
  isEqual,
  uniqWith,
} from 'lodash';

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
  mixins: [
    PasswordPolicyMixin,
  ],
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
    /**
     * Overrides the list of policies returned by the node and instead gather policies based on failures.
     */
    overrideInitialPolicies: {
      type: Boolean,
      default: false,
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

    if (this.overrideInitialPolicies) {
      this.setPoliciesFromFailures(this.step);
    } else {
      this.setPolicies(this.callback.getPolicies().policies);
      const failingPolicies = this.callback.getFailedPolicies().map((x) => JSON.parse(x));
      this.setFailingPolicies(failingPolicies);
    }
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
     * Sends input to backend to be validated with supplied value
     * @param {Object} step current auth step
     * @param {String} value value to validate with
     */
    testInputValue(step, value) {
      const sampleStep = cloneDeep(step);
      const sampleCallback = sampleStep.getCallbackOfType(CallbackType.ValidatedCreatePasswordCallback);
      sampleCallback.setInputValue(value);

      return FRAuth.next(sampleStep, { realmPath: this.realm });
    },
    /**
     * Sends two sample strings which combined will fail all ds policy
     * Then use the response to populate initial list of policy
     * @param {Object} step current auth step
     */
    setPoliciesFromFailures(step) {
      // should fail character set, min length
      const testString1 = '';
      // should fail dictionary and repeated characters
      const testString2 = 'passwordaaa';

      // test both values and set policies and failed policies based on results
      Promise.all([this.testInputValue(step, testString1), this.testInputValue(step, testString2)]).then((res) => {
        const failures1 = res[0].getCallbackOfType(CallbackType.ValidatedCreatePasswordCallback).getFailedPolicies();
        const failures2 = res[1].getCallbackOfType(CallbackType.ValidatedCreatePasswordCallback).getFailedPolicies();
        let failures = [...failures1.map((pol) => (JSON.parse(pol))), ...failures2.map((pol) => (JSON.parse(pol)))];
        failures = uniqWith(failures, isEqual);
        const normailizedFailures = this.normalizePolicies(failures);
        this.policies = normailizedFailures.map((x) => ({ name: x.policyRequirement, params: x.params }));
        this.setFailingPolicies(failures);
      }).catch(() => {
        // it's possible to timeout while in the tree so have to start from beginning if that happens
        window.location.reload();
      });
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
      const failingPolicies = this.normalizePolicies(policies);

      this.$emit('on-failing-policies-set', failingPolicies);

      this.failuresForField = failingPolicies
        .filter((x) => !this.showInPanel(x))
        .map((x) => this.$t(`common.policyValidationMessages.${x.policyRequirement}`, x.params));

      this.failuresForPanel = failingPolicies
        .filter((x) => this.showInPanel(x))
        .map((x) => x.policyRequirement);

      this.$emit('disable-next-button', failingPolicies.length !== 0, this.index);
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
          const policies = callback.getFailedPolicies().map((x) => JSON.parse(x));
          this.setFailingPolicies(policies);
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
