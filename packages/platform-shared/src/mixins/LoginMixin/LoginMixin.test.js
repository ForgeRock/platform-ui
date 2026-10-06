/**
 * Copyright (c) 2021-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import axios from 'axios';
import { createI18n } from 'vue-i18n';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import * as i18n from '@/i18n';
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
        expect(PollingWaitCallbackProps).toEqual({ callbackSpecificProps: { hideSpinnerAndMessage: true }, listeners: ['next-step'] });
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
          listeners: ['next-step'],
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
          listeners: ['next-step'],
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
          listeners: ['next-step'],
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

    describe('PingOneRecognizeCallback', () => {
      const buildStep = (fields) => ({
        getCallbacksOfType: jest.fn().mockReturnValueOnce([{
          payload: { output: fields.map(([name, value]) => ({ name, value })) },
        }]),
      });

      it('passes operationId from webSDKOptions as operationID', async () => {
        const props = await wrapper.vm.getComponentPropsAndEvents('PingOneRecognizeCallback', null, [], '', buildStep([
          ['operationType', 'AUTHENTICATE'],
          ['authenticationServiceUrl', 'https://example.com/recognize'],
          ['customerName', 'acme'],
          ['username', 'user-1'],
          ['transactionData', 'tx-1'],
          ['generateClientState', false],
          ['webSDKOptions', { authorizationToken: 'tok', operationId: 'op-42' }],
        ]), null);

        expect(props.callbackSpecificProps.operationID).toBe('op-42');
        expect(props.callbackSpecificProps.seedEntropy).toBe(false);
      });

      it('passes generateClientState as seedEntropy', async () => {
        const props = await wrapper.vm.getComponentPropsAndEvents('PingOneRecognizeCallback', null, [], '', buildStep([
          ['operationType', 'ENROLL'],
          ['generateClientState', true],
          ['webSDKOptions', {}],
        ]), null);

        expect(props.callbackSpecificProps.seedEntropy).toBe(true);
        expect(props.callbackSpecificProps.operationID).toBeUndefined();
      });

      it('maps every callback output onto the component props', async () => {
        const props = await wrapper.vm.getComponentPropsAndEvents('PingOneRecognizeCallback', null, [], '', buildStep([
          ['operationType', 'ENROLL'],
          ['authenticationServiceUrl', 'https://example.com/recognize'],
          ['customerName', 'acme'],
          ['username', 'user-1'],
          ['transactionData', 'tx-1'],
          ['generateClientState', true],
          ['webSDKOptions', { operationId: 'op-7', lang: 'en' }],
        ]), null);

        expect(props.callbackSpecificProps.operationType).toBe('ENROLL');
        expect(props.callbackSpecificProps.serviceURL).toBe('https://example.com/recognize');
        expect(props.callbackSpecificProps.customerName).toBe('acme');
        expect(props.callbackSpecificProps.username).toBe('user-1');
        expect(props.callbackSpecificProps.transactionData).toBe('tx-1');
        expect(props.callbackSpecificProps.webSDKOptions).toEqual({ operationId: 'op-7', lang: 'en' });
        expect(props.listeners).toEqual(['hide-next-button', 'next-step']);
      });

      it('returns empty props when the callback is missing from the step', async () => {
        const emptyStep = { getCallbacksOfType: jest.fn().mockReturnValueOnce([]) };
        const props = await wrapper.vm.getComponentPropsAndEvents('PingOneRecognizeCallback', null, [], '', emptyStep, null);

        expect(props).toEqual({});
      });

      it('falls back to empty strings for absent outputs and keeps raw webSDKOptions', async () => {
        const props = await wrapper.vm.getComponentPropsAndEvents('PingOneRecognizeCallback', null, [], '', buildStep([
          ['operationType', 'AUTHENTICATE'],
          ['webSDKOptions', {}],
        ]), null);

        expect(props.callbackSpecificProps.serviceURL).toBe('');
        expect(props.callbackSpecificProps.customerName).toBe('');
        expect(props.callbackSpecificProps.username).toBe('');
        expect(props.callbackSpecificProps.transactionData).toBe('');
        expect(props.callbackSpecificProps.webSDKOptions).toEqual({});
        expect(props.callbackSpecificProps.operationID).toBeUndefined();
        expect(props.callbackSpecificProps.seedEntropy).toBe(false);
      });
    });
  });

  describe('getField', () => {
    const attributesMail = {
      common: {
        policyValidationMessages: {
          attributes: {
            mail: 'E-Mail-Adresse',
          },
        },
      },
    };

    // Snapshot the real app instance before any test swaps the module's
    // `default` export, so the afterEach restore below is not a self-assignment.
    const realI18n = i18n;

    function setupI18n(mockData) {
      i18n.default = createI18n({
        silentFallbackWarn: true,
        silentTranslationWarn: true,
        ...mockData,
      });
    }

    function attributeInputCallbackStub({ name = 'mail', prompt = 'Email Address', value = '' } = {}) {
      return {
        getType: jest.fn().mockReturnValue('StringAttributeInputCallback'),
        getName: jest.fn().mockReturnValue(name),
        getPrompt: jest.fn().mockReturnValue(prompt),
        getInputValue: jest.fn().mockReturnValue(value),
        getOutputByName: jest.fn().mockReturnValue(''),
      };
    }

    function nameCallbackStub({ prompt = 'User Name', value = '' } = {}) {
      return {
        getType: jest.fn().mockReturnValue('NameCallback'),
        getPrompt: jest.fn().mockReturnValue(prompt),
        getInputValue: jest.fn().mockReturnValue(value),
        getOutputByName: jest.fn().mockReturnValue(''),
      };
    }

    afterEach(() => {
      // Restore the snapshotted real app instance so other suites are unaffected
      i18n.default = realI18n;
    });

    it('resolves the label from the localized attributes map for a non-English locale and returns the raw prompt separately', () => {
      setupI18n({
        locale: 'de-DE',
        fallbackLocale: ['de', 'en'],
        messages: {
          'de-DE': attributesMail,
          en: { common: { policyValidationMessages: { attributes: { mail: 'Email' } } } },
        },
      });
      const callback = attributeInputCallbackStub();

      expect(wrapper.vm.getField(callback, 0)).toEqual({
        label: 'E-Mail-Adresse',
        callbackPrompt: 'Email Address',
        fieldType: 'string',
        name: 'callback_0',
        value: '',
        defaultText: '',
      });
    });

    it('returns the prompt as the label for the English locale, bit-identical to the pre-change output', () => {
      setupI18n({
        locale: 'en',
        fallbackLocale: 'en',
        messages: {
          en: { common: { policyValidationMessages: { attributes: { mail: 'Email' } } } },
        },
      });
      const callback = attributeInputCallbackStub();

      expect(wrapper.vm.getField(callback, 2)).toEqual({
        label: 'Email Address',
        callbackPrompt: 'Email Address',
        fieldType: 'string',
        name: 'callback_2',
        value: '',
        defaultText: '',
      });
    });

    it('returns the prompt as the label when no non-English locale in the chain has the attributes entry', () => {
      setupI18n({
        locale: 'cs',
        fallbackLocale: ['en'],
        messages: {
          cs: {},
          en: { common: { policyValidationMessages: { attributes: { mail: 'Email' } } } },
        },
      });
      const callback = attributeInputCallbackStub();

      expect(wrapper.vm.getField(callback, 0).label).toBe('Email Address');
    });

    it('returns the prompt as the label for a callback without getName, in a non-English locale', () => {
      setupI18n({
        locale: 'de-DE',
        fallbackLocale: ['de', 'en'],
        messages: {
          'de-DE': attributesMail,
        },
      });
      const callback = nameCallbackStub();

      const field = wrapper.vm.getField(callback, 1);
      expect(field.label).toBe('User Name');
      expect(field.callbackPrompt).toBe('User Name');
      expect(field.fieldType).toBe('string');
    });

    it('returns the prompt as the label for a callback without getName in the English locale', () => {
      setupI18n({
        locale: 'en',
        messages: {
          en: { common: { policyValidationMessages: { attributes: { mail: 'Email' } } } },
        },
      });
      const callback = nameCallbackStub();

      const field = wrapper.vm.getField(callback, 1);
      expect(field.label).toBe('User Name');
      expect(field.callbackPrompt).toBe('User Name');
    });

    it('derives the label from getOutputByName when getPrompt is absent, without consulting the localized attributes map', () => {
      // The { value } wrapper models the pre-journey-client output shape the
      // legacy getField branch reads via .value; the current SDK's
      // getOutputByName returns the unwrapped value (see translations.js).
      // Do not "fix" translations.js to match this mock.
      setupI18n({
        locale: 'de-DE',
        fallbackLocale: ['de', 'en'],
        messages: {
          'de-DE': attributesMail,
        },
      });
      const callback = {
        getType: jest.fn().mockReturnValue('NameCallback'),
        getInputValue: jest.fn().mockReturnValue(''),
        getOutputByName: jest.fn().mockImplementation((outputName) => {
          if (outputName === 'prompt') {
            return { value: 'Email Address' };
          }
          return '';
        }),
      };

      const field = wrapper.vm.getField(callback, 0);
      expect(field.label).toBe('Email Address');
      expect(field.callbackPrompt).toBe('Email Address');
    });

    it('sets fieldType to password for a PasswordCallback and number for a NumberAttributeInputCallback', () => {
      setupI18n({
        locale: 'de-DE',
        fallbackLocale: ['de', 'en'],
        messages: {
          'de-DE': attributesMail,
        },
      });

      const passwordCallback = nameCallbackStub({ prompt: 'Password' });
      passwordCallback.getType = jest.fn().mockReturnValue('PasswordCallback');
      expect(wrapper.vm.getField(passwordCallback, 0).fieldType).toBe('password');

      const numberCallback = attributeInputCallbackStub({ name: 'phone', prompt: 'Phone Number' });
      numberCallback.getType = jest.fn().mockReturnValue('NumberAttributeInputCallback');
      expect(wrapper.vm.getField(numberCallback, 1).fieldType).toBe('number');
    });
  });
});
