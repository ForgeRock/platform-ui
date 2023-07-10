/**
 * Copyright (c) 2021-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import LoginMixin from './index';

let wrapper;

describe('LoginMixin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    wrapper = shallowMount({}, {
      render() {},
      mixins: [LoginMixin],
      mocks: { $t: (id) => id },
    });
  });
  // Many methods in this mixin do not require unit testing:
  // getIdFromSession, getUserInfo, getConfigurationInfo,
  // getCurrentQueryString, parseParameters
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
            stage: undefined,
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
            stage: undefined,
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
