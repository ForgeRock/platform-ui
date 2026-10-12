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
import Error from './Error';

const axeOptions = { rules: { region: { enabled: false } } };

function mountWith(props = {}) {
  return mount(Error, {
    props,
    global: {
      plugins: [i18n, createPinia()],
    },
  });
}

describe('Error', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('@renders', () => {
    it('renders only the continue button', () => {
      const wrapper = mountWith({ isEnrolment: true, errorCode: '' });
      expect(wrapper.findAll('button')).toHaveLength(1);
    });

    it('displays errorMessage in the alert when provided', () => {
      const wrapper = mountWith({ isEnrolment: true, errorMessage: 'Custom error text', errorCode: '' });
      expect(wrapper.find('[role="alert"]').text()).toContain('Custom error text');
    });

    it('hides body text for SERVER_ error codes', () => {
      const wrapper = mountWith({ isEnrolment: true, errorCode: 'SERVER_INVALID_REQUEST' });
      expect(wrapper.find('.fr-recognize-screen__body').exists()).toBe(false);
    });

    it('hides body text for CORE_ error codes', () => {
      const wrapper = mountWith({ isEnrolment: true, errorCode: 'CORE_TIMEOUT' });
      expect(wrapper.find('.fr-recognize-screen__body').exists()).toBe(false);
    });

    it('shows body text for client error codes', () => {
      const wrapper = mountWith({ isEnrolment: true, errorCode: 'CLIENT_ERROR' });
      expect(wrapper.find('.fr-recognize-screen__body').exists()).toBe(true);
    });
  });

  describe('@actions', () => {
    it('emits continue when the continue button is clicked', async () => {
      const wrapper = mountWith({ isEnrolment: true, errorCode: '' });
      await wrapper.findAll('button')[0].trigger('click');
      expect(wrapper.emitted('continue')).toHaveLength(1);
    });
  });

  describe('@a11y', () => {
    it('enroll client error has no violations', async () => {
      const wrapper = mountWith({ isEnrolment: true, errorMessage: 'Something went wrong', errorCode: 'CLIENT_ERROR' });
      expect(await axe(wrapper.element, axeOptions)).toHaveNoViolations();
    });

    it('auth server error has no violations', async () => {
      const wrapper = mountWith({ isEnrolment: false, errorMessage: '', errorCode: 'SERVER_ERROR' });
      expect(await axe(wrapper.element, axeOptions)).toHaveNoViolations();
    });
  });
});
