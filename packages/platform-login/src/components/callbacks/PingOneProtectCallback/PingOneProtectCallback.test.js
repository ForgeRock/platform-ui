/**
 * Copyright (c) 2024-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { findByRole } from '@forgerock/platform-shared/src/utils/testHelpers';
import { protect } from '@forgerock/protect';
import PingOneProtectCallback from './PingOneProtectCallback';
import { useProtectClientStore } from '@/stores/protectClient';
import i18n from '@/i18n';

// Hoisted mocks for the `protect` factory's returned instance. Variable names
// must be prefixed with `mock` so Jest's hoisting allows them inside the
// `jest.mock` factory body. The factory returns plain forwarding wrappers so
// per-test `mockResolvedValue` / `mockRejectedValue` calls are honoured.
const mockStart = jest.fn();
const mockGetData = jest.fn();
jest.mock('@forgerock/protect', () => ({
  protect: jest.fn(() => ({
    start: (...args) => mockStart(...args),
    getData: (...args) => mockGetData(...args),
  })),
}));

// Mock canvas so errors are not thrown
HTMLCanvasElement.prototype.getContext = () => {};

const mockConfig = {
  envId: '02fb4743-189a-4bc7-9d6c-a919edfe6447',
  behavioralDataCollection: true,
  enableTrust: false,
  disableTags: false,
};

const getMockCallback = (type) => ({
  getType: () => type,
  getConfig: () => mockConfig,
  setClientError: (err) => err,
  setData: (data) => data,
});

describe('PingOneProtectCallback', () => {
  function setup(callbackTypeName = 'PingOneProtectInitializeCallback') {
    return mount(PingOneProtectCallback, {
      global: {
        plugins: [i18n],
      },
      props: {
        callback: getMockCallback(callbackTypeName),
      },
    });
  }

  beforeEach(() => {
    setActivePinia(createPinia());
    protect.mockClear();
    mockStart.mockReset();
    mockGetData.mockReset();
  });

  describe('@renders', () => {
    it('should render a spinner', async () => {
      mockStart.mockResolvedValue(undefined);
      const wrapper = setup();
      const spinner = findByRole(wrapper, 'status');
      expect(spinner.exists()).toBeTruthy();
    });
  });

  describe('@unit', () => {
    it('should initialize a PingOneProtectInitializeCallback and move to next step', async () => {
      mockStart.mockResolvedValue(undefined);
      const wrapper = setup();

      expect(wrapper.emitted()['next-step']).toBeFalsy();
      await flushPromises();

      expect(protect).toHaveBeenCalledWith(mockConfig);
      expect(mockStart).toHaveBeenCalled();
      expect(wrapper.emitted()['next-step']).toBeTruthy();
    });

    it('should evaluate data from PingOneProtectEvaluationCallback and move to next step', async () => {
      // The init render must have run first so the module-scoped client is set.
      mockStart.mockResolvedValue(undefined);
      setup();
      await flushPromises();

      mockGetData.mockResolvedValue('test');
      const wrapper = setup('PingOneProtectEvaluationCallback');

      expect(wrapper.emitted()['next-step']).toBeFalsy();
      const setDataSpy = jest.spyOn(wrapper.props().callback, 'setData');
      await flushPromises();

      expect(mockGetData).toHaveBeenCalled();
      expect(setDataSpy).toHaveBeenCalledWith('test');
      expect(wrapper.emitted()['next-step']).toBeTruthy();
    });

    it('should call protect() exactly once across init + evaluation and reuse the same instance', async () => {
      mockStart.mockResolvedValue(undefined);
      mockGetData.mockResolvedValue('signal-data');

      const initWrapper = setup('PingOneProtectInitializeCallback');
      await flushPromises();
      expect(protect).toHaveBeenCalledTimes(1);
      expect(protect).toHaveBeenCalledWith(mockConfig);
      expect(mockStart).toHaveBeenCalledTimes(1);
      expect(initWrapper.emitted()['next-step']).toBeTruthy();

      const evalWrapper = setup('PingOneProtectEvaluationCallback');
      await flushPromises();
      // Same factory instance reused — `protect()` is NOT called again.
      expect(protect).toHaveBeenCalledTimes(1);
      expect(mockGetData).toHaveBeenCalledTimes(1);
      expect(evalWrapper.emitted()['next-step']).toBeTruthy();
    });

    it('should set a client error and move to next step when start() rejects', async () => {
      mockStart.mockRejectedValue(new Error('init boom'));
      const wrapper = setup('PingOneProtectInitializeCallback');
      const setClientErrorSpy = jest.spyOn(wrapper.props().callback, 'setClientError');

      await flushPromises();

      expect(setClientErrorSpy).toHaveBeenCalledWith('init boom');
      expect(wrapper.emitted()['next-step']).toBeTruthy();
    });

    it('should set a client error and move to next step when start() resolves with an error value', async () => {
      mockStart.mockResolvedValue({ error: 'signals sdk failed to load' });
      const wrapper = setup('PingOneProtectInitializeCallback');
      const setClientErrorSpy = jest.spyOn(wrapper.props().callback, 'setClientError');

      await flushPromises();

      expect(setClientErrorSpy).toHaveBeenCalledWith('signals sdk failed to load');
      expect(wrapper.emitted()['next-step']).toBeTruthy();
    });

    it('should treat the Protect client as uninitialized when start() resolves with an error — evaluation callback uses null guard', async () => {
      // Init render: start() returns an error — client must NOT be stored
      mockStart.mockResolvedValue({ error: 'signals sdk failed to load' });
      setup('PingOneProtectInitializeCallback');
      await flushPromises();

      // Eval render: protectClient should still be null, null guard should fire
      const mockCallback = getMockCallback('PingOneProtectEvaluationCallback');
      const setClientErrorSpy = jest.spyOn(mockCallback, 'setClientError');
      const setDataSpy = jest.spyOn(mockCallback, 'setData');
      const wrapper = mount(PingOneProtectCallback, {
        global: { plugins: [i18n] },
        props: { callback: mockCallback },
      });

      await flushPromises();

      expect(setClientErrorSpy).toHaveBeenCalledWith(expect.any(String));
      expect(setDataSpy).not.toHaveBeenCalled();
      expect(wrapper.emitted()['next-step']).toBeTruthy();
    });

    it('should not set a client error when start() resolves without an error value', async () => {
      mockStart.mockResolvedValue(undefined);
      const wrapper = setup('PingOneProtectInitializeCallback');
      const setClientErrorSpy = jest.spyOn(wrapper.props().callback, 'setClientError');

      await flushPromises();

      expect(setClientErrorSpy).not.toHaveBeenCalled();
      expect(wrapper.emitted()['next-step']).toBeTruthy();
    });

    it('should set a client error and move to next step when getData() rejects', async () => {
      mockStart.mockResolvedValue(undefined);
      setup('PingOneProtectInitializeCallback');
      await flushPromises();

      mockGetData.mockRejectedValue(new Error('eval boom'));
      const wrapper = setup('PingOneProtectEvaluationCallback');
      const setClientErrorSpy = jest.spyOn(wrapper.props().callback, 'setClientError');

      await flushPromises();

      expect(setClientErrorSpy).toHaveBeenCalledWith('eval boom');
      expect(wrapper.emitted()['next-step']).toBeTruthy();
    });

    it('should clear the stored Protect client at the start of a new init cycle', async () => {
      const staleStart = jest.fn();
      useProtectClientStore().client = { start: staleStart, getData: jest.fn() };

      mockStart.mockResolvedValue(undefined);
      setup('PingOneProtectInitializeCallback');
      await flushPromises();

      expect(protect).toHaveBeenCalledTimes(1);
      expect(staleStart).not.toHaveBeenCalled();
    });

    it('should set a client error and move to next step when the Protect client is null (bootstrap skipped)', async () => {
      // Do NOT run the init callback first — protectClient stays null.
      // Spy must be set up before mount because the null-guard path is synchronous.
      const mockCallback = getMockCallback('PingOneProtectEvaluationCallback');
      const setClientErrorSpy = jest.spyOn(mockCallback, 'setClientError');
      const wrapper = mount(PingOneProtectCallback, {
        global: { plugins: [i18n] },
        props: { callback: mockCallback },
      });

      await flushPromises();

      expect(setClientErrorSpy).toHaveBeenCalledWith(expect.any(String));
      expect(wrapper.emitted()['next-step']).toBeTruthy();
    });
  });
});
