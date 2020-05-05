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
    <p class="mb-4 lead">Multiselect input field</p>
  </div>
  <div class="container">
    <section class="sg_pattern">
      <h2>Multiselect</h2>
      <p class="mb-5">Example using Multiselect</p>
      <BCard>
        <FrMultiSelect
          v-model="inputValue.ex1"
          :select-options="selectOptions"
          label="MultiSelect" />
      </BCard>
    </section>

    <section class="sg_pattern">
      <h2>Multiselect</h2>
      <p class="mb-5">Example using Multiselect with pre selected options</p>
      <BCard>
        <FrMultiSelect
        v-model="inputValue.ex2"
        :select-options="selectOptions"
        label="MultiSelect" />
      </BCard>
    </section>
  </div>
</div>`;

/* eslint import/no-extraneous-dependencies: 0 */
import { storiesOf } from '@storybook/vue';
import {
  BCard,
} from 'bootstrap-vue';
import MultiSelect from './index';

const stories = storiesOf('Components|Input|MultiSelect', module).addParameters({ component: MultiSelect });

stories.add('MultiSelect', () => ({
  template,
  components: {
    BCard,
    FrMultiSelect: MultiSelect,
  },
  data: () => ({
    inputValue: {
      ex1: [],
      ex2: ['a', 'd'],
      ex3: ['a', 'd'],
    },
    selectOptions: [
      { value: 'a', text: 'userName', disabled: false },
      { value: 'b', text: 'accountStatus', disabled: false },
      { value: 'c', text: 'givenName', disabled: false },
      { value: 'd', text: 'description', disabled: true },
      { value: 'e', text: 'telephoneNumber', disabled: false },
      { value: 'f', text: 'postalAddress', disabled: false },
      { value: 'g', text: 'address2', disabled: false },
      { value: 'h', text: 'preference/marketing', disabled: false },
      { value: 'i', text: 'sn', disabled: false },
      { value: 'j', text: 'mail', disabled: false },
    ],
  }),
}));
