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
    <h1 class="display-4">Floating Label Input</h1>
    <p class="mb-4 lead">Input field with validation error component built in</p>
  </div>
  Example using field label in field
  <FrFloatingLabelInput
    v-model="models[0]"
    type="text"
    auto-focus="true"
    :label="$t('common.description')"
    @input="$emit('input', $event)"
    :failed-policies="[]" />
  <div class="sg_masthead">
    <h1 class="display-4">Using field label on top</h1>
  </div>
  <div>{{ $t('floatingLabelInput.label') }}</div>
  <FrFloatingLabelInput
    v-model="models[1]"
    type="text"
    auto-focus="true"
    :label="$t('common.search')"
    @input="$emit('input', $event)"
    :failed-policies="[]" />
  <div class="sg_masthead">
    <h1 class="display-4">Required field error (when field is left blank)</h1>
  </div>
  <FrFloatingLabelInput
    v-model="models[2]"
    type="text"
    auto-focus="true"
    :label="$t('common.required')"
    @input="checkInput($event)"
    :failed-policies="failedPolicies" />
  <div class="sg_masthead">
    <h1 class="display-4">Example of Multiple errors</h1>
  </div>
  <FrFloatingLabelInput
    v-model="models[3]"
    type="text"
    auto-focus="true"
    :label="$t('placeholders.password')"
    @input="checkPasswordInput($event)"
    :failed-policies="failedPoliciesPassword" />
</div>`;

/* eslint import/no-extraneous-dependencies: 0 */
import { storiesOf } from '@storybook/vue';
import FloatingLabelInput from './index';

const stories = storiesOf('Components|FloatingLabelInput', module).addParameters({ component: FloatingLabelInput });

stories.add('Floating Label Input', () => ({
  template,
  components: {
    FrFloatingLabelInput: FloatingLabelInput,
  },
  data: () => {
    const retv = {
      models: ['', '', '', ''],
      failedPolicies: [],
      failedPoliciesPassword: [],
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
