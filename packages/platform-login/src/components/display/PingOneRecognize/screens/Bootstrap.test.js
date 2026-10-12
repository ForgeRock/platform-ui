/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { axe } from 'jest-axe';
import { createPinia, setActivePinia } from 'pinia';
import i18n from '@/i18n';
import Bootstrap from './Bootstrap';

const axeOptions = { rules: { region: { enabled: false } } };

function mountWith(props = {}) {
  return mount(Bootstrap, {
    props,
    global: {
      plugins: [i18n, createPinia()],
    },
  });
}

describe('Bootstrap', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('@a11y', () => {
    it('has no violations', async () => {
      const wrapper = mountWith();
      expect(await axe(wrapper.element, axeOptions)).toHaveNoViolations();
    });
  });
});
