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
} from 'bootstrap-vue';
import Spinner from './index';

const stories = storiesOf('Components|Spinner', module).addParameters({ component: Spinner });

stories.addDecorator(withKnobs);

const template = `
  <div class="margin-25">
    <div class="sg_masthead">
      <BContainer>
        <h1 class="display-4">Spinner</h1>
        <p class="mb-4 lead">Spinners are loading indicators that should be shown when retrieving data or performing slow computations.</p>
      </BContainer>
    </div>
    <BContainer>
      <section class="sg_pattern">
        <h2>Example</h2>
        <p class="mb-5">
          Use a large spinner to indicate a card or page load. Use a small spinner when displaying in a data table or smaller area. Use knob to switch spinner sizes.
        </p>
        <BCard>
          <FrSpinner 
            :size="size" />
        </BCard>
      </section>
    </BContainer>
  </div>
`;

const sizes = {
  lg: 'lg',
  sm: 'sm',
};

stories.add('Spinner', () => ({
  components: {
    FrSpinner: Spinner,
    BCard,
    BContainer,
  },
  template,
  props: {
    size: {
      type: String,
      default: select('size', sizes, 'lg'),
    },
  },
}));
