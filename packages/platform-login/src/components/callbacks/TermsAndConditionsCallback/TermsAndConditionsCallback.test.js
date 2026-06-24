/**
 * Copyright (c) 2020-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { runA11yTest } from '@forgerock/platform-shared/src/utils/testHelpers';
import TermsAndConditionsCallback from '@/components/callbacks/TermsAndConditionsCallback';
import i18n from '@/i18n';

describe('TermsAndConditionsCallback.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(TermsAndConditionsCallback, {
      global: {
        plugins: [i18n],
        mocks: {
          $sanitize: (arg) => arg,
        },
        stubs: {
          'router-link': true,
        },
      },
      props: {
        callback: {
          getTerms: () => 'terms',
          setInputValue: jest.fn(),
        },
        index: 5,
      },
    });
  });

  describe('@a11y', () => {
    it('should not have any accessibility violations', async () => {
      await runA11yTest(wrapper);
    });
  });

  it('Sets data', () => {
    expect(wrapper.vm.$data.name).toBe('callback_5');
    expect(wrapper.vm.$data.terms).toBe('terms');

    expect(wrapper.vm.$props.callback.setInputValue).toHaveBeenCalledWith(true);
  });

  it('It opens the modal', () => {
    wrapper.vm.$refs['terms-modal'].show = jest.fn();
    const tacLink = wrapper.find('small button');
    tacLink.trigger('click');

    expect(wrapper.vm.$refs['terms-modal'].show).toHaveBeenCalled();
  });
});
