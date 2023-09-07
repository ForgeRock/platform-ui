/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import AccountControls from '@/components/profile/AccountControls';
import i18n from '@/i18n';

describe('AccountControls', () => {
  it('Account Controls page loaded', () => {
    const wrapper = mount(AccountControls, {
      global: {
        plugins: [i18n],
      },
    });

    expect(wrapper.vm.items[0].name).toBe('download');
  });
});
