/**
 * Copyright (c) 2021-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, shallowMount } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import flushPromises from 'flush-promises';
import LoginMixin from '@forgerock/platform-shared/src/mixins/LoginMixin';
import { URLSearchParams } from 'url';
import * as urlUtil from '../../utils/urlUtil';
import * as authResumptionUtil from '../../utils/authResumptionUtil';
import i18n from '@/i18n';
import Login from './index';

describe('Login.vue', () => {
  let wrapper;
  const $route = {
    params: {
      tree: undefined,
    },
  };

  beforeEach(() => {
    wrapper = shallowMount(Login, {
      i18n,
      stubs: {
        'router-link': true,
      },
      mocks: {
        $route,
        $t: () => { },
        $store: {
          state: {
            SharedStore: {
              webStorageAvailable: true,
            },
          },
        },
      },
      methods: {
        nextStep() { },
      },
    });
  });

  afterAll(() => {
    jest.resetAllMocks();
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

  describe('handleIdpComponent', () => {
    describe('given idp component ', () => {
      it('should remove idp component from componentsList to the `idpComponent` field', () => {
        const componentList = [
          {
            callback: {
              payload: {
                type: 'NameCallback',
              },
            },
          },
          {
            callback: {
              payload: {
                type: 'SelectIdPCallback',
              },
            },
          },
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
        expect(wrapper.vm.idpComponent).toStrictEqual({
          callback: {
            payload: {
              type: 'SelectIdPCallback',
            },
          },
        });
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

    const mountMethods = {
      nextStep() {
        this.loading = false;
        this.themeLoading = false;
      },
      redirectIfInactive() { },
      setRealm() { },
      getConfigurationInfo() {
        return Promise.resolve();
      },
      evaluateUrlParams() { },
      checkNewSession() {
        return Promise.resolve();
      },
    };

    const setUrl = (url) => {
      // eslint-disable-next-line no-global-assign
      delete window.location;
      window.location = new URL(url);
    };

    const mountLogin = ({ methods }) => mount(Login, {
      i18n,
      stubs: {
        'router-link': true,
      },
      methods,
      mocks: {
        $route: {
          params: {
            tree: undefined,
          },
        },
        $t: () => { },
        $store: {
          state: {
            SharedStore: {
              webStorageAvailable: true,
            },
          },
        },
      },
      mixins: [LoginMixin],
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
      const mockMethods = {
        ...mountMethods,
      };
      delete mockMethods.evaluateUrlParams;

      setUrl('https://forgerock.io/login/?realm=/&code=aCode');

      // indicate that the tree is being resumed following a redirect
      const resumingSpy = jest.spyOn(authResumptionUtil, 'resumingTreeFollowingRedirect').mockReturnValue(true);
      const getStepSpy = jest.spyOn(authResumptionUtil, 'getResumeDataFromStorageAndClear').mockReturnValue({ urlAtRedirect: 'blah', step: { payload: {} } });

      const wrapper = await mountLogin({
        methods: mockMethods,
      });
      await flushPromises();

      expect(replaceState).toBeCalledWith(null, null, '?realm=/');
      expect(findByTestId(wrapper, 'callbacks_panel').exists()).toBeTruthy();

      resumingSpy.mockRestore();
      getStepSpy.mockRestore();
    });

    it('Leaves tree resumption query paramters in place when not returning from a redirect', async () => {
      const mockMethods = {
        ...mountMethods,
      };
      delete mockMethods.evaluateUrlParams;

      setUrl('https://forgerock.io/login/?realm=/&code=aCode&notRemoved=here');

      // indicate that the tree is being resumed following a redirect
      const resumingSpy = jest.spyOn(authResumptionUtil, 'resumingTreeFollowingRedirect').mockReturnValue(false);

      const wrapper = await mountLogin({
        methods: mockMethods,
      });
      await flushPromises();

      expect(replaceState).toBeCalledWith(null, null, '?realm=/&code=aCode&notRemoved=here');
      expect(findByTestId(wrapper, 'callbacks_panel').exists()).toBeTruthy();

      resumingSpy.mockRestore();
    });
  });
});
