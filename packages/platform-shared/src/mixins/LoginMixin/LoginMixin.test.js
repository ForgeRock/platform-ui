/**
 * Copyright (c) 2021-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import axios from 'axios';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import LoginMixin from './index';

let wrapper;

describe('LoginMixin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    wrapper = shallowMount({}, {
      render() {},
      global: {
        mixins: [LoginMixin, RestMixin],
        mocks: { $t: (id) => id },
      },
    });
  });
  // Many methods in this mixin do not require unit testing:
  // getIdFromSession, getUserInfo, getConfigurationInfo,
  // Or are constructed in a way that makes unit testing undesirable:
  // verifyGotoUrlAndRedirect
  it('Checks for a default path', () => {
    const isDefault = wrapper.vm.isDefaultPath('/am/console');
    const isNotDefault = wrapper.vm.isDefaultPath('/am/foo');
    expect(isDefault).toBeTruthy();
    expect(isNotDefault).toBeFalsy();
  });

  it('checks for a SAML url', () => {
    const isSaml = wrapper.vm.isSamlURL('http://fr.com/Consumer/metaAlias');
    const isNotSaml = wrapper.vm.isSamlURL('http://fr.com/foo');
    expect(isSaml).toBeTruthy();
    expect(isNotSaml).toBeFalsy();
  });

  describe('validateGoto endpoint envocation variations', () => {
    const url = 'http://www.google.com';
    const urlParamPayload = JSON.stringify({ goto: url });

    delete window.location;
    window.location = new URL('https://my-tenant.com/am/XUI/?realm=/alpha&noSession=true&ForceAuth=true&authIndexType=service&authIndexValue=UpdatePassword&gotoOnFail=%2Flogin&goto=https%3A%2F%2Fwww.my-tenant-url.com%2Fenduser%2F%3Frealm%3Dalpha%23%2Fprofile#/');

    const urlParams = new URLSearchParams(window.location.search);
    const gotoParam = urlParams.get('goto');
    const gotoPayload = JSON.stringify({ goto: gotoParam });
    const gotoOnFailParam = urlParams.get('gotoOnFail');
    const gotoOnFailPayload = JSON.stringify({ goto: gotoOnFailParam });

    describe('environment variable, VUE_APP_ALIGN_GOTO_PRECEDENCE, is set to true', () => {
      it('sets the validateGoto payload with the url function param if the isGotoOnFail function param is false', async () => {
        process.env.VUE_APP_ALIGN_GOTO_PRECEDENCE = 'true';
        const instance = axios.create({ baseURL: 'http://forgerock.com' });
        instance.post.mockImplementationOnce(() => Promise.resolve({ data: { successURL: url } }));
        // isGotoOnFail argument not passed so defaults to false
        await wrapper.vm.verifyGotoUrlAndRedirect(url, 'alpha');
        expect(instance.post).toHaveBeenCalledWith('/users?_action=validateGoto', urlParamPayload, { withCredentials: true });
      });

      it('sets the validateGoto payload with the gotoOnFail url param if the isGotoOnFail function param is true', async () => {
        process.env.VUE_APP_ALIGN_GOTO_PRECEDENCE = 'true';
        const instance = axios.create({ baseURL: 'http://forgerock.com' });
        instance.post.mockImplementationOnce(() => Promise.resolve({ data: { successURL: gotoOnFailParam } }));
        // isGotoOnFail function param is last argument
        await wrapper.vm.verifyGotoUrlAndRedirect(url, 'alpha', false, true);
        expect(instance.post).toHaveBeenCalledWith('/users?_action=validateGoto', gotoOnFailPayload, { withCredentials: true });
      });
    });

    describe('environment variable, VUE_APP_ALIGN_GOTO_PRECEDENCE, is set to false', () => {
      it('sets the validateGoto payload with the goto url param if the isGotoOnFail function param is false', async () => {
        process.env.VUE_APP_ALIGN_GOTO_PRECEDENCE = 'false';
        const instance = axios.create({ baseURL: 'http://forgerock.com' });
        instance.post.mockImplementationOnce(() => Promise.resolve({ data: { successURL: gotoParam } }));
        // isGotoOnFail argument not passed so defaults to false
        await wrapper.vm.verifyGotoUrlAndRedirect(url, 'alpha');
        expect(instance.post).toHaveBeenCalledWith('/users?_action=validateGoto', gotoPayload, { withCredentials: true });
      });

      it('sets the validateGoto payload with the gotoOnFail url param if the isGotoOnFail function param is true', async () => {
        process.env.VUE_APP_ALIGN_GOTO_PRECEDENCE = 'false';
        const instance = axios.create({ baseURL: 'http://forgerock.com' });
        instance.post.mockImplementationOnce(() => Promise.resolve({ data: { successURL: gotoParam } }));
        // isGotoOnFail function param is last argument
        await wrapper.vm.verifyGotoUrlAndRedirect(url, 'alpha', false, true);
        expect(instance.post).toHaveBeenCalledWith('/users?_action=validateGoto', gotoOnFailPayload, { withCredentials: true });
      });

      it('sets the validateGoto payload with the url function param if the isGotoOnFail function param is false and the goto url param does not exist', async () => {
        process.env.VUE_APP_ALIGN_GOTO_PRECEDENCE = 'false';
        // set new url with no goto url param
        window.location = new URL('https://my-tenant.com/am/XUI/?realm=/alpha&noSession=true&ForceAuth=true&authIndexType=service&authIndexValue=UpdatePassword&gotoOnFail=%2Flogin');
        const instance = axios.create({ baseURL: 'http://forgerock.com' });
        instance.post.mockImplementationOnce(() => Promise.resolve({ data: { successURL: gotoParam } }));
        // isGotoOnFail argument not passed so defaults to false
        await wrapper.vm.verifyGotoUrlAndRedirect(url, 'alpha');
        expect(instance.post).toHaveBeenCalledWith('/users?_action=validateGoto', urlParamPayload, { withCredentials: true });
      });
    });
  });

  describe('getComponentPropsAndEvents', () => {
    describe('PollingWaitCallback', () => {
      it('sets PollingWaitCallback callbackSpecificProps to hide the callback content when the current stage is showing pushChallengeNumber', async () => {
        const componentType = 'PollingWaitCallback';
        const callBackIndex = null;
        const componentList = [];
        const currentStage = '';
        const currentStep = {
          getCallbacksOfType: jest.fn().mockReturnValueOnce([
            {
              getInputValue: jest.fn().mockReturnValue('pushChallengeNumber'),
            },
          ]),
        };
        const realm = null;

        const PollingWaitCallbackProps = await wrapper.vm.getComponentPropsAndEvents(componentType, callBackIndex, componentList, currentStage, currentStep, realm);
        expect(PollingWaitCallbackProps).toEqual({ callbackSpecificProps: { hideSpinnerAndMessage: true } });
      });
      it('does not set callbackSpecificProps to hide the callback content when the current stage is not showing pushChallengeNumber', async () => {
        const componentType = 'PollingWaitCallback';
        const callBackIndex = null;
        const componentList = [];
        const currentStage = '';
        const currentStep = {
          getCallbacksOfType: jest.fn().mockReturnValueOnce([
            {
              getInputValue: jest.fn().mockReturnValue('otherValue'),
            },
          ]),
        };
        const realm = null;

        const PollingWaitCallbackProps = await wrapper.vm.getComponentPropsAndEvents(componentType, callBackIndex, componentList, currentStage, currentStep, realm);
        expect(PollingWaitCallbackProps).toEqual({
          callbackSpecificProps: {
            hideSpinnerAndMessage: false,
          },
        });
      });
    });
    describe('ConfirmationCallback', () => {
      it('sets ConfirmationCallback callbackSpecificProps to display link variant when the current stage is showing pushChallengeNumber', async () => {
        const componentType = 'ConfirmationCallback';
        const callBackIndex = null;
        const componentList = [];
        const currentStage = {};
        const currentStep = {
          getCallbacksOfType: jest.fn().mockReturnValueOnce([
            {
              getInputValue: jest.fn().mockReturnValue('pushChallengeNumber'),
            },
          ]),
        };
        const realm = null;

        const ConfirmationCallbackProps = await wrapper.vm.getComponentPropsAndEvents(componentType, callBackIndex, componentList, currentStage, currentStep, realm);
        expect(ConfirmationCallbackProps).toEqual({
          callbackSpecificProps: {
            stage: {},
            variant: 'link',
          },
        });
      });
      it('sets ConfirmationCallback callbackSpecificProps to display primary variant when the current stage is not showing pushChallengeNumber', async () => {
        const componentType = 'ConfirmationCallback';
        const callBackIndex = null;
        const componentList = [];
        const currentStage = {};
        const currentStep = {
          getCallbacksOfType: jest.fn().mockReturnValueOnce([
            {
              getInputValue: jest.fn().mockReturnValue('otherValue'),
            },
          ]),
        };
        const realm = null;

        const ConfirmationCallbackCallbackProps = await wrapper.vm.getComponentPropsAndEvents(componentType, callBackIndex, componentList, currentStage, currentStep, realm);
        expect(ConfirmationCallbackCallbackProps).toEqual({
          callbackSpecificProps: {
            stage: {},
            variant: 'primary',
          },
        });
      });
    });
    describe('PushChallengeNumber', () => {
      it('sets PushChallengeNumber callbackSpecificProps to show a push message when the current stage is showing pushChallengeNumber', async () => {
        const componentType = 'PushChallengeNumber';
        const callBackIndex = null;
        const componentList = [];
        const currentStage = {};
        const currentStep = {
          getCallbacksOfType: jest.fn().mockReturnValueOnce([
            {
              getMessage: jest.fn().mockReturnValue('Tap this number'),
            },
          ]),
        };
        const realm = null;
        const PushChallengeNumberProps = await wrapper.vm.getComponentPropsAndEvents(componentType, callBackIndex, componentList, currentStage, currentStep, realm);
        expect(PushChallengeNumberProps).toEqual({
          callbackSpecificProps: {
            pushMessage: 'Tap this number',
          },
        });
      });
    });
  });
});
