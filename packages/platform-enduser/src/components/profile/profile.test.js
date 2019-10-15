import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, mount } from '@vue/test-utils';
import Vuex from 'vuex';
import i18n from '@/i18n';
import Profile from '@/components/profile';

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(BootstrapVue);

Profile.components['fr-consent'] = jest.fn();
Profile.components['fr-edit-personal-info'] = jest.fn();
Profile.components['fr-account-controls'] = jest.fn();
Profile.components['fr-account-security'] = jest.fn();

describe('Profile.vue', () => {
  it('Profile page loaded', () => {
    const getUserProfile = jest.fn();

    const store = new Vuex.Store({
      state: {
        UserStore: {},
        ApplicationStore: {},
      },
    });

    const wrapper = mount(Profile, {
      localVue,
      i18n,
      store,
      computed: {
        fullName() {
          return '';
        },
      },
      stubs: {
        ToggleButton: true,
      },
      methods: {
        getUserProfile,
      },
    });

    expect(wrapper.name()).toBe('Profile');
    expect(wrapper).toMatchSnapshot();
  });
});
