/**
 * Copyright 2019-2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
/* eslint import/no-extraneous-dependencies: 0 */
import { storiesOf } from '@storybook/vue';
import {
  BCard,
  BContainer,
  BFormInput,
} from 'bootstrap-vue';
import PolicyPasswordInput from './index';

const stories = storiesOf('Components|PolicyPasswordInput', module).addParameters({ component: PolicyPasswordInput });

const template = `
<div>
  <div class="sg_masthead">
    <BContainer>
      <h1 class="display-4">Policy Password Input</h1>
      <p class="mb-4 lead">Input field with Policy Panel component built in</p>
    </BContainer>
  </div>
  <BContainer>
    <section class="sg_pattern">
      <h2>Example</h2>
      <BCard>
        <FrPolicyPasswordInput
          v-model="passwordValue"
          :failed="failed"
          policy-api="managed/user/policy" />
          Password Value: {{ passwordValue }}
      </BCard>
    </section>
  </BContainer>
</div>`;

stories.add('PolicyPasswordInput', () => ({
  template,
  components: {
    FrPolicyPasswordInput: PolicyPasswordInput,
    BCard,
    BContainer,
    BFormInput,
  },
  props: {
    failed: {
      type: Array,
      default: [],
    },
  },
  data() {
    return {
      passwordValue: '',
    };
  },
}));
