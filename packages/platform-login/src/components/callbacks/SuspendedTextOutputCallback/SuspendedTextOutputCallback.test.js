/**
 * Copyright (c) 2020-2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import SuspendedTextOutputCallback from '@/components/callbacks/SuspendedTextOutputCallback';
import i18n from '@/i18n';

describe('SuspendedTextOutputCallback', () => {
  const STUB_MESSAGE_TEXT = 'test output message';

  function setup() {
    return mount(SuspendedTextOutputCallback, {
      i18n,
      propsData: {
        callback: {
          getOutputValue: jest.fn(() => STUB_MESSAGE_TEXT),
        },
        index: 5,
      },
    });
  }

  describe('@renders', () => {
    it('with message', () => {
      const wrapper = setup();

      expect(wrapper.text()).toContain(STUB_MESSAGE_TEXT);
    });

    describe('with classes', () => {
      // Note: this class was added to fix this bug https://bugster.forgerock.org/jira/browse/IAM-2739
      it('preserving newlines', () => {
        const wrapper = setup();

        const message = findByTestId(wrapper, 'suspend-text-output');
        expect(message.classes()).toContain('white-space-pre-wrap');
      });
    });
  });
});
