/**
 * Copyright (c) 2021-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, shallowMount } from '@vue/test-utils';
import ButtonWithSpinner from './index';
import { runA11yTest } from '../../utils/testHelpers';

describe('ButtonWithSpinner', () => {
  describe('@a11y', () => {
    function setupWrapper(props = {}) {
      return mount(ButtonWithSpinner, {
        global: {
          mocks: {
            $t: (label) => label,
          },
        },
        props,
      });
    }

    it('Component should be accessible when button is enabled', async () => {
      const wrapper = setupWrapper({ disabled: false });
      await runA11yTest(wrapper);
    });

    it('Component should be accessible when button is disabled', async () => {
      const wrapper = setupWrapper({ disabled: true });
      await runA11yTest(wrapper);
    });

    it('Component should be accessible when spinner is showing', async () => {
      const wrapper = setupWrapper({ showSpinner: true });
      await runA11yTest(wrapper);
    });

    it('Component should be accessible when showSpinner is hidden', async () => {
      const wrapper = setupWrapper({ showSpinner: false });
      await runA11yTest(wrapper);
    });

    it('Component should be accessible with custom labels', async () => {
      const wrapper = setupWrapper({ buttonText: 'Custom Label', spinnerText: 'Loading Custom Label' });
      await runA11yTest(wrapper);
    });
  });

  it('ButtonWithSpinner successfully loaded', () => {
    const wrapper = shallowMount(ButtonWithSpinner, {
      global: {
        mocks: {
          $t: () => {},
        },
      },
      props: {
        disabled: true,
      },
    });

    expect(wrapper.vm.disabled).toEqual(true);
  });
});
