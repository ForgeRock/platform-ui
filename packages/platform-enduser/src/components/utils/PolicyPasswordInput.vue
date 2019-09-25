<template>
  <BFormGroup class="mb-0">
    <slot
      v-if="!customInput"
      name="input-with-validation-panel">
      <FrFloatingLabelInput
        name="password"
        field-name="password"
        type="password"
        v-validate.initial="'required|policy'"
        v-model="password"
        :label="label || $t('common.placeholders.password')"
        :reveal="true"
        :show-error-state="false"
        @input="$emit('input', $event)">
        <FrPolicyPanel
          slot="validationError"
          :policies="policies"
          :policy-failures="defaultPolicyFailures || policyFailures" />
      </FrFloatingLabelInput>
    </slot>

    <template v-else>
      <slot name="custom-input" />
      <FrPolicyPanel
        :policies="policies"
        :policy-failures="defaultPolicyFailures || policyFailures" />
    </template>
  </BFormGroup>
</template>

<script>
import _ from 'lodash';
import FloatingLabelInput from './FloatingLabelInput';
import PolicyPanel from './PolicyPanel';

/**
 * @description The main display for the password policy component. Connects a text field to check policy on input to see if password correctly matches configured policy (makes use of policy.json)
 *
 * @fires POST /policy/selfservice/registration/?_action=validateObject - Submits an object in its current state to policy for validation against the configured policy
 *
 * */
export default {
  name: 'PolicyPasswordInput',
  inject: ['$validator'],
  components: {
    FrFloatingLabelInput: FloatingLabelInput,
    FrPolicyPanel: PolicyPanel,
  },
  props: {
    policyApi: {
      required: true,
      type: String,
    },
    defaultPolicyFailures: {
      required: false,
      type: Array,
      default: () => {},
    },
    value: {
      type: String,
      default: () => '',
    },
    label: {
      type: String,
      default: () => '',
    },
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
                return _.includes(policyRequirements, 'REQUIRED') && _.includes(policyRequirements, 'MIN_LENGTH');
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
    policyFailures() {
      const failures = this.errors.firstByRule('password', 'policy');

      if (_.isUndefined(this.fields.password)) {
        return 'loading';
      } if (_.isNull(failures) && this.fields.password.valid) {
        return [];
      }
      return failures;
    },
    customInput() { return !_.isUndefined(this.$slots['custom-input']); },

  },
  methods: {
    /**
             * Predicates whether item matches 'password'. Policy Definition and Policy Failure objects
             * have different shapes, so this function can be used as a predicate for both.
             * @param {String} propName - The name of the property grab
             * @param {Object} policyRequirementItem - object to predicate on
             * @return {Boolean}
             */
    isPasswordPolicyItem: _.curry((propName, policyRequirementItem) => !_.isEmpty(policyRequirementItem[propName].match('password'))),
    /**
             * convert policy definition into a simple structure to work with
             * @param {Object} policyDefinition
             * @param {String[]} policyDefinition.policyRequirements - singleton array with policy name
             * @param {Object} policyDefinition.params - objet containing params for policy (e.g. `{ params: { numNum: 1 } }
             * @return {Object} - {name<String>, params<Object>}
             */
    toSimplePolicyObject(policyDefinition) {
      const { policyRequirements, params } = policyDefinition;


      const name = _.first(policyRequirements);

      if (!_.isUndefined(name)) {
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
        .map(failedPolicyDefinition => _.at(failedPolicyDefinition, ['policyRequirements[0].policyRequirement']));

      return _.flatten(policyNames);
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

      const rejectPolicy = requirement => _.reject(policies, policy => _.first(policy.policyRequirements) === requirement);

      this.exclude.forEach((exclusion) => {
        if (_.isObject(exclusion)) {
          if (exclusion.predicate(policyRequirements)) {
            policies = rejectPolicy(exclusion.name);
          }
        } else if (_.isString(exclusion)) {
          if (_.includes(policyRequirements, exclusion)) {
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

      /* istanbul ignore next */
      return policyService
        .post(`/policy/${this.policyApi}/?_action=${this.getAction()}`, data)
        .then(({ data2 }) => this.toPolicyNames(data2))
        .catch(() => {
          /* istanbul ignore next */
          this.displayNotification('error', this.$t('common.policyValidationMessages.policyServiceError'));
        });
    };

    // Extend the validator with the custom validation rule.
    this.$validator.extend('policy', {
      validate(value) {
        // Make policy service call.
        /* istanbul ignore next */
        return requestPolicyValidation(value).then(policyFailures => ({
          valid: _.isEmpty(policyFailures),
          data: policyFailures,
        }));
      },
      getMessage(field, params, data) {
        return data;
      },
    });

    // Get the initial policy list from the policy service.
    /* istanbul ignore next */
    policyService.get(`/policy/${this.policyApi}`)
      .then(({ data }) => _.head(data.properties.filter(this.isPasswordPolicyItem('name'))))
      .then(policyRequirementSet => this.makeExclusions(policyRequirementSet))
      .then(({ policies }) => {
        this.policies = policies
          .map(this.toSimplePolicyObject)
          .filter(p => !_.isEmpty(p));
      })
      .catch(() => {
        /* istanbul ignore next */
        this.displayNotification('error', this.$t(`common.policyValidationMessages.policyServiceError.${this.policyApi}`));
        this.$router.push('/login');
      });
  },
};
</script>
