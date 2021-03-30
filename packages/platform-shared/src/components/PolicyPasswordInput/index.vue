<!-- Copyright (c) 2019-2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <slot name="input">
      <FrField
        :field="passwordField"
        :failed-policies="failuresOnSubmit"
        @input="checkPassword($event); $emit('input', $event)" />
    </slot>
    <slot name="policy-panel">
      <FrPolicyPanel
        v-if="policies.length"
        class="mt-2"
        :num-columns="2"
        :policies="policies"
        :policy-failures="policyFailures" />
    </slot>
  </div>
</template>

<script>
import FrField from '@forgerock/platform-shared/src/components/Field';
import PolicyPanel from '@forgerock/platform-shared/src/components/PolicyPanel';
import PasswordPolicyMixin from '@forgerock/platform-shared/src/mixins/PasswordPolicyMixin';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';

const ignoredPolicies = [
  'REQUIRED',
  'VALID_TYPE',
  'CANNOT_CONTAIN_OTHERS',
];

/**
 * The main display for the password policy component.
 */
export default {
  name: 'PolicyPasswordInput',
  mixins: [
    RestMixin,
    PasswordPolicyMixin,
    NotificationMixin,
  ],
  components: {
    FrField,
    FrPolicyPanel: PolicyPanel,
  },
  props: {
    resourceType: {
      type: String,
      required: true,
    },
    resourceName: {
      type: String,
      required: true,
    },
    failuresOnSubmit: {
      type: Array,
      default: () => [],
    },
    value: {
      type: String,
      default: '',
    },
    validation: {
      type: [String, Object],
      default: '',
    },
  },
  data() {
    return {
      policyEndpoint: `/policy/${this.resourceType}/${this.resourceName}`,
      policyFailures: [],
      policies: [],
    };
  },
  computed: {
    passwordField() {
      return {
        value: this.value,
        type: 'password',
        title: this.$t('common.placeholders.password'),
        validation: this.validation,
      };
    },
  },
  mounted() {
    this.getDsPolicies(this.resourceName).then((res) => {
      this.policies = res.data;
      this.getIdmPolicies();
    });
  },
  methods: {
    checkPassword(value) {
      const headers = this.getAnonymousHeaders();
      const policyService = this.getRequestService({ headers });

      policyService.post(`${this.policyEndpoint}/policy/?_action=validateObject`, { password: value })
        .then((res) => {
          if (res.data.failedPolicyRequirements) {
            const failedPolicies = [];
            res.data.failedPolicyRequirements.forEach((policy) => {
              if (policy.property === 'password') failedPolicies.push(policy.policyRequirements[0]);
            });
            this.$emit('is-valid', failedPolicies.length === 0);
            this.policyFailures = this.normalizePolicies(failedPolicies).map((policy) => (policy.policyRequirement || policy.name));
          }
        });
    },
    getIdmPolicies() {
      const headers = this.getAnonymousHeaders();
      const policyService = this.getRequestService({ headers });

      policyService.get(this.policyEndpoint).then((res) => {
        const passwordPolicies = res.data.properties.find((pol) => (pol.name === 'password')).policies;
        const filteredPolicies = passwordPolicies.filter((pol) => (ignoredPolicies.indexOf(pol.policyRequirements[0]) === -1));
        const policyObjects = filteredPolicies.map((pol) => ({ name: pol.policyRequirements[0], params: pol.params }));
        this.policies = [...this.policies, ...policyObjects];
      }).catch((error) => {
        this.showErrorMessage(error, this.$t('common.policyValidationMessages.policyReadError'));
      });
    },
  },
};
</script>
