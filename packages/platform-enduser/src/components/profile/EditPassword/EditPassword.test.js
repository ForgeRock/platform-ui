import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import Vuex from 'vuex';
import VeeValidate from 'vee-validate';
import EditPassword from '@/components/profile/EditPassword';
import PolicyPasswordInput from '@/components/utils/PolicyPasswordInput';
import ValidationError from '@/components/utils/ValidationError';
import i18n from '@/i18n';

const localVue = createLocalVue();
localVue.use(BootstrapVue);
localVue.use(VeeValidate);
localVue.use(PolicyPasswordInput);
localVue.use(ValidationError);
localVue.use(Vuex);


describe('EditPassword.vue', () => {
  const v = new VeeValidate.Validator();
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(EditPassword, {
      localVue,
      sync: false,
      provide: () => ({
        $validator: v,
      }),
      computed: {
        userId: '1234',
        managedResource: 'test',
        passwordReset: false,
      },
      i18n,
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


    jest.spyOn(EditPassword.methods, 'validate')
      .mockImplementation(() => Promise.resolve(true));
  });

  it('PasswordReset page loaded', () => {
    expect(wrapper.name()).toBe('EditPassword');
    expect(wrapper).toMatchSnapshot();
  });

  it('Incorrect password error', () => {
    wrapper.vm.displayError({
      response: {
        status: 403,
      },
    });

    expect(wrapper.vm.errors.all().length).toBe(2);
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
