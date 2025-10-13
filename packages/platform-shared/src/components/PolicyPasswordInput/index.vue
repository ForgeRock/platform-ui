<!-- Copyright (c) 2019-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <slot name="input">
      <BForm @submit.prevent>
        <FrField
          v-bind="$attrs"
          type="password"
          :errors="failuresOnSubmit"
          :label="$t('common.placeholders.password')"
          :validation="validation"
          @input="checkPassword($event); $emit('input', $event)" />
      </BForm>
    </slot>
    <slot name="policy-panel">
      <FrPolicyPanel
        v-if="policies.length"
        class="mt-2"
        :num-columns="numColumns"
        :policies="policies"
        :policy-failures="policyFailures"
        :value-entered="!!$attrs.value" />
    </slot>
  </div>
</template>

<script>
import {
  BForm,
} from 'bootstrap-vue';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrPolicyPanel from '@forgerock/platform-shared/src/components/PolicyPanel';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import PasswordPolicyMixin from '@forgerock/platform-shared/src/mixins/PasswordPolicyMixin';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import axios from 'axios';

const ignoredPolicies = [
  'REQUIRED',
  'VALID_TYPE',
  'CANNOT_CONTAIN_OTHERS',
];

/**
 * Component that has an input and a list of policies displayed below.
 * As the input value is updated, the policies are updated to show which are passing and failing.
 */
export default {
  name: 'PolicyPasswordInput',
  mixins: [
    NotificationMixin,
    PasswordPolicyMixin,
    RestMixin,
  ],
  components: {
    BForm,
    FrField,
    FrPolicyPanel,
  },
  props: {
    /**
     * Managed resource type
     * @values managed, internal
     */
    resourceType: {
      type: String,
      required: true,
    },
    /**
     * Managed resource name e.g. user
     */
    resourceName: {
      type: String,
      required: true,
    },
    /**
     * Failures that only occur on submit.
     * Displayed under the input, separate from the policy list
     */
    failuresOnSubmit: {
      type: Array,
      default: () => [],
    },
    /**
     * Vee-validate validation
     * Client side validation for input
     */
    validation: {
      type: [String, Object],
      default: '',
    },
    /**
     * Data to be sent in the payload to the validation endpoint
     * e.g. for user registration this could be { userName: 'testuser' }
     */
    payloadData: {
      type: Object,
      default: null,
    },
    /**
     * If provided, the payload sent to the validation endpoint will be wrapped in an object with this key
     * e.g. if payloadObject is 'user' and payloadData is { foo: 'bar' }, the payload sent will be:
     * { user: { foo: 'bar', password: 'the-input-value' } }
     */
    payloadObject: {
      type: String,
      default: '',
    },
    /**
    * Use only IDM policies for validation, useful for password reset flows in
    * the IDM end-user UI where DS policies are not present.
    */
    useIdmPoliciesOnly: {
      type: Boolean,
      default: false,
    },
    /**
     * Override the default policy endpoint
     * By default this is `/policy/${resourceType}/${resourceName}`
     */
    initialPolicyEndpoint: {
      type: String,
      default: null,
    },
    /**
     * Override the default validation endpoint
     * By default this is `${initialPolicyEndpoint}/?_action=validateObject`
     */
    validationEndpoint: {
      type: String,
      default: null,
    },
    /**
     * Property in the payload to be validated against policy
     */
    passwordProperty: {
      type: String,
      default: 'password',
    },
    /**
     * Number of columns to display policies in
     */
    numColumns: {
      type: Number,
      default: 2,
    },
  },
  data() {
    return {
      policyEndpoint: `/policy/${this.resourceType}/${this.resourceName}`,
      policyFailures: [],
      policies: [],
      checkPasswordCancelTokenSource: null,
    };
  },
  mounted() {
    if (this.useIdmPoliciesOnly) {
      this.getIdmPolicies().then(() => {
        this.checkPassword(this.$attrs.value);
      });
    } else {
      this.getDsPolicies(this.resourceName).then((res) => {
        this.policies = res.data;
        this.getIdmPolicies().then(() => {
          this.checkPassword(this.$attrs.value);
        });
      });
    }
  },
  methods: {
    /**
     * Check input value against IDM policy service. Update policy list accordingly.
     * @param {String} value input value to be validated
     */
    checkPassword(value) {
      // Make sure only one request is active at a time
      if (this.checkPasswordCancelTokenSource) {
        this.checkPasswordCancelTokenSource.cancel('Outdated password checking cancelled');
      }

      this.checkPasswordCancelTokenSource = axios.CancelToken.source();

      const headers = this.getAnonymousHeaders();
      const policyService = this.getRequestService({ headers });
      const payload = this.payloadObject
        ? { [this.payloadObject]: { ...this.payloadData, password: value } }
        : { ...this.payloadData, password: value };

      // validate value and update failed policies
      const endpoint = this.validationEndpoint || `${this.policyEndpoint}/policy/?_action=validateObject`;
      policyService.post(endpoint, payload, { cancelToken: this.checkPasswordCancelTokenSource.token })
        .then((res) => {
          if (res.data.failedPolicyRequirements) {
            const failedPolicies = [];
            res.data.failedPolicyRequirements.forEach((policy) => {
              if (policy.property === this.passwordProperty) failedPolicies.push(policy.policyRequirements[0]);
            });
            /**
             * triggered whenever validation occurs
             * @param {boolean} valid only when there are no failed policies returned
             */
            this.$emit('is-valid', failedPolicies.length === 0);
            this.policyFailures = this.normalizePolicies(failedPolicies).map((policy) => (policy.policyRequirement));
          }
        })
        .catch((error) => {
          if (!axios.isCancel(error) && error.message !== 'Outdated password checking cancelled') {
            throw error;
          }
        });
    },
    /**
     * Get a list of all IDM policies for the password property.
     * Merge these with the DS policies for a complete list of policies.
     */
    getIdmPolicies() {
      const headers = this.getAnonymousHeaders();
      const policyService = this.getRequestService({ headers });
      const endpoint = this.initialPolicyEndpoint || this.policyEndpoint;

      return policyService.get(endpoint).then((res) => {
        const passwordPolicies = res.data.properties.find((pol) => (pol.name === this.passwordProperty)).policies;
        const filteredPolicies = passwordPolicies.filter((pol) => (ignoredPolicies.indexOf(pol.policyRequirements[0]) === -1));
        const policyObjects = filteredPolicies.map((pol) => ({ policyRequirement: pol.policyRequirements[0], params: pol.params }));
        this.policies = [...this.policies, ...policyObjects];
      }).catch((error) => {
        this.showErrorMessage(error, this.$t('common.policyValidationMessages.policyServiceError.policyReadError'));
      });
    },
  },
};
</script>
