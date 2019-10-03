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
    const store = new Vuex.Store({
      state: {
        UserStore: {
          userId: null,
          managedResource: null,
          roles: null,
          internalUser: false,
          adminUser: false,
          profile: {},
          schema: {
            order: [],
            properties: {
              preferences: {
                properties: {
                  updates: {
                    description: 'Send me news and updates',
                    value: false,
                  },
                  marketing: {
                    description: 'Send me special offers and services',
                    value: true,
                  },
                },
              },
            },
            required: [],
          },
          access: [],
          givenName: '',
          sn: '',
          email: '',
          userName: '',
        },
        ApplicationStore: {
          authHeaders: null,
          amDataEndpoints: null,
          loginRedirect: null,
          amBaseURL: 'https://default.iam.example.com/am',
          idmBaseURL: 'https://default.iam.example.com/openidm',
          loginURL: 'http://localhost:8083/#/service/login',
          theme: 'default',
          idmClientID: 'endUserUIClient',
          adminURL: 'http://localhost:8082',
        },
      },
    });

    const wrapper = mount(Profile, {
      localVue,
      i18n,
      store,
      stubs: {
        ToggleButton: true,
      },
    });

    expect(wrapper.name()).toBe('Profile');
    expect(wrapper).toMatchSnapshot();
  });
});
