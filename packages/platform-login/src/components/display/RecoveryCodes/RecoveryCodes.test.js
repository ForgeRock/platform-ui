/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import { FRRecoveryCodes } from '@forgerock/javascript-sdk';
import * as clipboard from 'clipboard-polyfill/text';
import Notifications from '@kyvg/vue3-notification';
import i18n from '@/i18n';
import RecoveryCodes from './index';

describe('RecoveryCodes', () => {
  window.print = jest.fn();

  const stubRecoveryCodes = [
    'ZJrCaPOrP1',
    'GgyOtUBObK',
    'd6UFLvg7J1',
    'lW53KEMwZN',
    'Rzz77kf0B7',
    'Y2pcoQgMD9',
    '8bSsPn7AW6',
    'aglbEnRO0O',
    'j0Cdp7aoWQ',
    '8YrBjjy5Hl',
  ];

  jest.spyOn(FRRecoveryCodes, 'getCodes').mockReturnValue(stubRecoveryCodes);

  function setup(props) {
    return mount(RecoveryCodes, {
      global: {
        plugins: [i18n, Notifications],
      },
      props: {
        step: {},
        ...props,
      },
    });
  }

  describe('@renders', () => {
    it('recovery codes', async () => {
      const wrapper = setup();
      await wrapper.vm.$nextTick();

      stubRecoveryCodes.forEach((code, index) => {
        const li = findByTestId(wrapper, `recovery-code-${index}`);
        expect(li.text(code)).toBe(code);
      });
    });
  });

  describe('@actions', () => {
    it('can progress to next step', () => {
      const wrapper = setup();

      expect(wrapper.emitted('next-step')).toBeFalsy();
      const doneButton = findByTestId(wrapper, 'btn-recovery-codes-next-step');
      doneButton.trigger('click');

      expect(wrapper.emitted('next-step')).toBeTruthy();
    });

    it('should copy codes to clipboard', async () => {
      const wrapper = setup();
      await wrapper.vm.$nextTick();
      const notificationSpy = jest.spyOn(wrapper.vm, 'displayNotification');
      const clipboardSpy = jest.spyOn(clipboard, 'writeText').mockImplementation(() => Promise.resolve());

      const copyCodesButton = findByTestId(wrapper, 'btn-copy-recovery-codes');
      expect(copyCodesButton.attributes('aria-label')).toBe(`Copy ${stubRecoveryCodes.length} recovery codes to clipboard`);
      expect(notificationSpy).not.toHaveBeenCalled();
      expect(clipboardSpy).not.toHaveBeenCalled();

      await copyCodesButton.trigger('click');
      expect(notificationSpy).toHaveBeenCalledTimes(1);
      expect(clipboardSpy).toHaveBeenCalledWith(stubRecoveryCodes);
    });

    it('should display error when copy codes fails', async () => {
      jest.spyOn(clipboard, 'writeText').mockReturnValue(Promise.reject());

      const wrapper = setup();
      await wrapper.vm.$nextTick();
      const showErrorMessageSpy = jest.spyOn(wrapper.vm, 'showErrorMessage');

      const copyCodesButton = findByTestId(wrapper, 'btn-copy-recovery-codes');
      expect(showErrorMessageSpy).not.toHaveBeenCalled();

      await copyCodesButton.trigger('click');
      expect(showErrorMessageSpy).toHaveBeenCalledTimes(1);
    });

    it('should print codes', async () => {
      const print = jest.spyOn(window, 'print');

      const wrapper = setup();
      await wrapper.vm.$nextTick();

      const printCodesButton = findByTestId(wrapper, 'btn-print-recovery-codes');
      expect(printCodesButton.attributes('aria-label')).toBe(`Print ${stubRecoveryCodes.length} recovery codes`);
      expect(print).not.toHaveBeenCalled();

      await printCodesButton.trigger('click');
      expect(print).toHaveBeenCalledTimes(1);
    });
  });
});
