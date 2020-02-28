<!-- Copyright 2019-2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <ValidationObserver ref="observer">
    <BFormGroup class="mb-0">
      <!-- @slot input and validation errors -->
      <slot
        v-if="!customInput"
        name="input-with-validation-panel">
        <ValidationProvider
          mode="aggressive"
          name="password"
          rules="required|policy">
          <FrFloatingLabelInput
            name="password"
            field-name="password"
            type="password"
            v-model="password"
            :label="label || $t('common.placeholders.password')"
            :reveal="true"
            :show-error-state="false"
            @input="$emit('input', $event)">
            <template v-slot:validationError>
              <FrPolicyPanel
                :policies="policies"
                :policy-failures="defaultPolicyFailures || policyFailures" />
            </template>
          </FrFloatingLabelInput>
        </ValidationProvider>
      </slot>

      <template v-else>
        <!-- @slot policy panel -->
        <slot name="custom-input" />
        <FrPolicyPanel
          :policies="policies"
          :policy-failures="defaultPolicyFailures || policyFailures" />
      </template>
    </BFormGroup>
  </ValidationObserver>
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
import {
  extend,
  ValidationObserver,
  ValidationProvider,
} from 'vee-validate';
import FloatingLabelInput from '@forgerock/platform-shared/src/components/FloatingLabelInput';
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
    FrFloatingLabelInput: FloatingLabelInput,
    FrPolicyPanel: PolicyPanel,
    BFormGroup,
    ValidationObserver,
    ValidationProvider,
  },
  props: {
    /**
     * Required policy API used to validate input password.
     */
    policyApi: {
      required: true,
      type: String,
    },
    /**
     * Default list of errors if none are provided.
     */
    defaultPolicyFailures: {
      required: false,
      type: Array,
      default: () => [],
    },
    /**
     * Initial value input in the field.
     */
    value: {
      type: String,
      default: () => '',
    },
    /**
     * The floating label that will appear as a placeholder if field is empty, and move to top-left corner if not empty.
     */
    label: {
      type: String,
      default: () => '',
    },
    /**
     * Items to remove from the policy service.
     */
    exclude: {
      required: false,
      type: Array,
      default: () => {
        if (this && this.policyApi) {
          const { policyApi } = this;
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
                return policyApi === 'selfservice/registration';
              },
            },
            'VALID_TYPE',
            'CANNOT_CONTAIN_OTHERS',
          ];
        }
        return null;
      },
    },
  },
  data() {
    return {
      policies: [],
      password: this.value,
    };
  },
  computed: {
    policyFailures() { return this.$refs.observer.errors.passwordObserver.password; },
    customInput() { return !isUndefined(this.$slots['custom-input']); },
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
             * @param {Object} policyDefinition.params - objet containing params for policy (e.g. `{ params: { numNum: 1 } }
             * @return {Object} - {name<String>, params<Object>}
             */
    toSimplePolicyObject(policyDefinition) {
      const { policyRequirements, params } = policyDefinition;


      const name = first(policyRequirements);

      if (!isUndefined(name)) {
        return { name, params };
      }
      return {};
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
             * @return {Object} - edited version of the policyRequirementSet
             */
    makeExclusions(policyRequirementSet) {
      let policyRequirements;
      let policies;

      if (policyRequirementSet && policyRequirementSet.policyRequirements) {
        // eslint-disable-next-line prefer-destructuring
        policyRequirements = policyRequirementSet.policyRequirements;
      } else {
        policyRequirements = [];
      }

      if (policyRequirementSet && policyRequirementSet.policies) {
        // eslint-disable-next-line prefer-destructuring
        policies = policyRequirementSet.policies;
      } else {
        policies = [];
      }

      const rejectPolicy = (requirement) => reject(policies, (policy) => first(policy.policyRequirements) === requirement);

      this.exclude.forEach((exclusion) => {
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
    formatPayload(password) {
      if (this.policyApi.match('registration')) {
        return { user: { password } };
      }
      return { password };
    },
    getAction() {
      return this.policyApi.match('selfservice') ? 'validateObject' : 'validateProperty';
    },
  },
  created() {
    // Initialize the policy service to be used in validation calls and the preliminary get call.
    const headers = this.getAnonymousHeaders();
    const policyService = this.getRequestService({ headers });
    const formatPayload = this.formatPayload.bind(this);

    // Create validation service call and bind to component scope.

    const requestPolicyValidation = (password) => {
      const data = formatPayload(password);

      // remove existing defaultPolicyFailures
      this.defaultPolicyFailures = null;

      return policyService
        .post(`/policy/${this.policyApi}/?_action=${this.getAction()}`, data)
        .then(({ data2 }) => this.toPolicyNames(data2))
        .catch(() => {
          this.displayNotification('IDMMessages', 'error', this.$t('common.policyValidationMessages.policyServiceError'));
        });
    };

    // Extend the validator with the custom validation rule.
    extend('policy', {
      async validate(value) {
        // Make policy service call.
        return requestPolicyValidation(value).then((policyFailures) => ({
          valid: isEmpty(policyFailures),
          data: policyFailures,
        }));
      },
      message: '{_field_} does not meet {_rule_} requirements',
    });

    // Get the initial policy list from the policy service.
    policyService.get(`/policy/${this.policyApi}`)
      .then(({ data }) => head(data.properties.filter(this.isPasswordPolicyItem('name'))))
      .then((policyRequirementSet) => this.makeExclusions(policyRequirementSet))
      .then(({ policies }) => {
        this.policies = policies
          .map(this.toSimplePolicyObject)
          .filter((p) => !isEmpty(p));
      })
      .catch(() => {
        this.displayNotification('IDMMessages', 'error', this.$t(`common.policyValidationMessages.policyServiceError.${this.policyApi}`));
        this.$router.push('/login');
      });
  },
};
</script>
