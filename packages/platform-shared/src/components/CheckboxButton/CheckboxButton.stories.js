/**
 * Copyright 2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
/* eslint import/no-extraneous-dependencies: 0 */
import { storiesOf } from '@storybook/vue';
import { withKnobs } from '@storybook/addon-knobs';
import { BContainer } from 'bootstrap-vue';
import CheckboxButton from './index';


const stories = storiesOf('Components|CheckboxButton', module).addParameters({ component: CheckboxButton });

stories.addDecorator(withKnobs);

const template = `
  <div>
    <div class="sg_masthead">
      <BContainer>
        <h1 class="display-4">
          CheckboxButton
        </h1>
      </BContainer>
    </div>
    <BContainer>
      <section class="sg_pattern">
        <h2>With Checkbox</h2>
        <div class="row">
          <div class="col">
            <FrCheckboxButton
                :defaultChecked="true"
            >Checkbox Button</FrCheckboxButton>
          </div>
        </div>
      </section>
    </BContainer>
  </div>
`;

stories.add('Checkbox Button', () => ({
  components: {
    FrCheckboxButton: CheckboxButton,
    BContainer,
  },
  template,
}));
