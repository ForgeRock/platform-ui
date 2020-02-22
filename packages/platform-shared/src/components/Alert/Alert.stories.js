/**
 * Copyright 2019-2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
/* eslint import/no-extraneous-dependencies: 0 */
import { storiesOf } from '@storybook/vue';
import { withKnobs, select, boolean } from '@storybook/addon-knobs';
import Alert from './index';

const stories = storiesOf('Components|Alerts', module).addParameters({ component: Alert });
stories.addDecorator(withKnobs);

const template = `
  <div class="margin-25">
    <div class="sg_masthead">
      <h1 class="display-4">Alert</h1>
      <p class="mb-4 lead">Alert extends bootstrap-vue alert to allow for customized styles and icons.</p>
    </div>
    <FrAlert 
      :dismissible="dismissible"
      :fade="fade"
      :show="show"
      :variant="variant"
      show>
      System message goes here
    </FrAlert>
  </div>
`;

const types = {
  Primary: 'primary',
  Secondary: 'secondary',
  Success: 'success',
  Danger: 'danger',
  Warning: 'warning',
  Information: 'info',
  Light: 'light',
  Dark: 'dark',
};

stories.add('Alert variants', () => ({
  components: {
    FrAlert: Alert,
  },
  template,
  props: {
    dismissible: {
      type: Boolean,
      default: boolean('dismissible', true),
    },
    fade: {
      type: Boolean,
      default: boolean('fade', true),
    },
    show: {
      type: Boolean,
      default: boolean('show', true),
    },
    variant: {
      type: String,
      default: select('variant', types, 'primary'),
    },
  },
}));
