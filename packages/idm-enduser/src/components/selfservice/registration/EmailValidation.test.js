/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import EmailValidation from './EmailValidation';
import i18n from '@/i18n';

describe('EmailValidation', () => {
  function mountComponent() {
    return mount(EmailValidation, {
      global: {
        plugins: [i18n],
      },
    });
  }

  it('renders the email validation message', () => {
    const wrapper = mountComponent();
    expect(wrapper.text()).toContain('An email has been sent to the address you entered. Click the link in that email to proceed.');
  });
});
