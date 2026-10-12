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
import ServerComputation from './ServerComputation';

const axeOptions = { rules: { region: { enabled: false } } };

function mountWith(props = {}) {
  return mount(ServerComputation, {
    props,
    global: {
      plugins: [i18n, createPinia()],
    },
  });
}

describe('ServerComputation', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('@renders', () => {
    it('shows enroll headline when isEnrolment is true', () => {
      const wrapper = mountWith({ isEnrolment: true });
      expect(wrapper.find('h2').text()).toBe(i18n.global.t('login.pingOneRecognize.serverComputation.enrollHeadline'));
    });

    it('shows auth headline when isEnrolment is false', () => {
      const wrapper = mountWith({ isEnrolment: false });
      expect(wrapper.find('h2').text()).toBe(i18n.global.t('login.pingOneRecognize.serverComputation.authHeadline'));
    });
  });

  describe('@a11y', () => {
    it('enroll has no violations', async () => {
      const wrapper = mountWith({ isEnrolment: true });
      expect(await axe(wrapper.element, axeOptions)).toHaveNoViolations();
    });

    it('auth has no violations', async () => {
      const wrapper = mountWith({ isEnrolment: false });
      expect(await axe(wrapper.element, axeOptions)).toHaveNoViolations();
    });
  });
});
