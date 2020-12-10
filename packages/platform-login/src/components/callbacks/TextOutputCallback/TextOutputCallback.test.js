/**
 * @license
 * Copyright (c) 2020 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import TextOutputCallback from '@/components/callbacks/TextOutputCallback';
import i18n from '@/i18n';

describe('TextOutputCallback.vue', () => {
  let wrapper;
  let mountComponent;

  beforeEach(() => {
    wrapper = undefined;
    mountComponent = ({ messageType, message, mockMethods }) => {
      const step = {
        getCallbacksOfType: jest.fn(),
        find: jest.fn(),
        setInputValue: jest.fn(),
      };
      step.getCallbacksOfType.mockReturnValue(step);
      step.find.mockReturnValue(step);

      const propsData = {
        callback: {
          getMessageType: () => messageType || 4,
          getMessage: () => message || '',
        },
        index: 5,
        step,
      };
      wrapper = mount(TextOutputCallback, {
        i18n,
        propsData,
        methods: mockMethods || {},
      });
    };
  });

  it('Load TextOutputCallback component', () => {
    mountComponent({ messageType: '1' });
    expect(wrapper.name()).toEqual('TextOutputCallback');
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
    const mockMethods = {
      invokeScriptWithHelpers: jest.fn(),
    };
    mountComponent({ messageType: '4', mockMethods });

    const emittedFunction = wrapper.emitted()['has-scripts'].pop()[0];

    expect(emittedFunction).toEqual(expect.any(Function));

    emittedFunction();

    expect(mockMethods.invokeScriptWithHelpers).toHaveBeenCalled();
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
    const mockMethods = {
      setHiddenCallback: jest.fn(),
    };
    mountComponent({ messageType: '4', message: messageScript, mockMethods });

    const emittedFunction = wrapper.emitted()['has-scripts'].pop()[0];
    emittedFunction();

    expect(window.APIs).toBeDefined();
    expect(window.APIs.loginHelpers).toBeDefined();

    expect(window.APIs.loginHelpers.disableNextButton).toBeDefined();
    expect(window.APIs.loginHelpers.disableNextButton(true)).toBeUndefined();
    expect(wrapper.emitted()['disable-next-button'].pop()).toEqual([true, 5]);

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
    expect(mockMethods.setHiddenCallback).toHaveBeenCalledWith('callbackName', 'callbackValue');
  });

  it('Mounts QRCodeReader on window', () => {
    mountComponent({ messageType: '4' });

    wrapper.vm.setHiddenCallback('callbackName', 'callbackValue');

    expect(wrapper.vm.$props.step.getCallbacksOfType).toHaveBeenCalledWith('HiddenValueCallback');
    expect(wrapper.vm.$props.step.setInputValue).toHaveBeenCalledWith('callbackValue');
  });
});
