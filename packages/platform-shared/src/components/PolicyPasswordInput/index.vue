<!-- Copyright 2019-2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <BFormGroup class="mb-0">
    <slot name="input">
      <FrField
        :failed-policies="serverFailures"
        :field="password"
        @input="setFailingPolicies($event)" />
    </slot>
    <slot name="policy-panel">
      <FrPolicyPanel
        class="mt-2"
        :num-columns="2"
        :policies="policies"
        :policy-failures="failedPolicies" />
    </slot>
  </BFormGroup>
</template>

<script>
import {
  at,
  curry,
  first,
  flatten,
  head,
  includes,
  isEmpty,
  isObject,
  isString,
  isUndefined,
  reject,
} from 'lodash';
import { BFormGroup } from 'bootstrap-vue';
import FrField from '@forgerock/platform-shared/src/components/Field';
import PolicyPanel from '@forgerock/platform-shared/src/components/PolicyPanel';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';

/**
 * The main display for the password policy component. Connects a text field to check policy on input to see if password correctly matches configured policy (makes use of policy.json)
 *
 * @fires POST /policy/selfservice/registration/?_action=validateObject - Submits an object in its current state to policy for validation against the configured policy
 */
export default {
  name: 'PolicyPasswordInput',
  mixins: [
    RestMixin,
    NotificationMixin,
  ],
  components: {
    BFormGroup,
    FrField,
    FrPolicyPanel: PolicyPanel,
  },
  props: {
    /**
     * Items to remove from the policy service.
     */
    excludeOverwrite: {
      required: false,
      type: Array,
      default: null,
    },
    /**
     * Failed policies not shown in policy panel
     */
    failed: {
      type: Array,
      default: () => [],
    },
    /**
     * Floating label for input
     */
    label: {
      type: String,
      default() {
        return this.$t('common.placeholders.password');
      },
    },
    /**
     * Required policy API used to validate input password.
     */
    policyApi: {
      required: true,
      type: String,
    },
    /**
     * Initial value input in the field.
     */
    value: {
      type: [String, Array],
      default: '',
    },
  },
  data() {
    return {
      failedPolicies: [],
      password: {
        type: 'password',
        key: 'password',
        value: this.value,
        title: this.label,
      },
      policies: [],
      policyService: () => {},
      serverFailures: [],
    };
  },
  watch: {
    value(value) {
      this.password.value = value;
    },
    failed: {
      handler(newVal) {
        this.serverFailures = this.getFailedPolicyMessages(newVal);
      },
      deep: true,
      immediate: true,
    },
    failedPolicies(newVal) {
      this.$emit('valid', newVal.length === 0);
    },
    password: {
      handler(newVal) {
        this.$emit('input', newVal.value);
      },
      deep: true,
    },
  },
  computed: {
    exclude() {
      if (this.excludeOverwrite) {
        return this.excludeOverwrite;
      }
      return [
        {
          name: 'REQUIRED',
          predicate(policyRequirements) {
            return includes(policyRequirements, 'REQUIRED') && includes(policyRequirements, 'MIN_LENGTH');
          },
        },
        {
          name: 'IS_NEW',
          predicate() {
            return this.policyApi === 'selfservice/registration';
          },
        },
        'VALID_TYPE',
        'CANNOT_CONTAIN_OTHERS',
      ];
    },
  },
  methods: {
    /**
     * Predicates whether item matches 'password'. Policy Definition and Policy Failure objects
     * have different shapes, so this function can be used as a predicate for both.
     * @param {String} propName - The name of the property grab
     * @param {Object} policyRequirementItem - object to predicate on
     * @return {Boolean}
     */
    isPasswordPolicyItem: curry((propName, policyRequirementItem) => !isEmpty(policyRequirementItem[propName].match('password'))),
    /**
     * convert policy definition into a simple structure to work with
     * @param {Object} policyDefinition
     * @param {String[]} policyDefinition.policyRequirements - singleton array with policy name
     * @param {Object} policyDefinition.params - object containing params for policy (e.g. `{ params: { numNum: 1 } }
     * @return {Object} - {name<String>, params<Object>}
     */
    toSimplePolicyObject(policyDefinition) {
      const { policyRequirements, params } = policyDefinition;
      const name = first(policyRequirements);

      return !isUndefined(name) ? { name, params } : {};
    },
    /**
     * Change an array of Failed Policy objects to an array of policy names
     * @param {Object} failedPolicySet - policy service response object
     * @param {Object[]} failedPolicySet.failedPolicyRequirements - the list to map
     * @return {String[]}
     */
    toPolicyNames(failedPolicySet) {
      const failedPolicyRequirements = failedPolicySet.failedPolicyRequirements || [];
      const policyNames = failedPolicyRequirements
        .filter(this.isPasswordPolicyItem('property'))
        .map((failedPolicyDefinition) => at(failedPolicyDefinition, ['policyRequirements[0].policyRequirement']));

      return flatten(policyNames);
    },
    /**
     * Remove from the policy service return set of policies those that are defined in the `exclude` prop
     * @param {Object} policyRequirementSet - policy service response object
     * @param {String[]} policy names and predicates to exclude
     * @return {Object} - edited version of the policyRequirementSet
     */
    makeExclusions(policyRequirementSet, exclude) {
      const policyRequirements = (policyRequirementSet && policyRequirementSet.policyRequirements) ? policyRequirementSet.policyRequirements : [];
      let policies = (policyRequirementSet && policyRequirementSet.policies) ? policyRequirementSet.policies : [];

      const rejectPolicy = (requirement) => reject(policies, (policy) => first(policy.policyRequirements) === requirement);

      exclude.forEach((exclusion) => {
        if (isObject(exclusion)) {
          if (exclusion.predicate(policyRequirements)) {
            policies = rejectPolicy(exclusion.name);
          }
        } else if (isString(exclusion)) {
          if (includes(policyRequirements, exclusion)) {
            policies = rejectPolicy(exclusion);
          }
        }
      });

      return Object.assign({}, policyRequirementSet, { policyRequirements, policies });
    },
    /**
     * Get an array of error message strings given an array of failing policy objects.
     * These are used to display the failing policies that are returned after submitting a password.
     * @param {Object[]} failed Array of failing policy objects
     * @return {String[]} Array of translated error messages
     */
    getFailedPolicyMessages(failed) {
      if (failed.length === 0) {
        return [];
      }
      return this.failed.map((policy) => {
        const name = policy.policyRequirements[0].policyRequirement;
        const param = policy.policyRequirements[0].params;
        return this.$t(`common.policyValidationMessages.${name}`, param);
      });
    },
    /**
     * validates a value for as-you-type feedback.
     * @param {String} password a string to validate against relevant policy
     */
    setFailingPolicies(password) {
      this.policyService.post(`/policy/${this.policyApi}/?_action=validateObject`, { password })
        .then(({ data }) => { this.failedPolicies = this.toPolicyNames(data); this.serverFailures = []; })
        .catch(() => {
          this.displayNotification('IDMMessages', 'error', this.$t('common.policyValidationMessages.policyServiceError.policyApi', { policyApi: this.policyApi }));
        });
    },
  },
  created() {
    // Initialize the policy service to be used in validation calls and the preliminary get call.
    const headers = this.getAnonymousHeaders();
    this.policyService = this.getRequestService({ headers });

    // Get the initial policy list from the policy service.
    this.policyService.get(`/policy/${this.policyApi}`)
      .then(({ data }) => head(data.properties.filter(this.isPasswordPolicyItem('name'))))
      .then((policyRequirementSet) => this.makeExclusions(policyRequirementSet, this.exclude))
      .then(({ policies }) => {
        this.policies = policies
          .map(this.toSimplePolicyObject)
          .filter((p) => !isEmpty(p));
      })
      .catch(() => {
        this.displayNotification('IDMMessages', 'error', this.$t('common.policyValidationMessages.policyServiceError.policyApi', { policyApi: this.policyApi }));
        this.$router.push('/login');
      });

    this.setFailingPolicies(this.password.value);
  },
};
</script>
