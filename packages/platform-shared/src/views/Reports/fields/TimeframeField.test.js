/**
 * Copyright (c) 2023-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { findByTestId, findByRole } from '@forgerock/platform-shared/src/utils/testHelpers';
import i18n from '@/i18n';
import TimeframeField from './TimeframeField';

describe('Timeframe field for running reports', () => {
  function setup(props) {
    return mount(TimeframeField, {
      global: {
        plugins: [i18n],
      },
      props: {
        ...props,
      },
    });
  }

  let wrapper;

  describe('@components', () => {
    it('emits "field-value-update" when the FrField input updated', async () => {
      wrapper = setup();

      const timeframeField = findByRole(wrapper, 'combobox');
      await timeframeField.trigger('click');

      const firstTimeframeFieldOption = timeframeField.findAll('li')[0].find('span');
      await firstTimeframeFieldOption.trigger('click');

      expect(wrapper.emitted('start-date-update')[1][0]).toBeTruthy();
      expect(wrapper.emitted('end-date-update')[0]).toBeTruthy();
    });

    it('reveals the timeframe-datepicker-fields if the showCustomTimeframe prop is true', async () => {
      wrapper = setup();

      const datepickerField = findByTestId(wrapper, 'datepicker-start');
      expect(datepickerField.isVisible()).toBe(false);
      const timeframeField = findByRole(wrapper, 'combobox');
      await timeframeField.trigger('click');

      const customTimeframeOption = timeframeField.findAll('li')[4].find('span');
      expect(customTimeframeOption.text()).toBe('Custom');

      await customTimeframeOption.trigger('click');
      await nextTick();

      expect(datepickerField.isVisible()).toBe(true);
    });
  });
});
