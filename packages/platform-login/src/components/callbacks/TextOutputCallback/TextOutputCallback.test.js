/**
 * Copyright (c) 2020-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { sanitize } from '@forgerock/platform-shared/src/utils/sanitizerConfig';
import TextOutputCallback from '@/components/callbacks/TextOutputCallback';
import i18n from '@/i18n';

describe('TextOutputCallback.vue', () => {
  let wrapper;
  let mountComponent;

  beforeEach(() => {
    wrapper = undefined;
    mountComponent = ({
      messageType, message, isFirstRenderedCallback,
    }) => {
      const step = {
        getCallbacksOfType: jest.fn(),
        find: jest.fn(),
        setInputValue: jest.fn(),
      };
      step.getCallbacksOfType.mockReturnValue(step);
      step.find.mockReturnValue(step);

      const props = {
        callback: {
          getMessageType: () => messageType || 4,
          getMessage: () => message || '',
        },
        index: 5,
        step,
        isFirstRenderedCallback: isFirstRenderedCallback || false,
      };
      wrapper = mount(TextOutputCallback, {
        global: {
          plugins: [i18n],
          mocks: {
            $sanitize: () => sanitize(message),
          },
        },
        props,
      });
    };
  });

  it('Emits updateScreenReaderMessage if its type Error and isFirstRenderedCallback is true', () => {
    mountComponent({ messageType: '2', isFirstRenderedCallback: true, message: 'this was emitted' });

    const emitted = wrapper.emitted()['update-screen-reader-message'].pop();
    expect(emitted).toEqual(['ERROR', 'this was emitted']);
  });

  it('Emits updateScreenReaderMessage if its type Error and isFirstRenderedCallback is false', () => {
    mountComponent({ messageType: '2', isFirstRenderedCallback: false, message: 'this was emitted' });

    expect(wrapper.emitted()['update-screen-reader-message']).toBeFalsy();
  });

  it('Emits updateScreenReaderMessage if its type Information and isFirstRenderedCallback is true', () => {
    mountComponent({ messageType: '3', isFirstRenderedCallback: true, message: 'this was emitted' });

    const emitted = wrapper.emitted()['update-screen-reader-message'].pop();
    expect(emitted).toEqual(['INFORMATION', 'this was emitted']);
  });

  it('Doesn\'t emit updateScreenReaderMessage if its type Information and isFirstRenderedCallback is false', () => {
    mountComponent({ messageType: '3', isFirstRenderedCallback: false, message: 'this was emitted' });

    expect(wrapper.emitted()['update-screen-reader-message']).toBeFalsy();
  });

  it('Doesn\'t emit updateScreenReaderMessage type isn\'t Information regardless of isFirstRenderedCallback', () => {
    mountComponent({ messageType: '4', isFirstRenderedCallback: true, message: 'this was emitted' });

    expect(wrapper.emitted()['update-screen-reader-message']).toBeFalsy();
  });

  it('Sets data messageType base on getMessageType', () => {
    mountComponent({ messageType: '1' });
    expect(wrapper.vm.$data.messageType).toBe('WARNING');

    mountComponent({ messageType: '2' });
    expect(wrapper.vm.$data.messageType).toBe('ERROR');

    mountComponent({ messageType: '3' });
    expect(wrapper.vm.$data.messageType).toBe('INFORMATION');

    mountComponent({ messageType: '4' });
    expect(wrapper.vm.$data.messageType).toBe('SCRIPT');
  });

  it('It handles scripts by emit event and invoking', () => {
    mountComponent({ messageType: '4' });

    const emittedFunction = wrapper.emitted()['has-scripts'].pop()[0];

    expect(emittedFunction).toEqual(expect.any(Function));

    emittedFunction();

    expect(wrapper.emitted('has-scripts')).toEqual([]);
  });

  it('Mounts QRCodeReader on window', () => {
    mountComponent({ messageType: '4' });

    const emittedFunction = wrapper.emitted()['has-scripts'].pop()[0];
    emittedFunction();

    expect(window.QRCodeReader).toBeDefined();
    expect(window.QRCodeReader.createCode).toBeDefined();
  });

  it('Makes APIs accessible to backend script - API is one way (no returns)', () => {
    const messageScript = `
      window.APIs = {
        loginHelpers
      };`;
    mountComponent({ messageType: '4', message: messageScript });
    const setHiddenCallbackSpy = jest.spyOn(wrapper.vm, 'setHiddenCallback');
    const getTranslationSpy = jest.spyOn(wrapper.vm, 'getTranslation');

    const emittedFunction = wrapper.emitted()['has-scripts'].pop()[0];
    emittedFunction();

    expect(window.APIs).toBeDefined();
    expect(window.APIs.loginHelpers).toBeDefined();

    expect(window.APIs.loginHelpers.disableNextButton).toBeDefined();
    expect(window.APIs.loginHelpers.disableNextButton(true)).toBeUndefined();
    expect(wrapper.emitted()['disable-next-button'].pop()).toEqual([true]);

    expect(window.APIs.loginHelpers.hideNextButton).toBeDefined();
    expect(window.APIs.loginHelpers.hideNextButton(true)).toBeUndefined();
    expect(wrapper.emitted()['hide-next-button'].pop()).toEqual([true]);

    expect(window.APIs.loginHelpers.nextStep).toBeDefined();
    expect(window.APIs.loginHelpers.nextStep('no param')).toBeUndefined();
    expect(wrapper.emitted()['next-step'].pop()).toEqual([]);

    expect(window.APIs.loginHelpers.nextStepCallback).toBeDefined();
    expect(window.APIs.loginHelpers.nextStepCallback(() => {})).toBeUndefined();
    expect(wrapper.emitted()['next-step-callback'].pop()).toEqual([expect.any(Function)]);

    expect(window.APIs.loginHelpers.setHiddenCallback).toBeDefined();
    expect(window.APIs.loginHelpers.setHiddenCallback('callbackName', 'callbackValue')).toBeUndefined();
    expect(setHiddenCallbackSpy).toHaveBeenCalledWith('callbackName', 'callbackValue');

    expect(window.APIs.loginHelpers.getTranslation).toBeDefined();
    expect(window.APIs.loginHelpers.getTranslation('anyOldText')).toEqual('anyOldText');
    expect(getTranslationSpy).toHaveBeenCalledWith('anyOldText');
  });

  it('Mounts QRCodeReader on window', () => {
    mountComponent({ messageType: '4' });

    wrapper.vm.setHiddenCallback('callbackName', 'callbackValue');

    expect(wrapper.vm.$props.step.getCallbacksOfType).toHaveBeenCalledWith('HiddenValueCallback');
    expect(wrapper.vm.$props.step.setInputValue).toHaveBeenCalledWith('callbackValue');
  });
});
