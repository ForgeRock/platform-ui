/**
 * Copyright 2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { mount } from '@vue/test-utils';
import AccountControls from '.';
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
