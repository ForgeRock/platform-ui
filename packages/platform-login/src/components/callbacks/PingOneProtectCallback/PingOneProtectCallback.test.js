/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { findByRole } from '@forgerock/platform-shared/src/utils/testHelpers';
import { PIProtect } from '@forgerock/ping-protect';
import PingOneProtectCallback from './PingOneProtectCallback';
import i18n from '@/i18n';

// Mock canvas so errors are not thrown
HTMLCanvasElement.prototype.getContext = () => {};

const mockConfig = {
  envId: '02fb4743-189a-4bc7-9d6c-a919edfe6447',
  consoleLogEnabled: true,
  customHost: '',
  lazyMetadata: false,
  behavioralDataCollection: true,
  deviceKeyRsyncIntervals: 14,
  enableTrust: false,
  disableTags: false,
  disableHub: false,
};

const getMockCallback = (type) => ({
  getType: () => type,
  getConfig: () => mockConfig,
  setClientError: (err) => err,
  setData: (data) => data,
});

describe('PingOneProtectCallback', () => {
  function setup(callbackType = 'PingOneProtectInitializeCallback') {
    return mount(PingOneProtectCallback, {
      global: {
        plugins: [i18n],
      },
      props: {
        callback: getMockCallback(callbackType),
      },
    });
  }

  describe('@renders', () => {
    it('should render a spinner', async () => {
      const wrapper = setup();
      const spinner = findByRole(wrapper, 'status');
      expect(spinner.exists()).toBeTruthy();
    });
  });

  describe('@unit', () => {
    it('should initialize a PingOneProtectInitializeCallback and move to next step', async () => {
      const pingOneProtectStartSpy = jest.spyOn(PIProtect, 'start').mockReturnValue(Promise.resolve({}));
      const wrapper = setup();

      expect(wrapper.emitted()['next-step']).toBeFalsy();
      await flushPromises();

      expect(pingOneProtectStartSpy).toHaveBeenCalledWith(mockConfig);
      expect(wrapper.emitted()['next-step']).toBeTruthy();
    });

    it('should evaluate data from PingOneProtectEvaluationCallback and move to next step', async () => {
      const pingOneProtectGetDataSpy = jest.spyOn(PIProtect, 'getData').mockReturnValue(Promise.resolve('test'));
      const wrapper = setup('PingOneProtectEvaluationCallback');

      expect(wrapper.emitted()['next-step']).toBeFalsy();
      const setDataSpy = jest.spyOn(wrapper.props().callback, 'setData');
      await flushPromises();

      expect(pingOneProtectGetDataSpy).toHaveBeenCalled();
      expect(setDataSpy).toHaveBeenCalledWith('test');
      expect(wrapper.emitted()['next-step']).toBeTruthy();
    });
  });
});
