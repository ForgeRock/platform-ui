/**
 * Copyright 2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
/* eslint import/no-extraneous-dependencies: 0 */
import { storiesOf } from '@storybook/vue';
import { withKnobs, text } from '@storybook/addon-knobs';
import {
  BCard,
  BContainer,
} from 'bootstrap-vue';
import TimezoneOffset from './index';

const stories = storiesOf('Components|TimezoneOffset', module).addParameters({ component: TimezoneOffset });

stories.addDecorator(withKnobs);

const template = `
  <div class="margin-25">
    <div class="sg_masthead">
      <BContainer>
        <h1 class="display-4">TimezoneOffset</h1>
        <p class="mb-4 lead">
          Input that allows user to select a timezone offset from GMT. Uses Bootstrap input with type range. Formats display value to user friendly text.
        </p>
      </BContainer>
    </div>
    <BContainer>
      <section class="sg_pattern">
        <h2>Basic Example</h2>
        <p class="mb-5">
          Select a timezone offset.
        </p>
        <BCard>
          <FrTimezoneOffset 
            :placeholder="placeholder"
            v-model="value" />
          Value (measured in hours): {{ value }}
        </BCard>
      </section>
    </BContainer>
  </div>
`;

stories.add('TimezoneOffset', () => ({
  components: {
    FrTimezoneOffset: TimezoneOffset,
    BCard,
    BContainer,
  },
  template,
  data() {
    return {
      value: -7,
    };
  },
  props: {
    placeholder: {
      type: String,
      default: text('placeholder', 'Placeholder Text'),
    },
  },
}));
