/**
 * Copyright 2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
/* eslint import/no-extraneous-dependencies: 0 */
import { storiesOf } from '@storybook/vue';
import { withKnobs } from '@storybook/addon-knobs';
import {
  BCard,
  BContainer,
} from 'bootstrap-vue';
import TimeConstraint from './index';

const stories = storiesOf('Components|TimeConstraint', module).addParameters({ component: TimeConstraint });

stories.addDecorator(withKnobs);

const template = `
  <div class="margin-25">
    <div class="sg_masthead">
      <BContainer>
        <h1 class="display-4">Time Constraint</h1>
        <p class="mb-4 lead">Time constraint is used to select a start and end date/time</p>
      </BContainer>
    </div>
    <BContainer>
      <section class="sg_pattern">
        <h2>Example</h2>
        <p class="mb-5">
          Pick start and end dates/times and time zone. Moving the start date/time past the end date/time will adjust the end date/time and vice versa.
        </p>
        <BCard>
          <FrTimeConstraint v-model="value" />
          Value: {{ value }}
        </BCard>
      </section>
    </BContainer>
    <BContainer>
      <section class="sg_pattern">
        <h2>Initial Value</h2>
        <p class="mb-5">
          Can set initial value by passing in ISO string range as value or using v-model
        </p>
        <BCard>
          <FrTimeConstraint v-model="stringInitialValue" />
          Value: {{ stringInitialValue }}
        </BCard>
      </section>
    </BContainer>
  </div>
`;

stories.add('TimeConstraint', () => ({
  components: {
    FrTimeConstraint: TimeConstraint,
    BCard,
    BContainer,
  },
  template,
  data() {
    return {
      value: '',
      stringInitialValue: '2020-01-02T12:00:00.000Z/2020-01-03T13:00:00.000Z',
    };
  },
}));
