/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import { sanitize } from '@forgerock/platform-shared/src/utils/sanitizerConfig';
import SuspendedTextOutputCallback from '@/components/callbacks/SuspendedTextOutputCallback';
import i18n from '@/i18n';

describe('SuspendedTextOutputCallback', () => {
  const STUB_MESSAGE_TEXT = 'test output message';
  const STUB_MESSAGE_HTML = '<p>test output message</p>';

  const defaultProps = {
    props: {
      callback: {
        getOutputValue: jest.fn(() => STUB_MESSAGE_TEXT),
      },
      index: 5,
    },
  };

  const propsWithHtmlMessage = {
    props: {
      callback: {
        getOutputValue: jest.fn(() => STUB_MESSAGE_HTML),
      },
      index: 5,
    },
  };

  function setup(props) {
    return mount(SuspendedTextOutputCallback, {
      global: {
        mocks: {
          $sanitize: (message) => sanitize(message),
        },
        plugins: [i18n],
      },
      ...defaultProps,
      ...props,
    });
  }

  describe('@renders', () => {
    it('with message', () => {
      const wrapper = setup();

      expect(wrapper.text()).toContain(STUB_MESSAGE_TEXT);
    });

    it('with html in message', () => {
      const wrapper = setup(propsWithHtmlMessage);

      // Sanitized message still contains html
      expect(wrapper.vm.sanitizedMessage).toBe(STUB_MESSAGE_HTML);

      // but renders without the html tags
      expect(wrapper.text()).toContain(STUB_MESSAGE_TEXT);
    });

    describe('with classes', () => {
      // Note: this class was added to fix this bug https://bugster.forgerock.org/jira/browse/IAM-2739
      it('preserving newlines', () => {
        const wrapper = setup();

        const message = findByTestId(wrapper, 'suspend-text-output');
        expect(message.classes()).toContain('white-space-pre-line');
      });
    });
  });
});
