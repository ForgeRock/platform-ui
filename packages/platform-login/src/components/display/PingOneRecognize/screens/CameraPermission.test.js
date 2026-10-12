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
import CameraPermission from './CameraPermission';

const axeOptions = { rules: { region: { enabled: false } } };

function mountWith(props = {}) {
  return mount(CameraPermission, {
    props,
    global: {
      plugins: [i18n, createPinia()],
    },
  });
}

describe('CameraPermission', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('@renders', () => {
    it('shows enroll body text when isEnrolment is true', () => {
      const wrapper = mountWith({ isEnrolment: true });
      expect(wrapper.html()).toContain(i18n.global.t('login.pingOneRecognize.cameraPermission.enrollBody'));
    });

    it('shows auth body text when isEnrolment is false', () => {
      const wrapper = mountWith({ isEnrolment: false });
      expect(wrapper.html()).toContain(i18n.global.t('login.pingOneRecognize.cameraPermission.authBody'));
    });
  });

  describe('@actions', () => {
    it('emits allow when the allow button is clicked', async () => {
      const wrapper = mountWith({ isEnrolment: true });
      await wrapper.findAll('button')[0].trigger('click');
      expect(wrapper.emitted('allow')).toHaveLength(1);
    });

    it('emits deny when the deny button is clicked', async () => {
      const wrapper = mountWith({ isEnrolment: true });
      await wrapper.findAll('button')[1].trigger('click');
      expect(wrapper.emitted('deny')).toHaveLength(1);
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
