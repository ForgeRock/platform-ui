/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import RequestTypesTab from './RequestTypesTab';
import i18n from '@/i18n';

describe('RequestTypesTab', () => {
  function setup() {
    return mount(RequestTypesTab, {
      global: {
        plugins: [i18n],
      },
    });
  }

  it('should render under construction message', () => {
    const wrapper = setup();

    expect(wrapper.find('p').text()).toBe('Request Types component under construction...');
  });
});
