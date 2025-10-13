/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { mockModal } from '@forgerock/platform-shared/src/testing/utils/mockModal';
import TermsAndConditions from './TermsAndConditions';
import i18n from '@/i18n';

const selfServiceDetails = {
  requirements: {
    terms: '<strong> THESE ARE TERMS AND CONDITIONS </strong>',
  },
};

const { modalShow } = mockModal();

describe('TermsAndConditions', () => {
  let wrapper;
  function mountComponent(propsData = {}) {
    return mount(TermsAndConditions, {
      props: {
        selfServiceDetails,
        isTesting: true,
        ...propsData,
      },
      global: {
        plugins: [i18n],
      },
    });
  }

  describe('not inline', () => {
    it('renders the terms and conditions', async () => {
      wrapper = mountComponent();
      await flushPromises();

      expect(wrapper.find('h3').exists()).toBe(true);
      expect(wrapper.find('h3').text()).toBe('Terms and Conditions');
      expect(wrapper.find('strong').exists()).toBe(true);
      expect(wrapper.find('strong').text()).toBe('THESE ARE TERMS AND CONDITIONS');
    });
  });

  describe('inline', () => {
    it('clicking the link opens the terms and conditions modal', async () => {
      wrapper = mountComponent({ inline: true });
      await flushPromises();

      wrapper.find('a').trigger('click');
      await flushPromises();
      expect(modalShow).toHaveBeenCalledWith('termsModal');
    });

    it('the modal contains the terms and conditions', async () => {
      wrapper = mountComponent({ inline: true });
      await flushPromises();

      expect(wrapper.find('.terms-and-conditions').exists()).toBe(false);
      expect(wrapper.findComponent({ name: 'BModal' }).exists()).toBe(true);
      expect(wrapper.findComponent({ name: 'BModal' }).text()).toContain('THESE ARE TERMS AND CONDITIONS');
    });
  });
});
