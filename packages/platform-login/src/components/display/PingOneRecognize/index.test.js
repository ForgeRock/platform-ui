/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import i18n from '@/i18n';
import FrPingOneRecognizeCallback from './index';

jest.mock('./PIRecognize', () => ({
  PIRecognize: {
    recognizeSdkBase: jest.fn(() => 'https://example.com/am/XUI/'),
    buildThemeOptions: jest.fn(() => ({})),
    isCameraStreamAvailable: jest.fn(),
    createClient: jest.fn(),
  },
}));

jest.mock('@forgerock/platform-shared/src/stores/theme', () => ({
  useThemeStore: jest.fn(() => ({ theme: {} })),
}));

const { PIRecognize } = require('./PIRecognize');

function makeCallback() {
  return { setInputValue: jest.fn() };
}

function makeMockClient() {
  let handlers = {};
  const client = {
    subscribe: jest.fn(({ next, error, complete }) => { handlers = { next, error, complete }; }),
    init: jest.fn(() => Promise.resolve(null)),
    dispose: jest.fn(),
    trigger: {
      next: (event) => handlers.next?.(event),
      error: (err) => handlers.error?.(err),
      complete: (data) => handlers.complete?.(data),
    },
  };
  return client;
}

function mountComponent(props = {}) {
  return mount(FrPingOneRecognizeCallback, {
    props: {
      callback: makeCallback(),
      customerName: 'test-customer',
      operationType: 'ENROLL',
      serviceURL: 'https://example.com/service',
      ...props,
    },
    global: {
      plugins: [i18n, createPinia()],
    },
  });
}

describe('FrPingOneRecognizeCallback', () => {
  let mockClient;

  beforeEach(() => {
    setActivePinia(createPinia());
    mockClient = makeMockClient();
    PIRecognize.createClient.mockReturnValue(mockClient);
    PIRecognize.isCameraStreamAvailable.mockResolvedValue(true);

    Object.defineProperty(global.navigator, 'permissions', {
      value: { query: jest.fn().mockResolvedValue({ state: 'granted' }) },
      configurable: true,
    });
    Object.defineProperty(global.navigator, 'mediaDevices', {
      value: { getUserMedia: jest.fn() },
      configurable: true,
    });
  });

  describe('computed', () => {
    it('isEnrolment is true when operationType is ENROLL', async () => {
      const wrapper = mountComponent({ operationType: 'ENROLL' });
      await flushPromises();
      expect(wrapper.vm.isEnrolment).toBe(true);
    });

    it('isEnrolment is false when operationType is not ENROLL', async () => {
      const wrapper = mountComponent({ operationType: 'AUTHENTICATE' });
      await flushPromises();
      expect(wrapper.vm.isEnrolment).toBe(false);
    });
  });

  describe('mounted', () => {
    it('emits hide-next-button on mount', async () => {
      const wrapper = mountComponent();
      await flushPromises();
      expect(wrapper.emitted('hide-next-button')).toEqual([[true]]);
    });

    it('sets currentStep to camera-instructions when camera permission is granted', async () => {
      navigator.permissions.query.mockResolvedValue({ state: 'granted' });
      const wrapper = mountComponent();
      await new Promise((resolve) => setTimeout(resolve, 1600));
      await flushPromises();
      expect(wrapper.vm.currentStep).toBe('camera-instructions');
    });

    it('sets currentStep to camera-permission when camera is not granted', async () => {
      navigator.permissions.query.mockResolvedValue({ state: 'prompt' });
      const wrapper = mountComponent();
      await new Promise((resolve) => setTimeout(resolve, 1600));
      await flushPromises();
      expect(wrapper.vm.currentStep).toBe('camera-permission');
    });

    it('sets currentStep to camera-permission when permissions API is unavailable', async () => {
      navigator.permissions.query.mockRejectedValue(new Error('not supported'));
      const wrapper = mountComponent();
      await new Promise((resolve) => setTimeout(resolve, 1600));
      await flushPromises();
      expect(wrapper.vm.currentStep).toBe('camera-permission');
    });

    it('sets currentStep to camera-permission when navigator.permissions is missing', async () => {
      const original = global.navigator.permissions;
      Object.defineProperty(global.navigator, 'permissions', { value: undefined, configurable: true });
      const wrapper = mountComponent();
      await new Promise((resolve) => setTimeout(resolve, 1600));
      await flushPromises();
      expect(wrapper.vm.currentStep).toBe('camera-permission');
      Object.defineProperty(global.navigator, 'permissions', { value: original, configurable: true });
    });

    it('sets currentStep to camera-permission when permission is granted but no camera stream is available (Firefox blank labels)', async () => {
      navigator.permissions.query.mockResolvedValue({ state: 'granted' });
      PIRecognize.isCameraStreamAvailable.mockResolvedValue(false);
      const wrapper = mountComponent();
      await new Promise((resolve) => setTimeout(resolve, 1600));
      await flushPromises();
      expect(wrapper.vm.currentStep).toBe('camera-permission');
    });

    it('skips the getUserMedia probe when permission is not granted', async () => {
      navigator.permissions.query.mockResolvedValue({ state: 'prompt' });
      PIRecognize.isCameraStreamAvailable.mockClear();
      const wrapper = mountComponent();
      await new Promise((resolve) => setTimeout(resolve, 1600));
      await flushPromises();
      expect(wrapper.vm.currentStep).toBe('camera-permission');
      expect(PIRecognize.isCameraStreamAvailable).not.toHaveBeenCalled();
    });

    it('reports SDK_ERROR and shows the error screen when createClient throws', async () => {
      PIRecognize.createClient.mockImplementation(() => { throw new Error('invalid url'); });
      const callback = makeCallback();
      const wrapper = mountComponent({ callback });
      await flushPromises();
      expect(wrapper.vm.currentStep).toBe('error');
      expect(callback.setInputValue).toHaveBeenCalledWith('SDK_ERROR', /clientError$/);
      expect(callback.setInputValue).toHaveBeenCalledWith(1000, /clientErrorCode/);
    });
  });

  describe('unsupported environment', () => {
    let createClientCallsBefore;

    beforeEach(() => {
      createClientCallsBefore = PIRecognize.createClient.mock.calls.length;
    });

    it('a missing camera API shows the unsupported-browser error', async () => {
      Object.defineProperty(global.navigator, 'mediaDevices', { value: undefined, configurable: true });
      const callback = makeCallback();
      const wrapper = mountComponent({ callback });
      await flushPromises();

      expect(wrapper.vm.currentStep).toBe('error');
      expect(wrapper.vm.errorMessage).toBe(
        'This authentication method is not supported in this browser. Please use a supported browser.',
      );
      expect(callback.setInputValue).toHaveBeenCalledWith('SDK_ERROR', /clientError$/);
      expect(callback.setInputValue).toHaveBeenCalledWith(1000, /clientErrorCode/);
      expect(PIRecognize.createClient.mock.calls.length).toBe(createClientCallsBefore);
    });
  });

  describe('SDK failures without an error event', () => {
    it('reports an SDK_ERROR client error to AM when init rejects', async () => {
      mockClient.init.mockRejectedValue(new Error('wasm failed to load'));
      const callback = makeCallback();
      const wrapper = mountComponent({ callback });
      await flushPromises();
      wrapper.vm.onContinueFromInstructions();
      await flushPromises();
      expect(wrapper.vm.currentStep).toBe('error');
      expect(callback.setInputValue).toHaveBeenCalledWith('SDK_ERROR', /clientError$/);
      expect(callback.setInputValue).toHaveBeenCalledWith(1000, /clientErrorCode/);
    });

    it('reports an SDK_ERROR client error to AM when init resolves with an error', async () => {
      mockClient.init.mockResolvedValue(new Error('camera unavailable'));
      const callback = makeCallback();
      const wrapper = mountComponent({ callback });
      await flushPromises();
      wrapper.vm.onContinueFromInstructions();
      await flushPromises();
      expect(wrapper.vm.currentStep).toBe('error');
      expect(callback.setInputValue).toHaveBeenCalledWith('SDK_ERROR', /clientError$/);
      expect(callback.setInputValue).toHaveBeenCalledWith(1000, /clientErrorCode/);
    });

    it('shows the error screen and waits for Continue when init resolves with a RecognizeError', async () => {
      mockClient.init.mockResolvedValue({ error: { code: 1013, message: 'SDK_WEB_ASSEMBLY_IMPORT_FAILED', cause: 'boom' } });
      const callback = makeCallback();
      const wrapper = mountComponent({ callback });
      await flushPromises();
      wrapper.vm.onContinueFromInstructions();
      await flushPromises();
      expect(wrapper.vm.currentStep).toBe('error');
      expect(wrapper.vm.errorCode).toBe('SDK_WEB_ASSEMBLY_IMPORT_FAILED');
      expect(callback.setInputValue).toHaveBeenCalledWith('SDK_WEB_ASSEMBLY_IMPORT_FAILED', /clientError$/);
      expect(callback.setInputValue).toHaveBeenCalledWith(1013, /clientErrorCode/);
      expect(wrapper.emitted('next-step')).toBeUndefined();
      wrapper.vm.onErrorContinue();
      await flushPromises();
      expect(wrapper.emitted('next-step')).toHaveLength(1);
    });

    it('does not report a client error when init succeeds', async () => {
      const callback = makeCallback();
      const wrapper = mountComponent({ callback });
      await flushPromises();
      wrapper.vm.onContinueFromInstructions();
      await flushPromises();
      expect(callback.setInputValue).not.toHaveBeenCalled();
    });

    it('emits next-step even when dispose rejects (pending WASM teardown)', async () => {
      const unhandled = [];
      const onUnhandled = (reason) => { unhandled.push(reason); };
      process.on('unhandledRejection', onUnhandled);
      mockClient.dispose.mockRejectedValue(new Error('WEB_ASSEMBLY_NOT_READY'));
      const callback = makeCallback();
      const wrapper = mountComponent({ callback });
      await flushPromises();
      wrapper.vm.onContinueFromInstructions();
      await flushPromises();
      wrapper.vm.onErrorContinue();
      await flushPromises();
      expect(wrapper.emitted('next-step')).toHaveLength(1);
      expect(unhandled).toHaveLength(0);
      process.off('unhandledRejection', onUnhandled);
    });
  });

  describe('SDK event handlers', () => {
    it('SDK error writes the cause code and transitions to the error screen', async () => {
      const callback = makeCallback();
      const wrapper = mountComponent({ callback });
      await flushPromises();

      mockClient.trigger.error({
        error: { message: 'SERVER_ERROR', code: 500, cause: { message: 'SERVER_INVALID_REQUEST' } },
      });
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.currentStep).toBe('error');
      expect(wrapper.vm.errorCode).toBe('SERVER_INVALID_REQUEST');
      expect(callback.setInputValue).toHaveBeenCalledWith('SERVER_ERROR', /clientError$/);
      expect(callback.setInputValue).toHaveBeenCalledWith(500, /clientErrorCode/);
    });

    it('SDK complete sets currentStep to done', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      mockClient.trigger.complete({ jwt: `header.${btoa(JSON.stringify({ sub: 'user-1' }))}.sig` });
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.currentStep).toBe('done');
    });

    it('SDK complete with no jwt reports SDK_ERROR, shows the error screen and writes no success inputs', async () => {
      const callback = makeCallback();
      const wrapper = mountComponent({ callback });
      await flushPromises();

      mockClient.trigger.complete({ seedEntropy: 'entropy-abc' });
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.currentStep).toBe('error');
      expect(callback.setInputValue).toHaveBeenCalledWith('SDK_ERROR', /clientError$/);
      expect(callback.setInputValue).toHaveBeenCalledWith(1000, /clientErrorCode/);
      expect(callback.setInputValue).toHaveBeenCalledTimes(2);
    });

    it('SDK complete with a sub-less jwt reports SDK_ERROR and shows the error screen', async () => {
      const callback = makeCallback();
      const wrapper = mountComponent({ callback });
      await flushPromises();

      const jwt = `header.${btoa(JSON.stringify({ role: 'x' }))}.sig`;
      mockClient.trigger.complete({ jwt });
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.currentStep).toBe('error');
      expect(callback.setInputValue).toHaveBeenCalledWith('SDK_ERROR', /clientError$/);
      expect(callback.setInputValue).toHaveBeenCalledWith(1000, /clientErrorCode/);
      expect(callback.setInputValue).toHaveBeenCalledTimes(2);
    });

    it('SDK complete decodes a base64url sub (payload containing - and _) and still writes recognizeId', async () => {
      const callback = makeCallback();
      const wrapper = mountComponent({ callback });
      await flushPromises();

      const jwt = 'header.eyJzdWIiOiI-ICJ9.sig';
      mockClient.trigger.complete({ jwt });
      await wrapper.vm.$nextTick();

      expect(callback.setInputValue).toHaveBeenCalledWith(jwt, /signedJwt/);
      expect(callback.setInputValue).toHaveBeenCalledWith('> ', /recognizeId/);
    });

    it('SDK complete writes jwt and recognizeId to callback', async () => {
      const callback = makeCallback();
      const wrapper = mountComponent({ callback });
      await flushPromises();

      const jwtPayload = btoa(JSON.stringify({ sub: 'user-123' }));
      const jwt = `header.${jwtPayload}.sig`;
      mockClient.trigger.complete({ jwt, seedEntropy: 'entropy-abc' });
      await wrapper.vm.$nextTick();

      expect(callback.setInputValue).toHaveBeenCalledWith(jwt, /signedJwt/);
      expect(callback.setInputValue).toHaveBeenCalledWith('user-123', /recognizeId/);
    });

    it('passes operationID and seedEntropy through to the SDK client', async () => {
      mountComponent({ operationID: 'op-42', seedEntropy: true });
      await flushPromises();

      const config = PIRecognize.createClient.mock.calls[PIRecognize.createClient.mock.calls.length - 1][0];
      expect(config.operationID).toBe('op-42');
      expect(config.seedEntropy).toBe(true);
    });

    it('SDK step-change updates currentStep for SDK-driven steps', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      mockClient.trigger.next({ type: 'step-change', detail: { step: 'camera-stream-boot' } });
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.currentStep).toBe('camera-stream-boot');
    });

    it('SDK step-change is ignored for non-SDK-driven steps', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      const stepBefore = wrapper.vm.currentStep;
      mockClient.trigger.next({ type: 'step-change', detail: { step: 'done' } });
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.currentStep).toBe(stepBefore);
    });
  });

  describe('user interaction methods', () => {
    it('onAllowCamera sets currentStep to camera-instructions on getUserMedia success', async () => {
      navigator.mediaDevices.getUserMedia.mockResolvedValue({});
      const wrapper = mountComponent();
      await flushPromises();
      wrapper.vm.onAllowCamera();
      await flushPromises();
      expect(wrapper.vm.currentStep).toBe('camera-instructions');
    });

    it('onAllowCamera sets currentStep to camera-permission-denied on getUserMedia failure', async () => {
      navigator.mediaDevices.getUserMedia.mockRejectedValue(new Error('denied'));
      const wrapper = mountComponent();
      await flushPromises();
      wrapper.vm.onAllowCamera();
      await flushPromises();
      expect(wrapper.vm.currentStep).toBe('camera-permission-denied');
    });

    it('onAllowCamera stops the previous probe stream before opening another', async () => {
      const firstTrack = { stop: jest.fn() };
      const secondTrack = { stop: jest.fn() };
      navigator.mediaDevices.getUserMedia
        .mockResolvedValueOnce({ getTracks: () => [firstTrack] })
        .mockResolvedValueOnce({ getTracks: () => [secondTrack] });
      const wrapper = mountComponent();
      await flushPromises();
      wrapper.vm.onAllowCamera();
      await flushPromises();
      wrapper.vm.onAllowCamera();
      await flushPromises();
      expect(firstTrack.stop).toHaveBeenCalledTimes(1);
      expect(secondTrack.stop).not.toHaveBeenCalled();
    });

    it('onReload calls window.location.reload', async () => {
      const reload = jest.fn();
      Object.defineProperty(window, 'location', { value: { reload, href: '' }, configurable: true });
      const wrapper = mountComponent();
      await flushPromises();
      wrapper.vm.onReload();
      expect(reload).toHaveBeenCalled();
    });
  });
});
