import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import i18n from '@/i18n';
import AccountSecurity from '@/components/profile/AccountSecurity';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

describe('AccountSecurity.vue', () => {
  let wrapper;
  beforeEach(() => {
    const userStore = {
      state: {
        internalUser: true,
      },
    };
    const applicationStore = {
      state: {},
    };
    wrapper = shallowMount(AccountSecurity, {
      localVue,
      i18n,
      mocks: {
        userStore,
        applicationStore,
      },
    });

    jest.spyOn(AccountSecurity, 'mounted')
      .mockImplementation(() => { });
  });

  it('AccountSecurity page loaded', () => {
    expect(wrapper.name()).toBe('AccountSecurity');
    expect(wrapper).toMatchSnapshot();
  });

  describe('#sendUpdateProfile', () => {
    it('should emit an "updateProfile" event with the payload and config', () => {
      wrapper.vm.sendUpdateProfile('test payload', 'test config');
      expect(wrapper.emitted().updateProfile.length).toBe(1);

      const [payload, config] = wrapper.emitted().updateProfile[0];

      expect(payload).toBe('test payload');
      expect(config).toBe('test config');
    });
  });
});
