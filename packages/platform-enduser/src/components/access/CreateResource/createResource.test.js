import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, mount, shallowMount } from '@vue/test-utils';
import ToggleButton from 'vue-js-toggle-button';
import VeeValidate from 'vee-validate';
import i18n from '@/i18n';
import CreateResource from '@/components/access/CreateResource';

const localVue = createLocalVue();
localVue.use(BootstrapVue);
localVue.use(ToggleButton);
localVue.use(VeeValidate, { inject: false, fastExit: false });

describe('CreateResource.vue', () => {
  it('Create resource dialog loaded', () => {
    const wrapper = shallowMount(CreateResource, {
      localVue,
      i18n,
      propsData: {
        createProperties: [{
          key: 'test',
          type: 'string',
          title: 'test',
        }],
        resourceName: 'testName',
        resourceType: 'testType',
      },
      stubs: {
        BFormInput: true,
      },
    });

    expect(wrapper.name()).toBe('CreateResource');
    expect(wrapper).toMatchSnapshot();
  });

  it('Display policy error message', () => {
    const wrapper = shallowMount(CreateResource, {
      localVue,
      i18n,
      propsData: {
        createProperties: [{
          key: 'test',
          type: 'string',
          title: 'test',
        }],
        resourceName: 'testName',
        resourceType: 'testType',
      },
    });

    const error = wrapper.vm.findPolicyError({
      data: {
        detail: {
          failedPolicyRequirements: [{
            policyRequirements: [{
              policyRequirement: 'VALID_EMAIL_ADDRESS_FORMAT',
              property: 'test',
            }],
          }],
        },
        message: 'error',
      },
    });

    expect(error[0].msg).toBe('Invalid email format (example@example.com)');
  });

  it('Clean dialog after close', () => {
    const wrapper = mount(CreateResource, {
      localVue,
      i18n,
      propsData: {
        createProperties: [{
          key: 'test',
          type: 'string',
          title: 'test',
        },
        {
          key: 'boolTest',
          type: 'boolean',
          title: 'boolTest',
        }],
        resourceName: 'testName',
        resourceType: 'testType',
      },
    });

    wrapper.setData({
      formFields: {
        test: 'test',
        boolTest: true,
      },
    });

    wrapper.vm.hideModal();

    expect(wrapper.vm.formFields.test).toBe('');
    expect(wrapper.vm.formFields.boolTest).toBe(false);
  });

  it('Password reveal correctly', () => {
    const wrapper = mount(CreateResource, {
      localVue,
      i18n,
      propsData: {
        createProperties: [{
          key: 'password',
          type: 'string',
          title: 'password',
          encryption: {},
        }],
        resourceName: 'testName',
        resourceType: 'testType',

      },
    });

    expect(wrapper.vm.passwordInputType).toBe('password');

    wrapper.vm.revealNew();

    expect(wrapper.vm.passwordInputType).toBe('text');

    wrapper.vm.revealNew();

    expect(wrapper.vm.passwordInputType).toBe('password');
  });

  it('Clean save data', () => {
    const wrapper = mount(CreateResource, {
      localVue,
      i18n,
      propsData: {
        createProperties: [{
          key: 'password',
          type: 'string',
          title: 'password',
          encryption: {},
        }],
        resourceName: 'testName',
        resourceType: 'testType',
      },
    });

    const cleanData = wrapper.vm.cleanData({
      test: '',
    });

    expect(cleanData.test).toBeUndefined();
  });
});
