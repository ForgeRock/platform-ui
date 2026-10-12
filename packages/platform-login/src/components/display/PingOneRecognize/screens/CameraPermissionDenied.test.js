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
import CameraPermissionDenied from './CameraPermissionDenied';

const axeOptions = { rules: { region: { enabled: false } } };

function mountWith(props = {}) {
  return mount(CameraPermissionDenied, {
    props,
    global: {
      plugins: [i18n, createPinia()],
    },
  });
}

describe('CameraPermissionDenied', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('@renders', () => {
    it('renders only the reload button', () => {
      const wrapper = mountWith();
      expect(wrapper.findAll('button')).toHaveLength(1);
    });
  });

  describe('@actions', () => {
    it('emits reload when the continue button is clicked', async () => {
      const wrapper = mountWith();
      await wrapper.findAll('button')[0].trigger('click');
      expect(wrapper.emitted('reload')).toHaveLength(1);
    });
  });

  describe('@a11y', () => {
    it('has no violations', async () => {
      const wrapper = mountWith();
      expect(await axe(wrapper.element, axeOptions)).toHaveNoViolations();
    });
  });
});
