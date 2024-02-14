/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import i18n from '@/i18n';
import ReportsMultiSelect from './ReportsMultiSelect';

describe('Default field, with custom tags, for running reports', () => {
  ReportsMultiSelect.mounted = jest.fn();

  function setup(props) {
    return mount(ReportsMultiSelect, {
      global: {
        plugins: [i18n],
      },
      propsData: {
        ...props,
      },
    });
  }

  let wrapper;

  describe('@components', () => {
    it('emits "input" when the FrField input updated', async () => {
      wrapper = setup({
        label: 'field-label',
        options: ['first option', 'second option'],
        placeholder: 'My multiselect field',
      });

      const myField = findByTestId(wrapper, 'reports-multiselect-field');
      await myField.trigger('click');
      const firstFieldOption = myField.findAll('li')[1].find('span');
      await firstFieldOption.trigger('click');
      expect(wrapper.emitted('input')).toEqual([[['second option']]]);
    });

    it('ensures that the placeholder text updates to let the user know that they can input tags if the taggable prop is true', async () => {
      wrapper = setup({
        label: 'field-label',
        options: [],
        placeholder: 'My multiselect field',
      });

      const myFieldContainer = findByTestId(wrapper, 'reports-multiselect-field');
      const fieldPlaceholder = myFieldContainer.find('.multiselect__placeholder');
      expect(fieldPlaceholder.text()).toBe('My multiselect field');

      await wrapper.setProps({ taggable: true });
      expect(fieldPlaceholder.text()).toBe('Press enter to create a tag');
    });
  });
});
