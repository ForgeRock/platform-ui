/**
 * Copyright 2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
/* eslint-disable import/first */
const template = `
<div class="margin-25">
  <div class="sg_masthead">
    <h1 class="display-4">Input</h1>
    <p class="mb-4 lead">Select input field</p>
  </div>
  <div class="container">
    <section class="sg_pattern">
      <h2>Select</h2>
      <p class="mb-5">Example using Select</p>
      <BCard>
      <FrSelect
        v-model="inputValue"
        :select-options="selectOptions"
        label="Select"
      />
      </BCard>
    </section>
  </div>
</div>`;

/* eslint import/no-extraneous-dependencies: 0 */
import { storiesOf } from '@storybook/vue';
import {
  BCard,
} from 'bootstrap-vue';
import Select from './index';

const stories = storiesOf('Components|Input|Select', module).addParameters({ component: Select });

stories.add('Select', () => ({
  template,
  components: {
    BCard,
    FrSelect: Select,
  },
  data: () => ({
    inputValue: '',
    selectOptions: [
      { value: 'a', text: 'A', disabled: false },
      { value: 'b', text: 'B', disabled: false },
      { value: 'c', text: 'C', disabled: false },
      { value: 'd', text: 'D', disabled: true },
      { value: 'e', text: 'E', disabled: false },
    ],
    failedPolicies: [],
    failedPoliciesPassword: [],
  }),
  methods: {},
}));
