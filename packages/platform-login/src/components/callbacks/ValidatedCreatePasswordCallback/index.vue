<!-- Copyright (c) 2020-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <FrField
      v-model="password.value"
      type="password"
      :errors="failuresForField"
      :label="password.label"
      @input="updateCallback" />
    <FrPolicyPanel
      class="mt-2"
      :num-columns="1"
      :policies="policies"
      :policy-failures="failuresForPanel" />
    <FrField
      v-if="confirmPassword"
      v-model="confirmPasswordText"
      type="password"
      :errors="confirmPasswordFailures"
      label="Confirm Password"
      @input="checkConfirmPasswordMatch" />
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
     * Numerical position on tree node
     */
    index: {
      type: Number,
      default: 0,
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
    /**
     * Stage info
     */
    stage: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      confirmPasswordFailures: [],
      confirmPasswordText: '',
      debounceValidatePassword: debounce(this.validatePassword, 200),
      failuresForField: [],
      failuresForPanel: [],
      password: {
        label: this.callback.getPrompt(),
        value: '',
      },
      policies: [],
      curPass: '',
      lastPass: '',
      isValidating: false,
    };
  },
  computed: {
    confirmPassword() {
      try {
        return this.stage.confirmPassword;
      } catch (e) {
        return false;
      }
    },
  },
  mounted() {
    // need to set validateOnly flag to true so that tree does not advance when validating input
    this.callback.setValidateOnly(true);
    this.$emit('next-step-callback', () => { this.callback.setValidateOnly(false); });

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
      return this.policies.some((x) => x.policyRequirement === policy.policyRequirement);
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
     * Then use the response to populate initial list of policy. Must be
     * two separate requests if whitelisting is enabled for authentication trees
     * @param {Object} step current auth step
     */
    setPoliciesFromFailures(step) {
      // should fail character set, min length
      const testString1 = '';
      // should fail dictionary and repeated characters
      const testString2 = 'aaa';

      this.testInputValue(step, testString1).then((step1) => {
        const failures1 = step1.getCallbackOfType(CallbackType.ValidatedCreatePasswordCallback).getFailedPolicies();

        this.testInputValue(step1, testString2).then((step2) => {
          const failures2 = step2.getCallbackOfType(CallbackType.ValidatedCreatePasswordCallback).getFailedPolicies();

          let failures = [...failures1.map((pol) => (JSON.parse(pol))), ...failures2.map((pol) => (JSON.parse(pol)))];
          failures = uniqWith(failures, isEqual);
          this.policies = this.normalizePolicies(failures);
          this.setFailingPolicies(failures);

          this.$emit('update-auth-id', step2.payload.authId);
        }).catch(() => {});
      }).catch(() => {});
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
          policyRequirement: x.policyRequirements[0],
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

      this.$emit('disable-next-button', failingPolicies.length !== 0);
      this.$emit('on-validated', this.password.value, failingPolicies.length === 0);

      if (this.confirmPassword) {
        this.checkConfirmPasswordMatch();
      }
    },
    /**
     * Triggered off of input event of field. Sets callback value and validates.
     * @param {String} value password string
     */
    updateCallback(value) {
      this.callback.setPassword(value);

      // reset to initial state when input is empty IAM-1409
      if (!value) {
        this.setFailingPolicies(this.policies);
        return;
      }
      this.debounceValidatePassword(value);
    },
    /**
     * Sends input to backend to be validated and updates the failing policies.
     */
    validatePassword(password) {
      this.curPass = password;

      // prevents multiple requests from happening simultaneously
      // while ensuring the all relevant passwords are checked
      if (!this.isValidating && this.curPass !== this.lastPass) {
        this.isValidating = true;
        this.lastPass = password;

        // call tree without advancing to next node
        FRAuth.next(this.step, { realmPath: this.realm })
          .then((step) => {
            const callback = step.getCallbackOfType(CallbackType.ValidatedCreatePasswordCallback);
            const policies = callback.getFailedPolicies().map((x) => JSON.parse(x));
            this.setFailingPolicies(policies);

            // update auth id in the event of authentication tree whitelisting
            this.$emit('update-auth-id', step.payload.authId);
            this.isValidating = false;
            this.validatePassword(this.curPass);
          }).catch(() => {
            // it's possible to timeout while in the tree so have to start from beginning if that happens
            window.location.reload();
          });
      }
    },
    checkConfirmPasswordMatch() {
      const passwordsMatch = this.password.value.length > 0
        && this.confirmPasswordText.length > 0
        && (this.password.value === this.confirmPasswordText);
      const disableNextButton = this.failuresForField.length !== 0 || this.failuresForPanel.length !== 0 || !passwordsMatch;
      this.confirmPasswordFailures = (disableNextButton && this.confirmPasswordText.length > 0 && !passwordsMatch) ? ['Passwords do not match'] : [];
      this.$emit('disable-next-button', disableNextButton, this.index);
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep {
  li {
    text-align: left;
  }
}
</style>
