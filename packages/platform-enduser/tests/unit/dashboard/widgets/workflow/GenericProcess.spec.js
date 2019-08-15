import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import i18n from '@/i18n';
import GenericProcess from '@/components/dashboard/widgets/workflow/GenericProcess';

describe('GenericProcess.vue', () => {
  Vue.use(BootstrapVue);

  it('Generic process widget loaded', () => {
    const wrapper = shallowMount(GenericProcess, {
      i18n,
      propsData: {
        workflowDetails: [{
          id: 'request',
          name: 'Request',
          readable: true,
          required: true,
          type: {
            mimeType: 'text/plain',
            name: 'string',
          },
          variableExpression: null,
          variableName: null,
          writable: true,
        },
        {
          id: 'fake',
          name: 'fake',
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
          id: 'justification',
          name: 'Justification',
          readable: true,
          required: true,
          type: {
            mimeType: 'text/plain',
            name: 'boolean',
          },
          variableExpression: null,
          variableName: null,
          writable: true,
        }],
        id: 'test',
      },
    });

    expect(wrapper.name()).to.equal('GenericProcess');

    wrapper.vm.resetForm();

    expect(wrapper.vm.formValues.fake).to.equal(0);
  });
});
