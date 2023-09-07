/**
 * Copyright (c) 2021-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, shallowMount, flushPromises } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import { sanitize } from '@forgerock/platform-shared/src/utils/sanitizerConfig';
import { URLSearchParams } from 'url';
import {
  FRStep,
} from '@forgerock/javascript-sdk';
import * as urlUtil from '../../utils/urlUtil';
import * as authResumptionUtil from '../../utils/authResumptionUtil';
import Login from './index';

const LoginMixin = {
  methods: {
    getConfigurationInfo: () => Promise.resolve({ data: { realm: '/' } }),
  },
};

describe('Login.vue', () => {
  let wrapper;
  const $route = {
    params: {
      tree: undefined,
    },
  };

  beforeEach(() => {
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
    expect(wrapper.vm.getAlternateFieldType(['VALID_DATE_TIME_FORMAT'])).toEqual('datetime');
    expect(wrapper.vm.getAlternateFieldType(['VALID_DATE'])).toEqual('date');
    expect(wrapper.vm.getAlternateFieldType(['VALID_DATE_FORMAT'])).toEqual('date');
    expect(wrapper.vm.getAlternateFieldType(['VALID_TIME_FORMAT'])).toEqual('time');
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
});

describe('Component Test', () => {
  describe('Loads login callback components with extra query parameters in the URL', () => {
    const originalWindow = window;
    global.URLSearchParams = URLSearchParams;

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

    const setUrl = (url) => {
      delete window.location;
      window.location = new URL(url);
    };

    const mountLogin = () => mount(Login, {
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
          $t: () => {},
          $store: {
            state: {
              SharedStore: {
                webStorageAvailable: true,
              },
            },
          },
          $sanitize: (message, config) => sanitize(message, config),
        },
        mixins: [LoginMixin],
      },
    });

    let replaceState;

    beforeAll(() => {
      jest.restoreAllMocks();
    });

    beforeEach(() => {
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

      const wrapper = mountLogin();
      await flushPromises();

      expect(replaceState).toBeCalledWith(null, null, '?realm=/');
      expect(findByTestId(wrapper, 'callbacks_panel').exists()).toBeTruthy();

      resumingSpy.mockRestore();
      getStepSpy.mockRestore();
    });

    it('Leaves tree resumption query parameters in place when not returning from a redirect', async () => {
      setUrl('https://forgerock.io/login/?realm=/&code=aCode&notRemoved=here');

      // indicate that the tree is being resumed following a redirect
      const resumingSpy = jest.spyOn(authResumptionUtil, 'resumingTreeFollowingRedirect').mockReturnValue(false);

      const wrapper = mountLogin();
      await flushPromises();

      expect(replaceState).toBeCalledWith(null, null, '?realm=/&code=aCode&notRemoved=here');
      expect(findByTestId(wrapper, 'callbacks_panel').exists()).toBeTruthy();

      resumingSpy.mockRestore();
    });

    it('focuses on the first input if journeyFocusFirstFocusableItemEnabled is true', async () => {
      const data = {
        loading: true,
        step: new FRStep(stepPayload),
      };

      const wrapper = mountLogin();
      await flushPromises();

      await wrapper.setData(data);
      await flushPromises();

      wrapper.vm.buildTreeForm();
      await flushPromises();

      expect(wrapper.vm.componentList[0].callbackSpecificProps.autofocus).toBeFalsy();
      expect(wrapper.vm.componentList[1].callbackSpecificProps.autofocus).toBeFalsy();

      await wrapper.setData(data);
      await flushPromises();

      wrapper.vm.step = new FRStep(stepPayload);
      await wrapper.setProps({ journeyFocusFirstFocusableItemEnabled: true });
      await flushPromises();

      expect(wrapper.vm.componentList[0].callbackSpecificProps.autofocus).toBeTruthy();
      expect(wrapper.vm.componentList[1].callbackSpecificProps.autofocus).toBeFalsy();
    });
  });
});
