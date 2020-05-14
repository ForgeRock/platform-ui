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
    <h1 class="display-4">Script Editor</h1>
    <p class="mb-4 lead">Component that takes both past and new backend data and allows user to add/edit
    script and variables</p>
  </div>
  <BCard>
    <FrScriptEditor
      v-model="sampleInput" />
  </BCard>
</div>`;

/* eslint import/no-extraneous-dependencies: 0 */
import { storiesOf } from '@storybook/vue';
import { BCard } from 'bootstrap-vue';
import ScriptEditor from './index';

const stories = storiesOf('Components|ScriptEditor', module).addParameters({ component: ScriptEditor });

stories.add('Script Editor', () => ({
  template,
  components: {
    BCard,
    FrScriptEditor: ScriptEditor,
  },
  data: () => ({
    sampleInput: {
      type: 'javascript',
      globals: {
        string_test: 'test',
        string_array_test: '["array1", { second: ["array2"], third: "array3" }]',
        array_test: ['array1', { second: ['array2'], third: 'array3' }],
        string_object_test: '{ second: ["object1", "object2"], third: "object3" }',
        object_test: { second: ['object1', 'object2'], third: 'object3' },
        string_boolean_test: 'true',
        boolean_test: true,
        string_number_test: '3',
        number_test: 3,
        empty_test: '',
        null_test: null,
      },
      file: '/file/path.js',
    },
  }),
  methods: {
    checkInput() {
    },
  },
}));
