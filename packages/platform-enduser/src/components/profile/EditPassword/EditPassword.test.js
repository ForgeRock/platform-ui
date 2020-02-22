/**
 * Copyright 2019 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import Vuex from 'vuex';
import { ValidationProvider, ValidationObserver } from 'vee-validate';
import PolicyPasswordInput from '@forgerock/platform-shared/src/components/PolicyPasswordInput';
import EditPassword from '@/components/profile/EditPassword';
import i18n from '@/i18n';

const localVue = createLocalVue();
localVue.use(BootstrapVue);
localVue.use(PolicyPasswordInput);
localVue.use(Vuex);

describe('EditPassword.vue', () => {
  let wrapper;
  const stubs = {
    ValidationProvider,
    ValidationObserver,
  };
  beforeEach(() => {
    wrapper = shallowMount(EditPassword, {
      localVue,
      sync: false,
      computed: {
        userId: '1234',
        managedResource: 'test',
        passwordReset: false,
      },
      i18n,
      stubs,
    });

    jest.spyOn(EditPassword, 'data')
      .mockImplementation(() => ({
        currentPassword: '',
        newPassword: '',
        loading: false,
        showNew: true,
        showCurrent: true,
        inputCurrent: 'password',
        inputNew: 'password',
      }));
  });

  it('PasswordReset page loaded', () => {
    expect(wrapper.name()).toBe('EditPassword');
    expect(wrapper).toMatchSnapshot();
  });

  it('Incorrect password error', async () => {
    wrapper.vm.displayError({
      response: {
        status: 403,
      },
    });
    expect(wrapper.vm.$refs.provider.errors).toEqual(['Incorrect password provided']);
  });

  it('revealNew method changes input state', () => {
    wrapper.vm.revealNew();

    expect(wrapper.vm.inputNew).toBe('text');
    expect(wrapper.vm.showNew).toBe(false);

    wrapper.vm.revealNew();

    expect(wrapper.vm.inputNew).toBe('password');
    expect(wrapper.vm.showNew).toBe(true);
  });

  it('revealCurrent method changes input state', () => {
    wrapper.vm.revealCurrent();

    expect(wrapper.vm.inputCurrent).toBe('text');
    expect(wrapper.vm.showCurrent).toBe(false);

    wrapper.vm.revealCurrent();

    expect(wrapper.vm.inputCurrent).toBe('password');
    expect(wrapper.vm.showCurrent).toBe(true);
  });


  it('should reset data and visual elements', () => {
    wrapper.vm.$refs = { cancel: { click: jest.fn() } };
    wrapper.vm.resetComponent();

    expect(wrapper.vm.loading).toBe(false);
    expect(wrapper.vm.currentPassword).toBe('');
    expect(wrapper.vm.newPassword).toBe('');
  });
});
