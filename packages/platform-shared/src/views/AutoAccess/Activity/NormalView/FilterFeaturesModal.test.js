/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import Vue from 'vue';
import { mount } from '@vue/test-utils';
import FilterFeaturesModal from './FilterFeaturesModal';
import i18n from '@/i18n';

describe('FilterFeaturesModal', () => {
  const defaultProps = {
    isTesting: true,
    filters: [{
      show: false,
      text: 'time_of_day',
      title: 'Time of Day',
    }, {
      show: true,
      text: 'os',
      title: 'OS',
    }, {
      show: true,
      text: 'device',
      title: 'Device',
    }],
    modalId: 'testModal',
  };

  function setup(props) {
    return mount(FilterFeaturesModal, {
      global: {
        plugins: [i18n],
      },
      props: {
        ...defaultProps,
        ...props,
      },
    });
  }

  describe('@renders', () => {
    it('should render the component', () => {
      const wrapper = setup();
      const filterFeaturesModal = wrapper.findComponent(FilterFeaturesModal);
      expect(filterFeaturesModal.exists()).toBeTruthy();
    });

    it('should render the complete list of filters', async () => {
      const wrapper = setup();
      const filters = wrapper.findAll('.list-group-item');
      expect(filters).toHaveLength(defaultProps.filters.length);

      defaultProps.filters.forEach(async (filter, index) => {
        const tagText = filters[index].find('.fr-tag-text');
        const checkbox = filters[index].find('input[role="checkbox"]');

        // Correct title matches prop
        expect(tagText.text()).toEqual(filter.title);

        await Vue.nextTick();

        // Correct checked status matches prop
        expect(checkbox.element.checked).toBe(filter.show);
      });
    });
  });

  describe('@actions', () => {
    it('should emit the selected filters on apply', async () => {
      const wrapper = setup();

      // Wait for validator to check checkbox values
      await Vue.nextTick();
      const applyButton = wrapper.find('.apply-button');

      // Click and check emit
      applyButton.trigger('click');
      expect(wrapper.emitted().update).toBeTruthy();
    });
  });
});
