/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import i18n from '@/i18n';
import DefaultRunReportField from './DefaultRunReportField';

const fieldOptions = ['my-field-option'];

describe('Default field for running reports', () => {
  function setup(props) {
    return mount(DefaultRunReportField, {
      i18n,
      propsData: {
        fieldOptions,
        name: 'my-basic-field',
        ...props,
      },
    });
  }

  let wrapper;

  describe('@components', () => {
    it('emits "field-value-update" when the FrField input updated', async () => {
      wrapper = setup();

      const myField = findByTestId(wrapper, 'fr-field-my-basic-field');
      await myField.trigger('click');

      const firstFieldOption = myField.findAll('li').at(0).find('span');
      await firstFieldOption.trigger('click');

      expect(wrapper.emitted('field-value-update')).toEqual([[[fieldOptions[0]]]]);
    });

    it('emits an array even though the field could be a text field', async () => {
      wrapper = setup({
        fieldOptions: [],
      });

      const myField = findByTestId(wrapper, 'input-default-run-report-field');
      await myField.setValue('my input text');

      expect(wrapper.emitted('field-value-update')).toEqual([[['my input text']]]);
    });
  });
});
