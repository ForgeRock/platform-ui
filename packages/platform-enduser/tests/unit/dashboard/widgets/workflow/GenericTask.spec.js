import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import i18n from '@/i18n';
import GenericTask from '@/components/dashboard/widgets/workflow/GenericTask';

describe('GenericTask.vue', () => {
  Vue.use(BootstrapVue);

  it('Generic task widget loaded', () => {
    const wrapper = shallowMount(GenericTask, {
      i18n,
      propsData: {
        variables: {
          request: 'test',
          test: 'test',
        },
        taskFields: {
          formPropertyHandlers: [
            {
              id: 'justification',
              name: 'justification',
              readable: true,
              required: true,
              type: {
                mimeType: 'text/plain',
                name: 'number',
              },
              variableExpression: null,
              variableName: null,
              writable: true,
            },
            {
              id: 'request',
              name: 'request',
              readable: true,
              required: true,
              type: {
                mimeType: 'text/plain',
                name: 'number',
              },
              variableExpression: null,
              variableName: null,
              writable: true,
            },
          ],
        },
        processFields: [
          {
            justification: 'test',
          },
        ],
      },
    });

    expect(wrapper.name()).to.equal('GenericTask');
  });
});
