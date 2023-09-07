/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import i18n from '@/i18n';
import DefaultRunReportCustomTagField from './DefaultRunReportCustomTagField';

const fieldOptions = [{ label: 'field-label', color: 'success', icon: 'check' }];

describe('Default field, with custom tags, for running reports', () => {
  function setup(props) {
    return mount(DefaultRunReportCustomTagField, {
      global: {
        plugins: [i18n],
      },
      props: {
        ...props,
        fieldOptions,
        name: 'my-basic-field',
      },
    });
  }

  let wrapper;

  describe('@components', () => {
    it('emits "field-value-update" when the FrField input updated', async () => {
      wrapper = setup();

      const myField = findByTestId(wrapper, 'fr-field-my-basic-field');
      await myField.trigger('click');

      const firstFieldOption = myField.findAll('li')[0].find('span');
      await firstFieldOption.trigger('click');

      expect(wrapper.emitted('field-value-update')).toEqual([[[fieldOptions[0]]]]);
    });
  });
});
