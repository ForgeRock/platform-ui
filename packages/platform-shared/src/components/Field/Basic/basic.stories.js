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
    <p class="mb-4 lead">Basic input field with Bootstrap Button Input Group functionality</p>
  </div>
  <div class="container">
    <section class="sg_pattern">
      <h2>Input</h2>
      <p class="mb-5">Example with Knobs</p>
      <BCard>
        <FrBasic
          v-model="inputValues.empty"
          :type="type"
          :autofocus="true"
          :label="label"
          :help-text="helpText"
          :disabled="disabled"/>
      </BCard>
    </section>

    <section class="sg_pattern">
      <h2>Basic Input</h2>
      <BCard>
        <FrBasic
          v-model="inputValues.empty"
          type="text"
          label="Label"
          help-text="Help text for this field."/>
      </BCard>
    </section>

    <section class="sg_pattern">
      <h2>Basic Input with number</h2>
      <BCard>
        <FrBasic
          v-model.number="inputValues.number"
          type="text"
          label="Label"
          help-text="Help text for this field."/>
      </BCard>
    </section>

    <section class="sg_pattern">
      <h2>Disabled</h2>
      <BCard>
        <FrBasic
          v-model="inputValues.disabled"
          type="text"
          label="Label"
          :disabled="true"
          help-text="Help text for this field."/>
      </BCard>
    </section>

    <section class="sg_pattern">
      <h2>Password Input</h2>
      <p class="mb-5">Example with type as "password"</p>
      <BCard>
        <BInputGroup>
          <FrBasic
            v-model="inputValues.password"
            type="password"
            label="Password"/>
        </BInputGroup> 
      </BCard>
    </section>

    <section class="sg_pattern">
      <h2>Input Group</h2>
      <p class="mb-5">Example with bootstrap BInputGroup text</p>
      <BCard>
        <BInputGroup>
          <FrBasic
            class="mb-3"
            v-model="inputValues.empty"
            type="text"
            :label="$t('common.description')">
            <template #prepend>
              <BInputGroupPrepend>
                <div class="input-group-text inset">
                  <span>@</span>
                </div>
              </BInputGroupPrepend>
            </template>
          </FrBasic>
        </BInputGroup>

        <BInputGroup>
          <FrBasic
            class="mb-3"
            v-model="inputValues.empty"
            type="text"
            :label="$t('common.description')">
            <template #append>
              <BInputGroupAppend>
                <div class="input-group-text inset">
                  <span>.forgerock.com</span>
                </div>
              </BInputGroupAppend>
            </template>
          </FrBasic>
        </BInputGroup> 
      </BCard>
    </section>

    <section class="sg_pattern">
      <h2>Button Input Group</h2>
      <p class="mb-5">Example with bootstrap BInputGroup buttons</p>
      <BCard>
        <BInputGroup>
          <FrBasic
            class="mb-3"
            v-model="inputValues.empty"
            type="text"
            :label="$t('common.description')">
            <template #append>
              <BInputGroupAppend>
                <BButton>
                  Button
                </BButton>
              </BInputGroupAppend>
            </template>
          </FrBasic>
        </BInputGroup>

        <BInputGroup>
          <FrBasic
            class="mb-3"
            v-model="inputValues.abc"
            type="password"
            :label="$t('common.description')">
            <template #append>
              <BInputGroupAppend>
                <BButton>
                  <i class="material-icons material-icons-outlined">
                    copy
                  </i>
                </BButton>
              </BInputGroupAppend>
              <BInputGroupAppend>
                <BButton>
                  <i class="material-icons material-icons-outlined">
                    sync
                  </i>
                </BButton>
              </BInputGroupAppend>
            </template>
          </FrBasic>
        </BInputGroup> 
      </BCard>
    </section>
  </div>
</div>`;

/* eslint import/no-extraneous-dependencies: 0 */
import { storiesOf } from '@storybook/vue';
import {
  withKnobs, boolean, text, select,
} from '@storybook/addon-knobs';
import {
  BButton,
  BCard,
  BInputGroup,
  BInputGroupAppend,
  BInputGroupPrepend,
} from 'bootstrap-vue';
import Basic from './index';

const stories = storiesOf('Components|Input|Basic', module).addParameters({ component: Basic });
stories.addDecorator(withKnobs);

stories.add('Basic Input', () => ({
  template,
  components: {
    BButton,
    BCard,
    BInputGroup,
    BInputGroupAppend,
    BInputGroupPrepend,
    FrBasic: Basic,
  },
  props: {
    disabled: {
      type: Boolean,
      default: boolean('disabled', false),
    },
    fieldName: {
      type: String,
      default: text('fieldName', ''),
    },
    helpText: {
      type: String,
      default: text('helpText', 'Help text for this field'),
    },
    label: {
      type: String,
      default: text('label', 'Label'),
    },
    type: {
      type: String,
      default: select('type', { Password: 'password', Text: 'text' }, 'text'),
    },
  },
  data: () => ({
    inputValues: {
      abc: 'abc',
      disabled: 'Disabled Field',
      empty: '',
      number: 5,
      password: '',
    },
  }),
}));
