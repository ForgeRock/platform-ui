/**
 * Copyright 2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
/* eslint import/no-extraneous-dependencies: 0 */
import { storiesOf } from '@storybook/vue';
import { withKnobs, select, object } from '@storybook/addon-knobs';
import {
  BCard,
  BContainer,
  BFormInput,
} from 'bootstrap-vue';
import {
  ValidationObserver,
  ValidationProvider,
  extend,
} from 'vee-validate';
import { required } from 'vee-validate/dist/rules';
import RequirementsList from './index';

const stories = storiesOf('Components|RequirementsList', module).addParameters({ component: RequirementsList });

stories.addDecorator(withKnobs);

const template = `
  <div>
    <div class="sg_masthead">
      <BContainer>
        <h1 class="display-4">Requirements List</h1>
        <p class="mb-4 lead">Requirements List is used to give a user immediate feedback on failed or passing requirements.</p>
      </BContainer>
    </div>
    <BContainer>
      <section class="sg_pattern">
        <h2>Knobs example</h2>
        <p class="mb-5">
          Adjust the props in the knobs tab. Rules that pass are grayed out. numColumns can be any integer greater than 0.
        </p>
        <BCard>
          <FrRequirementsList 
            :numColumns="numColumns"
            :rules="rules"
            :failedRules="failedRules" />
        </BCard>
      </section>
      <section class="sg_pattern">
        <h2>Example with input and vee-validate</h2>
        <p class="mb-5">
          Use the failedRules slotProp to pass failed rules directly to RequirementsList.
        </p>
        <BCard>
          <ValidationProvider
            :rules="rulesObject"
            :bails="false"
            v-slot="{ failedRules }"
            class="w-100">
            <BFormInput
              type="text"
              v-model="value" />
            <FrRequirementsList 
              :numColumns="2"
              :rules="rulesObject"
              :failedRules="failedRules" />
          </ValidationProvider>
        </BCard>
      </section>
    </BContainer>
  </div>
`;

const numColumns = {
  1: 1,
  2: 2,
  3: 3,
};
extend('required', {
  ...required,
});

extend('requireNumber', {
  validate(value) {
    return /[0-9]+/.test(value);
  },
  message: 'Must contain a number',
});

extend('requireSymbol', {
  validate(value) {
    return /[~!@#$%^&*()\-_=+[\]{}|;:,.<>/?]+/.test(value);
  },
  message: 'Must contain a symbol',
});

stories.add('RequirementsList', () => ({
  components: {
    FrRequirementsList: RequirementsList,
    BCard,
    BContainer,
    BFormInput,
    ValidationObserver,
    ValidationProvider,
  },
  template,
  data() {
    return {
      rulesObject: {
        required: true,
        requireNumber: true,
        requireSymbol: true,
      },
      value: '',
    };
  },
  props: {
    numColumns: {
      type: Number,
      default: select('numColumns', numColumns, 1),
    },
    rules: {
      type: Object,
      default: object('rules', {
        requireNumber: true,
        requireSymbol: true,
        required: true,
      }),
    },
    failedRules: {
      type: Object,
      default: object('failedRules', { requireNumber: 'vee-validate puts the validation message here, but it is not used/' }),
    },
  },
}));
