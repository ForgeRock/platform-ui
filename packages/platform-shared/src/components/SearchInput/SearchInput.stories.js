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
import SearchInput from './index';

const stories = storiesOf('Components|SearchInput', module).addParameters({ component: SearchInput });

stories.addDecorator(withKnobs);

const template = `
  <div class="margin-25">
    <div class="sg_masthead">
      <BContainer>
        <h1 class="display-4">Search Input</h1>
        <p class="mb-4 lead">Search Input Groups don‘t use floating labels, and like password inputs have their addon absolutely positioned to allow selection on entire component, and borderless for a more seamless look.</p>
      </BContainer>
    </div>
    <BContainer>
      <section class="sg_pattern">
        <h2>Default</h2>
        <p class="mb-5">
          Default props. Use the knobs to change the icons and placeholder text. Append icon only shows when there is input to clear.
        </p>
        <BCard>
          <FrSearchInput
            :prepend-icon="prependIcon"
            :append-icon="appendIcon"
            :placeholder="placeholder"
          />
        </BCard>
      </section>
    </BContainer>
  </div>
`;

stories.add('SearchInput', () => ({
  components: {
    FrSearchInput: SearchInput,
    BCard,
    BContainer,
  },
  template,
  props: {
    appendIcon: {
      type: String,
      default: text('appendIcon', 'close'),
    },
    prependIcon: {
      type: String,
      default: text('prependIcon', 'search'),
    },
    placeholder: {
      type: String,
      default: text('placeholder', 'Search'),
    },
  },
}));
