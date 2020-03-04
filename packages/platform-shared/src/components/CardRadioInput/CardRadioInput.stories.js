/**
 * Copyright 2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
/* eslint import/no-extraneous-dependencies: 0 */
import { storiesOf } from '@storybook/vue';
import {
  withKnobs,
  boolean,
  text,
} from '@storybook/addon-knobs';
import {
  BButton,
  BCardFooter,
  BContainer,
} from 'bootstrap-vue';
import CardRadioInput from './index';

const stories = storiesOf('Components|CardRadioInput', module).addParameters({ component: CardRadioInput });
stories.addDecorator(withKnobs);

const template = `
  <div>
    <div class="sg_masthead">
      <BContainer>
        <h1 class="display-4">Card Radio Input</h1>
        <p class="mb-4 lead">Turn cards into large radio buttons for use in wizards and step-by-step flows.</p>
      </BContainer>
    </div>
    <BContainer>
      <section class="sg_pattern">
        <h2>Knobs Example</h2>
        <p class="mb-5">By defualt, the card content is simply the value property. Use cardBodyClass to apply css class to card. Disabled card radios are unclickable.</p>
        Selected value: {{ selected }}
        <div class="d-flex justify-content-around mt-4">
          <FrCardRadioInput
            class="w-25"
            :value="value1"
            v-model="selected"
            :disabled="disabled"
            :card-body-class="cardBodyClass"
            name="group1"/>
          <FrCardRadioInput
            class="w-25"
            :value="value2"
            v-model="selected"
            :disabled="disabled"
            :card-body-class="cardBodyClass"
            name="group1"/>
          <FrCardRadioInput
            class="w-25"
            :value="value3"
            v-model="selected"
            :card-body-class="cardBodyClass"
            :disabled="disabled"
            name="group1"/>
        </div>
      </section>
      <section class="sg_pattern">
        <h2>Use default slot to pass custom content</h2>
        <p class="mb-5">All custom content is rendered inside of a card</p>
        Selected value: {{ selected2 }}
        <div class="d-flex justify-content-around mt-4">
          <FrCardRadioInput
            class="w-25"
            :value="value1"
            v-model="selected2"
            name="group2">
          <code>{{ value1 }}</code>
          </FrCardRadioInput>
          <FrCardRadioInput
            class="w-25"
            :value="value2"
            v-model="selected2"
            name="group2">
            <div>{{ value2 }}</div>
            <div>{{ value2 }}</div>
            <div>{{ value2 }}</div>
          </FrCardRadioInput>
          <FrCardRadioInput
            class="w-25"
            :value="value3"
            v-model="selected2"
            name="group2">
            <i class="material-icons">
              people
            </i>
            <BCardFooter>
              <div class="d-flex w-100 flex-row-reverse">
                <BButton variant="primary">More info on {{ value3 }}</BButton>
              </div>
            </BCardFooter>
          </FrCardRadioInput>
        </div>
      </section>
    </BContainer>
  </div>
`;

stories.add('CardRadioInput', () => ({
  components: {
    BButton,
    BCardFooter,
    BContainer,
    FrCardRadioInput: CardRadioInput,
  },
  template,
  props: {
    disabled: {
      type: Boolean,
      default: boolean('disabled', false),
    },
    value1: {
      type: String,
      default: text('value1', 'apple'),
    },
    value2: {
      type: String,
      default: text('value2', 'orange'),
    },
    value3: {
      type: String,
      default: text('value3', 'banana'),
    },
    cardBodyClass: {
      type: String,
      default: text('cardBodyClass', ''),
    },
  },
  data() {
    return {
      selected: 'apple',
      selected2: '',
    };
  },
}));
