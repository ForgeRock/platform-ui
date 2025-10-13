/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import Consent from './Consent';
import i18n from '@/i18n';

const selfServiceDetails = {
  requirements: {
    consent: 'substitute appropriate Privacy & Consent wording',
  },
};

describe('Consent', () => {
  let wrapper;
  function mountComponent(propsData = {}) {
    return mount(Consent, {
      props: {
        selfServiceDetails,
        ...propsData,
      },
      global: {
        plugins: [i18n],
      },
    });
  }

  describe('inline', () => {
    it('has consent string', () => {
      wrapper = mountComponent({ inline: true });
      expect(wrapper.text()).toBe('substitute appropriate Privacy & Consent wording');
    });
  });

  describe('not inline', () => {
    it('has title and consent string', () => {
      wrapper = mountComponent();

      expect(wrapper.text()).toContain('Privacy & Consent');
      expect(wrapper.text()).toContain('substitute appropriate Privacy & Consent wording');
    });

    it('clicking save emits advanceStage event', async () => {
      wrapper = mountComponent();
      await wrapper.find('button').trigger('click');

      expect(wrapper.emitted('advanceStage')).toBeTruthy();
      expect(wrapper.emitted('advanceStage')[0][0]).toEqual({ consentGiven: 'true' });
    });
  });
});
