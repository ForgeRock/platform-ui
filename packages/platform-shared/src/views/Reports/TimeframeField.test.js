/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';
import { findByTestId, findByRole, findByText } from '@forgerock/platform-shared/src/utils/testHelpers';
import ValidationRules from '@forgerock/platform-shared/src/utils/validationRules';
import TimeframeField from './TimeframeField';
import i18n from '@/i18n';

const rules = ValidationRules.getRules(i18n);
ValidationRules.extendRules(rules);

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
    it('emits "start-date-update" and "end-date-update" when the FrField input is updated', async () => {
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

    describe('@validation', () => {
      const startDateCustomValue = '05/25/1984';
      const endDateCustomValue = '05/23/1984';
      const startDateISO = new Date(startDateCustomValue).toISOString();
      const endDateISO = new Date(endDateCustomValue).toISOString();

      async function setCustomTimeframeVariables() {
        wrapper = setup();

        const timeframeSelect = findByRole(wrapper, 'listbox');
        const customFieldOption = findByText(timeframeSelect, 'li', 'Custom');
        await timeframeSelect.trigger('click');
        await customFieldOption.find('span').trigger('click');

        wrapper.vm.startDateCustomValue = startDateCustomValue;
        wrapper.vm.endDateCustomValue = endDateCustomValue;
        await flushPromises();
      }

      it('emits expected date values if the end-date datepicker is valid', async () => {
        // sets validation rule to true
        ValidationRules.extendRules({ is_after_date: jest.fn().mockReturnValue(true) });

        await setCustomTimeframeVariables();

        const startDateUpdateEmit = wrapper.emitted('start-date-update');
        const endDateUpdateEmit = wrapper.emitted('end-date-update');
        const emittedStartLastIndex = startDateUpdateEmit.length - 1;
        const emittedEndLastIndex = endDateUpdateEmit.length - 1;

        // we only want to check for the last emitted values in the event loop
        expect(startDateUpdateEmit[emittedStartLastIndex]).toEqual([startDateISO]);
        expect(endDateUpdateEmit[emittedEndLastIndex]).toEqual([endDateISO]);
      });

      it('emits "false" values if the end-date datepicker is invalid', async () => {
        // sets validation rule to false
        ValidationRules.extendRules({ is_after_date: jest.fn().mockReturnValue(false) });

        await setCustomTimeframeVariables();

        const startDateUpdateEmit = wrapper.emitted('start-date-update');
        const endDateUpdateEmit = wrapper.emitted('end-date-update');
        const emittedStartLastIndex = startDateUpdateEmit.length - 1;
        const emittedEndLastIndex = endDateUpdateEmit.length - 1;

        // we only want to check for the last emitted values in the event loop
        expect(startDateUpdateEmit[emittedStartLastIndex]).toEqual([false]);
        expect(endDateUpdateEmit[emittedEndLastIndex]).toEqual([false]);
      });
    });
  });
});
