/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import dateRanges from '@forgerock/platform-shared/src/utils/date';
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

      const dateFormat = 'YYYY-MM-DD';
      const [todayStart, todayEnd] = dateRanges(dateFormat, dateFormat).Today;

      const timeframeField = findByTestId(wrapper, 'fr-field-timeframe');
      await timeframeField.trigger('click');

      const firstTimeframeFieldOption = timeframeField.findAll('li')[0].find('span');
      await firstTimeframeFieldOption.trigger('click');

      expect(wrapper.emitted('start-date-update')[1][0]).toEqual(todayStart);
      expect(wrapper.emitted('end-date-update')[0]).toEqual([todayEnd]);
    });

    it('reveals the timeframe-datepicker-fields if the showCustomTimeframe prop is true', async () => {
      wrapper = setup();

      const datepickerField = findByTestId(wrapper, 'datepicker-start');
      expect(datepickerField.isVisible()).toBe(false);

      const timeFrameField = findByTestId(wrapper, 'fr-field-timeframe');
      await timeFrameField.trigger('click');

      const customTimeframeOption = timeFrameField.findAll('li').at(4).find('span');
      expect(customTimeframeOption.text()).toBe('Custom');

      await customTimeframeOption.trigger('click');
      await nextTick();

      expect(datepickerField.isVisible()).toBe(true);
    });
  });
});
