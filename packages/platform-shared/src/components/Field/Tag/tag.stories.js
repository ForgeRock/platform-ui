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
    <p class="mb-4 lead">Tag input field</p>
  </div>
  <div class="container">
    <section class="sg_pattern">
      <h2>Tag</h2>
      <p class="mb-5">Example using Tag</p>
      <BCard>
        <FrTag
          v-model="inputValue.ex1"
          :fieldTitle="'Tag Input'"
          label="Tag" />
      </BCard>
    </section>
  </div>
</div>`;

/* eslint import/no-extraneous-dependencies: 0 */
import { storiesOf } from '@storybook/vue';
import {
  BCard,
} from 'bootstrap-vue';
import Tag from './index';

const stories = storiesOf('Components|Input|Tag', module);

stories.add('Tag', () => ({
  template,
  components: {
    BCard,
    FrTag: Tag,
  },
  data: () => ({
    inputValue: {
      ex1: [],
      ex2: ['a', 'd'],
    },
  }),
}));
