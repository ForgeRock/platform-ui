/**
 * Copyright 2019-2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
/* eslint-disable import/first */
const template = `
<div class="margin-25">
  <div class="sg_masthead">
    <h1 class="display-4">Policy Password Input</h1>
    <p class="mb-4 lead">Input field with validation error component built in</p>
  </div>
  Example using field label in field
  <FrPolicyPasswordInput
    v-model="models[0].value"
    type="text"
    auto-focus="true"
    :label="$t('placeholders.password')"
    @input="$emit('input', $event)"
    :policy-api="'managed/user'"/>
</div>`;

/* eslint import/no-extraneous-dependencies: 0 */
import { storiesOf } from '@storybook/vue';
import PolicyPasswordInput from './index';

const stories = storiesOf('Components|PolicyPasswordInput', module).addParameters({ component: PolicyPasswordInput });
// stories.addDecorator('$validator');

stories.add('Policy Password Input', () => ({
  template,
  inject: ['$validator'],
  components: {
    FrPolicyPasswordInput: PolicyPasswordInput,
  },
  data: () => {
    const retv = {
      models: [
        { value: '' },
        '',
      ],
      failedPolicies: [],
      failedPoliciesPassword: [],
      resourceType: {
        type: String,
        required: true,
        default: 'managed',
      },
      resourceName: {
        type: String,
        required: true,
        default: 'user',
      },
    };
    return retv;
  },
  methods: {
    checkInput(event) {
      this.failedPolicies = [];
      if (!event) {
        this.failedPolicies.push('Field is required');
      }
    },
    checkPasswordInput(event) {
      this.failedPoliciesPassword = [];
      if (!event || event.length < 8) {
        this.failedPoliciesPassword.push('Password length must be >= 8');
      }
      if (!event || (!event.includes('%') && !event.includes('$') && !event.includes('#'))) {
        this.failedPoliciesPassword.push('Password length must contain %, $, or #');
      }
      if (!event || !/[A-Z]/.test(event)) {
        this.failedPoliciesPassword.push('Password must contain capital letter');
      }
    },
  },
}));
