/**
 * Copyright 2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
/* eslint import/no-extraneous-dependencies: 0 */
import { storiesOf } from '@storybook/vue';
import { withKnobs, select } from '@storybook/addon-knobs';
import {
  BCard,
  BContainer,
  BFormInput,
} from 'bootstrap-vue';
import PolicyPanel from './index';

const stories = storiesOf('Components|PolicyPanel', module).addParameters({ component: PolicyPanel });
stories.addDecorator(withKnobs);

const template = `
  <div>
    <div class="sg_masthead">
      <BContainer>
        <h1 class="display-4">Policy Panel</h1>
        <p class="mb-4 lead">Policy Panel is used to give a user immediate feedback on failed or passing requirements.</p>
      </BContainer>
    </div>
    <BContainer>
      <section class="sg_pattern">
        <h2>Example</h2>
        <p class="mb-5">
          Adjust the number of columns using knobs. Policies that pass are grayed out.
        </p>
        <BCard>
          <FrPolicyPanel 
            :numColumns="numColumns"
            :policies="policies"
            :policyFailures="policyFailures" />
        </BCard>
      </section>
    </BContainer>
  </div>
`;

const policies = [
  {
    name: 'MIN_LENGTH',
    params: {
      minLength: '8',
    },
  },
  {
    name: 'AT_LEAST_X_CAPITAL_LETTERS',
    params: {
      numCaps: '1',
    },
  },
];

const policyFailures = [
  'MIN_LENGTH',
];

const numColumns = {
  1: 1,
  2: 2,
  3: 3,
};

stories.add('PolicyPanel', () => ({
  components: {
    FrPolicyPanel: PolicyPanel,
    BCard,
    BContainer,
    BFormInput,
  },
  props: {
    policies: {
      type: Array,
      default: policies,
    },
    policyFailures: {
      type: Array,
      default: policyFailures,
    },
    numColumns: {
      type: Number,
      default: select('numColumns', numColumns, 2),
    },
  },
  template,
}));
