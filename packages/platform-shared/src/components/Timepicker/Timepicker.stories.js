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
import Timepicker from './index';

const stories = storiesOf('Components|Timepicker', module).addParameters({ component: Timepicker });

stories.addDecorator(withKnobs);

const template = `
  <div class="margin-25">
    <div class="sg_masthead">
      <BContainer>
        <h1 class="display-4">Timepicker</h1>
        <p class="mb-4 lead">
          Timepicker is a wrapper for bootstrap's Timepicker component.
          Adds a floating label and custom icons.
        </p>
      </BContainer>
    </div>
    <BContainer>
      <section class="sg_pattern">
        <h2>Basic Example</h2>
        <p class="mb-5">
          Select a time
        </p>
        <BCard>
          <FrTimepicker 
            :placeholder="placeholder"
            v-model="value" />
          Value: {{ value }}
        </BCard>
      </section>
    </BContainer>
    <BContainer>
      <section class="sg_pattern">
        <h2>Attribute passthrough</h2>
        <p class="mb-5">
          All props and events are passed through to bootstrap component. This example uses minutes-step="15" and size="lg"
        </p>
        <BCard>
          <FrTimepicker 
            minutes-step="15"
            size="lg"
            :placeholder="placeholder"
            v-model="value" />
          Value: {{ value }}
        </BCard>
      </section>
    </BContainer>
  </div>
`;

stories.add('Timepicker', () => ({
  components: {
    FrTimepicker: Timepicker,
    BCard,
    BContainer,
  },
  template,
  data() {
    return {
      value: '',
    };
  },
  props: {
    placeholder: {
      type: String,
      default: text('placeholder', 'Placeholder Text'),
    },
  },
}));
