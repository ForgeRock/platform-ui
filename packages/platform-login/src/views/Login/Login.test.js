/**
 * Copyright (c) 2021-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, shallowMount, flushPromises } from '@vue/test-utils';
import { defineRule } from 'vee-validate';
// eslint-disable-next-line import/no-extraneous-dependencies
import { email, required } from '@vee-validate/rules';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import { sanitize } from '@forgerock/platform-shared/src/utils/sanitizerConfig';
import { URLSearchParams } from 'url';
import {
  FRStep,
  FRAuth,
} from '@forgerock/javascript-sdk';
import LoginMixin from '@forgerock/platform-shared/src/mixins/LoginMixin';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import i18n from '@/i18n';
import * as urlUtil from '../../utils/urlUtil';
import { getAlternateFieldType } from '../../utils/loginUtils';
import * as authResumptionUtil from '../../utils/authResumptionUtil';
import Login from './index';

defineRule('required', (value) => required(value) || 'required');
defineRule('email', (value) => email(value) || 'email should be valid');

describe('Login.vue', () => {
  let wrapper;
  const $route = {
    params: {
      tree: undefined,
    },
  };

  beforeEach(() => {
    jest.spyOn(LoginMixin.methods, 'getConfigurationInfo').mockImplementation(() => Promise.resolve({ data: { realm: '/' } }));
    wrapper = shallowMount(Login, {
      global: {
        stubs: {
          'router-link': true,
        },
        mocks: {
          $route,
          $sanitize: (message, config) => sanitize(message, config),
          $t: () => {},
          $store: {
            state: {
              SharedStore: {
                webStorageAvailable: true,
              },
            },
          },
        },
        mixins: [LoginMixin],
      },
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('Removes undefined and "undefined" tree from stepParams', () => {
    const expectedStepParams = {
      query: {
        suspendedId: 'test',
      },
      realmPath: 'test',
    };
    // test undefined tree
    wrapper.setData({
      realm: 'test',
      suspendedId: 'test',
    });
    expect(wrapper.vm.getStepParams()).toEqual(expectedStepParams);
    // test tree with the string "undefined"
    wrapper.setData({
      realm: 'test',
      suspendedId: 'test',
      treeId: 'undefined',
    });

    expect(wrapper.vm.getStepParams()).toEqual(expectedStepParams);
  });

  it('Detects /am/console as the default path', () => {
    expect(wrapper.vm.isDefaultPath('/am/console')).toEqual(true);
    expect(wrapper.vm.isDefaultPath('/am/fail')).toEqual(false);
  });

  it('Detects /auth/console as the default path', () => {
    expect(wrapper.vm.isDefaultPath('/auth/console')).toEqual(true);
    expect(wrapper.vm.isDefaultPath('/auth/fail')).toEqual(false);
  });

  it('Detects SAML urls', () => {
    const samlUrls = [
      'https://default.iam.example.com/am/Consumer/metaAlias/avsp',
      'https://default.iam.example.com/am/saml2/continue/metaAlias/avidp',
      'https://default.iam.example.com/am/saml2/jsp/idpSSOInit.jsp?metaAlias=/avidp',
    ];
    samlUrls.forEach((url) => {
      expect(wrapper.vm.isSamlURL(url)).toEqual(true);
    });
    expect(wrapper.vm.isSamlURL('https://default.iam.example.com/am/XUI')).toEqual(false);
  });

  it('Redirects SAML goto urls', () => {
    const successURL = '/am/console';
    const realm = '/root';
    const gotoBase = '?goto=';
    const samlUrls = [
      'https://default.iam.example.com/am/Consumer/metaAlias/avsp',
      'https://default.iam.example.com/am/saml2/continue/metaAlias/avidp',
      'https://default.iam.example.com/am/saml2/jsp/idpSSOInit.jsp?metaAlias=/avidp',
    ];

    // Mock gotoURL validation call
    jest.spyOn(wrapper.vm, 'getRequestService').mockImplementation(() => ({ post: () => Promise.resolve({ data: { successURL } }) }));

    // Test verifyGotoUrlAndRedirect
    samlUrls.forEach(async (goto) => {
      // Set up window object with correct goto search params
      Object.defineProperty(global, 'window', {
        value: {
          location: {
            search: `${gotoBase}${goto}`,
          },
        },
        writable: true,
      });

      expect(await wrapper.vm.verifyGotoUrlAndRedirect(successURL, realm)).toEqual(goto);
    });
  });

  it('Sets page title if url hash includes "service" or authIndexType && authIndexValue params', () => {
    const windowHash = '#/service/ResetPassword';
    const windowHashWithParams = '#/service/Login?goto=https%3A%2F%2Fdefault.iam.example.com';
    const windowSearch = '&authIndexType=service&authIndexValue=Registration';
    const URLSearchParamsMock = {
      get: (param) => {
        if (param === 'authIndexType') return 'service';
        if (param === 'authIndexValue') return 'Registration';
        return null;
      },
    };

    wrapper.vm.setPageTitle(windowSearch, URLSearchParamsMock);
    expect(document.title).toEqual('Registration');

    wrapper.vm.setPageTitle(windowHash);
    expect(document.title).toEqual('ResetPassword');

    wrapper.vm.setPageTitle(windowHashWithParams);
    expect(document.title).toEqual('Login');
  });

  it('keeps params like noSession when is a link from an Email URL', () => {
    jest.spyOn(urlUtil, 'getCurrentQueryString').mockReturnValue('noSession=true&param1=test');

    const expectedStepParams = {
      query: {
        suspendedId: 'test',
        noSession: 'true',
        param1: 'test',
      },
      realmPath: 'test',
    };
    // test undefined tree
    wrapper.setData({
      realm: 'test',
      suspendedId: 'test',
    });

    expect(wrapper.vm.getStepParams()).toEqual(expectedStepParams);
  });

  it('keeps params like noSession when is a redirect from a callback ', () => {
    jest.spyOn(urlUtil, 'getCurrentQueryString').mockReturnValue('noSession=true&param1=test');

    const expectedStepParams = {
      query: {
        noSession: 'true',
        param1: 'test',
        code: 'test',
        state: 'test',
        scope: 'test',
      },
      realmPath: 'test',
    };
    // test undefined tree
    wrapper.setData({
      realm: 'test',
    });
    wrapper.vm.treeResumptionParameters = {
      code: 'test',
      state: 'test',
      scope: 'test',
    };

    expect(wrapper.vm.getStepParams()).toEqual(expectedStepParams);
  });

  it('Sets the correct field data type based on policyRequirements', () => {
    expect(getAlternateFieldType(['VALID_DATE_TIME_FORMAT'])).toEqual('datetime');
    expect(getAlternateFieldType(['VALID_DATE'])).toEqual('date');
    expect(getAlternateFieldType(['VALID_DATE_FORMAT'])).toEqual('date');
    expect(getAlternateFieldType(['VALID_TIME_FORMAT'])).toEqual('time');
  });

  describe('buildTreeForm', () => {
    it('metadata callbacks are not added to the component list', () => {
      jest.spyOn(wrapper.vm, 'isCallbackRequired').mockReturnValue(false);

      const data = {
        loading: true,
        step: new FRStep({
          callbacks: [
            {
              type: 'MetadataCallback',
              output: [
                {
                  name: 'data',
                  value: {
                    realm: '/alpha',
                  },
                },
              ],
              _id: 1,
            },
          ],
        }),
      };

      wrapper.setData(data);
      wrapper.vm.buildTreeForm();

      expect(wrapper.vm.componentList.length).toBe(0);
    });
  });

  describe('handleIdpComponent', () => {
    describe('given idp component ', () => {
      it('should remove idp component from componentsList to the `idpComponent` field', () => {
        const idpComponent = {
          callback: {
            getOutputByName: jest.fn(),
            payload: {
              type: 'SelectIdPCallback',
            },
            setInputValue: jest.fn(),
          },
        };
        const componentList = [
          {
            callback: {
              payload: {
                type: 'NameCallback',
              },
            },
          },
          idpComponent,
          {
            callback: {
              payload: {
                type: 'PasswordCallback',
              },
            },
          },
        ];

        expect(componentList.length).toBe(3);
        expect(wrapper.vm.idpComponent).toBeUndefined();

        wrapper.vm.handleIdpComponent(componentList, 1);
        expect(componentList.length).toBe(2);
        expect(wrapper.vm.idpComponent).toStrictEqual(idpComponent);
      });
    });

    describe('given non array', () => {
      it('should do nothing', () => {
        wrapper.vm.handleIdpComponent({}, 1);

        expect(wrapper.vm.idpComponent).toBeUndefined();
      });
    });
  });

  describe('redirectToFailure', () => {
    const originalLocation = window.location;

    afterAll(() => {
      delete window.location;
      window.location = originalLocation;
    });

    it('Calls verifyGotoUrlAndRedirect and sets window.location.href without double-encoding', async () => {
      const gotoOnFail = 'https://example.com/failure?error=some%20error';

      delete window.location;
      window.location = {
        search: `?gotoOnFail=${encodeURIComponent(gotoOnFail)}`,
        href: '',
      };

      const verifySpy = jest.spyOn(wrapper.vm, 'verifyGotoUrlAndRedirect').mockResolvedValue(gotoOnFail);

      await wrapper.vm.redirectToFailure({});

      expect(verifySpy).toHaveBeenCalledWith(gotoOnFail, '/', false, true);
      expect(window.location.href).toBe(gotoOnFail);
    });
  });
});

describe('Component Test', () => {
  const stepPayload = {
    authId: 'eyxQ',
    callbacks: [
      {
        type: 'NameCallback',
        output: [
          {
            name: 'prompt',
            value: 'User Name',
          },
        ],
        input: [
          {
            name: 'IDToken1',
            value: '',
          },
        ],
        _id: 0,
      },
      {
        type: 'PasswordCallback',
        output: [
          {
            name: 'prompt',
            value: 'Password',
          },
          {
            name: 'policies',
            value: {
              policyRequirements: [
                'VALID_TYPE',
              ],
              fallbackPolicies: null,
              name: 'password',
              policies: [
                {
                  policyRequirements: [
                    'VALID_TYPE',
                  ],
                  policyId: 'valid-type',
                  params: {
                    types: [
                      'string',
                    ],
                  },
                },
              ],
              conditionalPolicies: null,
            },
          },
          {
            name: 'failedPolicies',
            value: [
              '{ "policyRequirement": "LENGTH_BASED", "params": { "max-password-length": 0, "min-password-length": 8 } }',
              "{ \"policyRequirement\": \"CHARACTER_SET\", \"params\": { \"allow-unclassified-characters\": true, \"character-set-ranges\": [  ], \"character-sets\": [ \"1:0123456789\", \"1:ABCDEFGHIJKLMNOPQRSTUVWXYZ\", \"1:abcdefghijklmnopqrstuvwxyz\", \"1:~!@#$%^&*()-_=+[]{}|;:,.<>/?\\\"'\\\\`\" ], \"min-character-sets\": 0 } }",
            ],
          },
        ],
        input: [
          {
            name: 'IDToken2',
            value: '',
          },
        ],
        _id: 1,
      },
    ],
    header: 'Sign In',
    description: 'New here? <a href="#/service/Registration">Create an account</a><br><a href="#/service/ForgottenUsername">Forgot username?</a><a href="#/service/ResetPassword"> Forgot password?</a>',
  };

  const mountLogin = async (overrideData = {}, props = {}) => {
    const wrapper = mount(Login, {
      global: {
        stubs: {
          'router-link': true,
          FrField: true,
          FrPasswordCallback: true,
        },
        mocks: {
          $route: {
            params: {
              tree: undefined,
            },
          },
          $t: (t) => t,
          $store: {
            state: {
              SharedStore: {
                webStorageAvailable: true,
              },
            },
          },
          $sanitize: (message, config) => sanitize(message, config),
        },
      },
      mixins: [LoginMixin],
      props,
    });
    await flushPromises();

    await wrapper.setData(overrideData);
    return wrapper;
  };

  describe('Loads login callback components with extra query parameters in the URL', () => {
    const originalWindow = window;
    global.URLSearchParams = URLSearchParams;

    const setUrl = (url) => {
      delete window.location;
      window.location = new URL(url);
    };

    let replaceState;

    beforeAll(() => {
      jest.restoreAllMocks();
    });

    beforeEach(() => {
      jest.spyOn(LoginMixin.methods, 'getConfigurationInfo').mockImplementation(() => Promise.resolve({ data: { realm: '/' } }));
      replaceState = jest.fn();
      Object.defineProperty(global, 'window', {
        writable: true,
        value: {
          location: {},
          history: {
            replaceState,
          },
        },
      });
    });

    afterAll(() => {
      // eslint-disable-next-line no-global-assign
      window = originalWindow;
    });

    it('Removes tree resumption query parameters when returning from a redirect', async () => { // TODO this scenario may no longer be relevant given the other changes made here
      setUrl('https://forgerock.io/login/?realm=/&code=aCode');

      // indicate that the tree is being resumed following a redirect
      const resumingSpy = jest.spyOn(authResumptionUtil, 'resumingTreeFollowingRedirect').mockReturnValue(true);
      const getStepSpy = jest.spyOn(authResumptionUtil, 'getResumeDataFromStorageAndClear').mockReturnValue({ urlAtRedirect: 'blah', step: { payload: {} } });

      const wrapper = await mountLogin();

      expect(replaceState).toBeCalledWith(null, null, '?realm=/');
      expect(findByTestId(wrapper, 'callbacks_panel').exists()).toBeTruthy();

      resumingSpy.mockRestore();
      getStepSpy.mockRestore();
    });

    it('Leaves tree resumption query parameters in place when not returning from a redirect', async () => {
      setUrl('https://forgerock.io/login/?realm=/&code=aCode&notRemoved=here');

      // indicate that the tree is being resumed following a redirect
      const resumingSpy = jest.spyOn(authResumptionUtil, 'resumingTreeFollowingRedirect').mockReturnValue(false);

      const wrapper = await mountLogin();

      expect(replaceState).toBeCalledWith(null, null, '?realm=/&code=aCode&notRemoved=here');
      expect(findByTestId(wrapper, 'callbacks_panel').exists()).toBeTruthy();

      resumingSpy.mockRestore();
    });

    it('add validation immediate to component if it has failed policies', async () => {
      const data = {
        loading: true,
        step: new FRStep(stepPayload),
      };

      const wrapper = await mountLogin(data);

      wrapper.vm.buildTreeForm();
      await flushPromises();

      expect(wrapper.vm.componentList[0].callbackSpecificProps.validationImmediate).toBe(false);
      expect(wrapper.vm.componentList[1].callbackSpecificProps.validationImmediate).toBe(true);
    });
  });

  describe('Theming and callbacks', () => {
    function setup(props) {
      return mount(Login, {
        global: {
          plugins: [i18n],
          stubs: {
            'router-link': true,
          },
          mocks: {
            $route: {
              params: {
                tree: undefined,
              },
            },
            $sanitize: () => {},
            $store: {
              state: {
                SharedStore: {
                  webStorageAvailable: true,
                },
              },
            },
          },
        },
        attachTo: document.body,
        mixins: [LoginMixin, RestMixin],
        props: {
          ...props,
        },
      });
    }

    const authData = {
      authId: '',
      callbacks: [{
        type: 'NameCallback', output: [{ name: 'prompt', value: 'User Name' }], input: [{ name: 'IDToken1', value: '' }],
      }, {
        type: 'PasswordCallback', output: [{ name: 'prompt', value: 'Password' }], input: [{ name: 'IDToken2', value: '' }],
      }],
      header: 'Sign In',
      description: '',
    };

    beforeEach(() => {
      jest.spyOn(FRAuth, 'next').mockImplementation(() => Promise.resolve(new FRStep(authData)));
    });

    describe('@renders', () => {
      it('Displays remember my login checkbox if its enabled in the theme', async () => {
        const wrapper = setup();
        await flushPromises();

        let rememberMe = wrapper.find('input[name="rememberMe"]');
        expect(rememberMe.exists()).toBeFalsy();

        await wrapper.setProps({ journeyRememberMeEnabled: true });
        await wrapper.vm.$nextTick();

        rememberMe = wrapper.find('input[name="rememberMe"]');
        expect(rememberMe.exists()).toBeTruthy();

        let rememberMeLabel = wrapper.find('#rememberMe label');
        expect(rememberMeLabel.text()).toBe('Remember Me');

        await wrapper.setProps({ journeyRememberMeLabel: 'test' });
        await wrapper.vm.$nextTick();
        rememberMeLabel = wrapper.find('#rememberMe label');
        expect(rememberMeLabel.text()).toBe('test');
      });
    });

    describe('@actions', () => {
      it('Saves username to localstorage if rememberMe is enabled', async () => {
        const wrapper = setup();
        await flushPromises();

        await wrapper.setProps({ journeyRememberMeEnabled: true });
        await wrapper.vm.$nextTick();

        const localStorageSpy = jest.spyOn(Storage.prototype, 'setItem');
        let usernameInput = wrapper.find('div[label="User Name"] input');
        let nextBtn = wrapper.find('button[type="submit"]');

        await usernameInput.setValue('test');

        await nextBtn.trigger('click');
        await wrapper.vm.$nextTick();
        expect(localStorageSpy).not.toHaveBeenCalled();

        // Page will reload with the same callbacks because of the mocked FrAuth

        usernameInput = wrapper.find('div[label="User Name"] input');
        nextBtn = wrapper.find('button[type="submit"]');
        const rememberMe = wrapper.find('input[name="rememberMe"]');

        await usernameInput.setValue('test2');
        await rememberMe.setChecked();
        await nextBtn.trigger('click');
        await wrapper.vm.$nextTick();

        expect(localStorageSpy).toHaveBeenCalledWith('frUsername', 'test2');
      });

      it('Removes username to localstorage if rememberMe is disabled', async () => {
        const wrapper = setup();
        await flushPromises();

        await wrapper.setProps({ journeyRememberMeEnabled: true });
        await wrapper.vm.$nextTick();

        const localStorageSpy = jest.spyOn(Storage.prototype, 'removeItem');
        const usernameInput = wrapper.find('div[label="User Name"] input');
        const rememberMe = wrapper.find('input[name="rememberMe"]');
        const nextBtn = wrapper.find('button[type="submit"]');

        await usernameInput.setValue('test');
        await rememberMe.setChecked(false);

        await nextBtn.trigger('click');
        await wrapper.vm.$nextTick();
        expect(localStorageSpy).toHaveBeenCalled();
      });
    });
    describe('callbacks', () => {
      it('ensures that the username field is populated with the defaultText value if a defaultText output object is present', async () => {
        const authDataWithDefaultText = {
          authId: '',
          callbacks: [{
            type: 'NameCallback',
            output: [
              { name: 'prompt', value: 'User Name' },
              { name: 'defaultText', value: 'User Name default value text' },
            ],
            input: [{ name: 'IDToken1', value: '' }],
          }],
          header: 'Sign In',
          description: '',
        };
        jest.spyOn(FRAuth, 'next').mockImplementation(() => Promise.resolve(new FRStep(authDataWithDefaultText)));

        const wrapper = setup();
        jest.spyOn(wrapper.vm, 'getRequestService').mockImplementation(() => ({ post: () => Promise.resolve({ data: { successURL: '/am/console' } }) }));
        await flushPromises();

        const usernameInput = wrapper.find('div[label="User Name"] input');
        expect(usernameInput.element.value).toBe('User Name default value text');
      });

      it('Sets validation attributes when valid email address and required policies are present', async () => {
        const stepValidationPayload = {
          authId: 'eyxQ',
          callbacks: [
            {
              type: 'NameCallback',
              output: [
                { name: 'prompt', value: 'Email' },
                { name: 'policies', value: { policyRequirements: ['VALID_EMAIL_ADDRESS_FORMAT', 'REQUIRED'] } },
              ],
              input: [
                { name: 'IDToken1', value: '' },
              ],
              _id: 0,
            },
          ],
          description: '',
        };

        jest.spyOn(FRAuth, 'next').mockImplementation(() => Promise.resolve(new FRStep(stepValidationPayload)));
        const data = { loading: true, step: new FRStep(stepValidationPayload) };
        const wrapper = setup(data);

        await flushPromises();
        wrapper.vm.buildTreeForm();
        await flushPromises();

        const frField = wrapper.find('.callback-component');
        // Check the validation attribute
        expect(frField.attributes('validation')).toBe('email|required');
      });

      it('Sets autocomplete attribute when autocompleteValues output is present', async () => {
        const authDataWithAutocomplete = {
          authId: '',
          callbacks: [{
            type: 'NameCallback',
            output: [
              { name: 'prompt', value: 'User Name' },
              { name: 'autocompleteValues', value: ['webauthn', 'email'] },
            ],
            input: [{ name: 'IDToken1', value: '' }],
          }],
          header: 'Sign In',
          description: '',
        };
        jest.spyOn(FRAuth, 'next').mockImplementation(() => Promise.resolve(new FRStep(authDataWithAutocomplete)));

        const wrapper = setup();
        jest.spyOn(wrapper.vm, 'getRequestService').mockImplementation(() => ({ post: () => Promise.resolve({ data: { successURL: '/am/console' } }) }));
        await flushPromises();

        const frField = wrapper.find('.callback-component');
        // Check the autocomplete attribute
        expect(frField.attributes('autocomplete')).toBe('webauthn email');
      });

      it('Falls back to label lookup when autocompleteValues output is missing', async () => {
        const authDataMissingAutocomplete = {
          authId: '',
          callbacks: [{
            type: 'NameCallback',
            output: [
              { name: 'prompt', value: 'User Name' },
            ],
            input: [{ name: 'IDToken1', value: '' }],
          }],
          header: 'Sign In',
          description: '',
        };
        jest.spyOn(FRAuth, 'next').mockImplementation(() => Promise.resolve(new FRStep(authDataMissingAutocomplete)));

        const wrapper = setup();
        jest.spyOn(wrapper.vm, 'getRequestService').mockImplementation(() => ({ post: () => Promise.resolve({ data: { successURL: '/am/console' } }) }));
        await flushPromises();

        const frField = wrapper.find('.callback-component');
        // 'User Name' maps to 'username' in loginUtils.js
        expect(frField.attributes('autocomplete')).toBe('username');
      });

      it('Falls back to label lookup when autocompleteValues output is empty', async () => {
        const authDataEmptyAutocomplete = {
          authId: '',
          callbacks: [{
            type: 'NameCallback',
            output: [
              { name: 'prompt', value: 'User Name' },
              { name: 'autocompleteValues', value: [] },
            ],
            input: [{ name: 'IDToken1', value: '' }],
          }],
          header: 'Sign In',
          description: '',
        };
        jest.spyOn(FRAuth, 'next').mockImplementation(() => Promise.resolve(new FRStep(authDataEmptyAutocomplete)));

        const wrapper = setup();
        jest.spyOn(wrapper.vm, 'getRequestService').mockImplementation(() => ({ post: () => Promise.resolve({ data: { successURL: '/am/console' } }) }));
        await flushPromises();

        const frField = wrapper.find('.callback-component');
        // 'User Name' maps to 'username'
        expect(frField.attributes('autocomplete')).toBe('username');
      });
    });
  });
});
