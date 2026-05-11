/**
 * Copyright (c) 2020-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { sanitize } from '@forgerock/platform-shared/src/utils/sanitizerConfig';
import TextOutputCallback from '@/components/callbacks/TextOutputCallback';
import i18n from '@/i18n';

describe('TextOutputCallback.vue', () => {
  const callBackIndex = 5;
  const defaultProps = {
    callback: {
      getMessageType: () => '4',
      getMessage: () => '',
    },
    index: callBackIndex,
    step: {
      getCallbacksOfType: jest.fn().mockReturnThis(),
      find: jest.fn().mockReturnThis(),
      setInputValue: jest.fn(),
    },
    isFirstRenderedCallback: false,
    isMfaRegistrationStep: false,
  };

  function setup(props = {}) {
    return mount(TextOutputCallback, {
      global: {
        plugins: [i18n],
        mocks: {
          $sanitize: (message) => sanitize(message),
        },
      },
      props: {
        ...defaultProps,
        ...props,
      },
    });
  }

  let wrapper;
  let mountComponent;

  beforeEach(() => {
    wrapper = undefined;
    mountComponent = ({
      messageType, message, isFirstRenderedCallback, isMfaRegistrationStep, hideTextOutput,
    }) => {
      wrapper = setup({
        callback: {
          getMessageType: () => messageType || '4',
          getMessage: () => message || '',
        },
        hideTextOutput,
        isFirstRenderedCallback: isFirstRenderedCallback !== undefined ? isFirstRenderedCallback : false,
        isMfaRegistrationStep: isMfaRegistrationStep !== undefined ? isMfaRegistrationStep : false,
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

  describe('multiline message rendering', () => {
    // isFirstRenderedCallback is always false here: this block tests the CSS class discriminator
    // only. Using isFirstRenderedCallback=true would trigger aria-hidden / live-region logic that
    // is unrelated to the white-space-pre-line behaviour being verified (those paths are covered
    // in the 'interactive message accessibility behavior' describe block below).
    async function mountMessage(messageType, message) {
      mountComponent({
        messageType,
        message,
        isFirstRenderedCallback: false,
        isMfaRegistrationStep: false,
      });
      await flushPromises();
    }

    // Note: white-space-pre-line class preserves newlines in messages (IAM-9916)
    it('preserves newlines for INFORMATION messages', async () => {
      await mountMessage('0', 'line one\nline two');

      const messageElement = wrapper.find('.text-muted.white-space-pre-line');
      expect(messageElement.exists()).toBe(true);
      expect(messageElement.classes()).toContain('white-space-pre-line');
      expect(wrapper.vm.sanitizedMessage).toContain('\n');
    });

    it('preserves newlines for WARNING messages', async () => {
      await mountMessage('1', 'line one\nline two');

      const alertElement = wrapper.find('.alert-warning.white-space-pre-line');
      expect(alertElement.exists()).toBe(true);
      expect(alertElement.classes()).toContain('white-space-pre-line');
      expect(wrapper.vm.sanitizedMessage).toContain('\n');
    });

    it('preserves newlines for ERROR messages', async () => {
      await mountMessage('2', 'line one\nline two');

      const alertElement = wrapper.find('.alert-danger.white-space-pre-line');
      expect(alertElement.exists()).toBe(true);
      expect(alertElement.classes()).toContain('white-space-pre-line');
      expect(wrapper.vm.sanitizedMessage).toContain('\n');
    });

    // Content-type discriminator: `white-space-pre-line` must be omitted when
    // the sanitized message contains HTML elements, so customer journeys that
    // pass custom HTML render as authored (pre-IAM-9916 behaviour).
    it('omits white-space-pre-line for INFORMATION messages containing HTML with inter-tag newlines', async () => {
      await mountMessage('0', '<a href="#">A</a>\n|\n<a href="#">B</a>');

      const messageElement = wrapper.find('.text-muted');
      expect(messageElement.exists()).toBe(true);
      expect(messageElement.classes()).not.toContain('white-space-pre-line');
    });

    it('omits white-space-pre-line for WARNING messages containing HTML', async () => {
      await mountMessage('1', '<a href="https://example.com">Review warning details</a>');

      const messageElement = wrapper.find('.alert-warning');
      expect(messageElement.exists()).toBe(true);
      expect(messageElement.classes()).not.toContain('white-space-pre-line');
    });

    it('omits white-space-pre-line for ERROR messages containing HTML', async () => {
      await mountMessage('2', '<a href="https://example.com">See details</a>');

      const messageElement = wrapper.find('.alert-danger');
      expect(messageElement.exists()).toBe(true);
      expect(messageElement.classes()).not.toContain('white-space-pre-line');
    });

    it('applies white-space-pre-line for INFORMATION messages containing a br tag (br is preceded by a text node so content is treated as plain text; the visual break is produced by the br element independently of white-space-pre-line)', async () => {
      await mountMessage('0', 'line1<br>line2');

      const messageElement = wrapper.find('.text-muted');
      expect(messageElement.exists()).toBe(true);
      expect(messageElement.classes()).toContain('white-space-pre-line');
    });

    it('preserves newlines for INFORMATION messages containing mixed plain text and inline HTML (e.g. plain text before a strong tag)', async () => {
      await mountMessage('0', 'Your email: test@example.com\nYour <strong>phone</strong>: 123');

      const messageElement = wrapper.find('.text-muted.white-space-pre-line');
      expect(messageElement.exists()).toBe(true);
      expect(messageElement.classes()).toContain('white-space-pre-line');
    });

    it('applies white-space-pre-line for INFORMATION messages that contain only HTML entities (entity-only content is plain text)', async () => {
      await mountMessage('0', 'A &amp; B');

      const messageElement = wrapper.find('.text-muted');
      expect(messageElement.exists()).toBe(true);
      expect(messageElement.classes()).toContain('white-space-pre-line');
    });

    it('applies white-space-pre-line for INFORMATION messages that are empty or whitespace-only and does not throw', async () => {
      expect(() => mountComponent({
        messageType: '0',
        message: '',
        isFirstRenderedCallback: false,
        isMfaRegistrationStep: false,
      })).not.toThrow();

      await flushPromises();

      let messageElement = wrapper.find('.text-muted');
      expect(messageElement.exists()).toBe(true);
      expect(messageElement.classes()).toContain('white-space-pre-line');

      expect(() => mountComponent({
        messageType: '0',
        message: '   ',
        isFirstRenderedCallback: false,
        isMfaRegistrationStep: false,
      })).not.toThrow();

      await flushPromises();

      messageElement = wrapper.find('.text-muted');
      expect(messageElement.exists()).toBe(true);
      expect(messageElement.classes()).toContain('white-space-pre-line');
    });

    it('omits white-space-pre-line for INFORMATION messages containing HTML with no newlines (locks in the discriminator)', async () => {
      await mountMessage('0', '<a href="#">link</a>');

      const messageElement = wrapper.find('.text-muted');
      expect(messageElement.exists()).toBe(true);
      expect(messageElement.classes()).not.toContain('white-space-pre-line');
    });
  });

  describe('Sets aria-labelledby to "message"', () => {
    it('for INFORMATION message type when not MFA registration and not SCRIPT', async () => {
      mountComponent({
        messageType: '0',
        message: 'Information message',
        isFirstRenderedCallback: false,
        isMfaRegistrationStep: false,
      });

      await flushPromises();

      const headingDiv = wrapper.find('[role="heading"]');
      expect(headingDiv.attributes('aria-labelledby')).toBe(`message-${callBackIndex}`);
    });

    it('for WARNING message type when not MFA registration and not SCRIPT', async () => {
      mountComponent({
        messageType: '1',
        message: 'Warning message',
        isFirstRenderedCallback: false,
        isMfaRegistrationStep: false,
      });

      await flushPromises();

      const headingDiv = wrapper.find('[role="heading"]');
      expect(headingDiv.attributes('aria-labelledby')).toBe(`message-${callBackIndex}`);
    });

    it('for ERROR message type when not MFA registration and not SCRIPT', async () => {
      mountComponent({
        messageType: '2',
        message: 'Error message',
        isFirstRenderedCallback: false,
        isMfaRegistrationStep: false,
      });

      await flushPromises();

      const headingDiv = wrapper.find('[role="heading"]');
      expect(headingDiv.attributes('aria-labelledby')).toBe(`message-${callBackIndex}`);
    });
  });
  describe('Omits aria-labelledby', () => {
    it('for SCRIPT message type', async () => {
      mountComponent({
        messageType: '4',
        message: 'Script message',
        isFirstRenderedCallback: false,
        isMfaRegistrationStep: false,
      });

      await flushPromises();
      const headingDiv = wrapper.find('[role="heading"]');
      expect(headingDiv.exists()).toBe(true);
      expect(headingDiv.attributes('aria-labelledby')).toBeUndefined();
    });

    it('when isMfaRegistrationStep is true', async () => {
      mountComponent({
        messageType: '0',
        message: 'Information message',
        isFirstRenderedCallback: false,
        isMfaRegistrationStep: true,
      });

      await flushPromises();

      const headingDiv = wrapper.find('[role="heading"]');
      expect(headingDiv.exists()).toBe(true);
      expect(headingDiv.attributes('aria-labelledby')).toBeUndefined();
    });

    it('for WARNING message type and when isMfaRegistrationStep is true', async () => {
      mountComponent({
        messageType: '1',
        message: 'Warning message',
        isFirstRenderedCallback: false,
        isMfaRegistrationStep: true,
      });

      await flushPromises();

      const headingDiv = wrapper.find('[role="heading"]');
      expect(headingDiv.exists()).toBe(true);
      expect(headingDiv.attributes('aria-labelledby')).toBeUndefined();
    });

    it('for WARNING message type and when isMfaRegistrationStep is false and isFirstRenderedCallback is true', async () => {
      mountComponent({
        messageType: '1',
        message: 'Warning message',
        isFirstRenderedCallback: true,
        isMfaRegistrationStep: false,
      });

      await flushPromises();

      const headingDiv = wrapper.find('[role="heading"]');
      expect(headingDiv.exists()).toBe(true);
      expect(headingDiv.attributes('aria-labelledby')).toBeUndefined();
    });

    it('for ERROR message type and when isMfaRegistrationStep is true', async () => {
      mountComponent({
        messageType: '2',
        message: 'Error message',
        isFirstRenderedCallback: false,
        isMfaRegistrationStep: true,
      });

      await flushPromises();

      const headingDiv = wrapper.find('[role="heading"]');
      expect(headingDiv.exists()).toBe(true);
      expect(headingDiv.attributes('aria-labelledby')).toBeUndefined();
    });

    it('for first-callback ERROR message type when visible ERROR element is not rendered', async () => {
      mountComponent({
        messageType: '2',
        message: 'Error message',
        isFirstRenderedCallback: true,
        isMfaRegistrationStep: false,
      });

      await flushPromises();

      const headingDiv = wrapper.find('[role="heading"]');
      expect(headingDiv.exists()).toBe(true);
      expect(headingDiv.attributes('aria-labelledby')).toBeUndefined();
    });
  });
  describe('has correct id "message" for screen readers reference', () => {
    it('on INFORMATION message element', async () => {
      mountComponent({
        messageType: '0',
        message: 'Information message',
        isFirstRenderedCallback: false,
        isMfaRegistrationStep: false,
      });

      await flushPromises();

      const messageElement = wrapper.find(`.text-muted[id="message-${callBackIndex}"]`);
      expect(messageElement.exists()).toBe(true);
    });

    it('on WARNING message element', async () => {
      mountComponent({
        messageType: '1',
        message: 'Warning message',
        isFirstRenderedCallback: false,
        isMfaRegistrationStep: false,
      });

      await flushPromises();

      const messageElement = wrapper.find(`.alert-warning[id="message-${callBackIndex}"]`);
      expect(messageElement.exists()).toBe(true);
    });

    it('on ERROR message element', async () => {
      mountComponent({
        messageType: '2',
        message: 'Error message',
        isFirstRenderedCallback: false,
        isMfaRegistrationStep: false,
      });

      await flushPromises();

      const messageElement = wrapper.find(`.alert-danger[id="message-${callBackIndex}"]`);
      expect(messageElement.exists()).toBe(true);
    });
  });

  describe('interactive message accessibility behavior', () => {
    it('keeps first-rendered INFORMATION with interactive content visible to AT and avoids duplicate live region emission', async () => {
      mountComponent({
        messageType: '0',
        message: '<a href="https://example.com">Continue</a>',
        isFirstRenderedCallback: true,
        isMfaRegistrationStep: false,
      });

      await flushPromises();

      const headingDiv = wrapper.find('[role="heading"]');
      const messageElement = wrapper.find('.text-muted');

      expect(messageElement.attributes('aria-hidden')).toBeUndefined();
      expect(messageElement.classes()).not.toContain('white-space-pre-line');
      expect(headingDiv.attributes('aria-labelledby')).toBe(`message-${callBackIndex}`);
      expect(wrapper.emitted()['update-screen-reader-message']).toBeFalsy();
    });

    it('keeps first-rendered WARNING with interactive content visible to AT and avoids duplicate live region emission', async () => {
      mountComponent({
        messageType: '1',
        message: '<a href="https://example.com">Review warning details</a>',
        isFirstRenderedCallback: true,
        isMfaRegistrationStep: false,
      });

      await flushPromises();

      const headingDiv = wrapper.find('[role="heading"]');
      expect(headingDiv.exists()).toBe(true);
      const messageElement = wrapper.find('.alert-warning');

      expect(messageElement.attributes('aria-hidden')).toBeUndefined();
      expect(messageElement.classes()).not.toContain('white-space-pre-line');
      expect(headingDiv.attributes('aria-labelledby')).toBe(`message-${callBackIndex}`);
      expect(wrapper.emitted()['update-screen-reader-message']).toBeFalsy();
    });

    it('keeps first-rendered WARNING without interactive content hidden from AT and emits live region message', async () => {
      mountComponent({
        messageType: '1',
        message: 'Plain warning text',
        isFirstRenderedCallback: true,
        isMfaRegistrationStep: false,
      });

      await flushPromises();

      const headingDiv = wrapper.find('[role="heading"]');
      const messageElement = wrapper.find('.alert-warning.white-space-pre-line');

      expect(messageElement.attributes('aria-hidden')).toBe('true');
      expect(headingDiv.attributes('aria-labelledby')).toBeUndefined();
      expect(wrapper.emitted()['update-screen-reader-message'].pop()).toEqual(['WARNING', 'Plain warning text']);
    });

    it('does not hide first-rendered INFORMATION during MFA registration and does not emit duplicate live region message', async () => {
      mountComponent({
        messageType: '0',
        message: 'MFA enrollment instructions',
        isFirstRenderedCallback: true,
        isMfaRegistrationStep: true,
      });

      await flushPromises();

      const headingDiv = wrapper.find('[role="heading"]');
      expect(headingDiv.exists()).toBe(true);
      const messageElement = wrapper.find('.text-muted.white-space-pre-line');

      expect(messageElement.attributes('aria-hidden')).toBeUndefined();
      expect(headingDiv.attributes('aria-labelledby')).toBeUndefined();
      expect(wrapper.emitted()['update-screen-reader-message']).toBeFalsy();
    });

    it('does not hide first-rendered INFORMATION when followed by ConfirmationCallback', async () => {
      mountComponent({
        messageType: '0',
        message: 'I am a ConfirmationCallback message',
        isFirstRenderedCallback: true,
        hideTextOutput: false, // This is set to false only when TextOutputCallback is followed by ConfirmationCallback in the callback list. Refer to Login/index.vue for details.
      });

      await flushPromises();

      const headingDiv = wrapper.find('[role="heading"]');
      expect(headingDiv.exists()).toBe(true);
      const messageElement = wrapper.find('.text-muted.white-space-pre-line');

      expect(messageElement.attributes('aria-hidden')).toBeUndefined();
      expect(headingDiv.attributes('aria-labelledby')).toBeDefined();
    });

    it('emits live region message for first-callback ERROR fallback when visible error block is not rendered', async () => {
      mountComponent({
        messageType: '2',
        message: 'Critical error text',
        isFirstRenderedCallback: true,
        isMfaRegistrationStep: false,
      });

      await flushPromises();

      const headingDiv = wrapper.find('[role="heading"]');
      expect(headingDiv.exists()).toBe(true);
      const visibleErrorElement = wrapper.find('.alert-danger');
      expect(visibleErrorElement.exists()).toBe(false);
      expect(headingDiv.attributes('aria-labelledby')).toBeUndefined();
      expect(wrapper.emitted()['update-screen-reader-message'].pop()).toEqual(['ERROR', 'Critical error text']);
    });
  });
});
