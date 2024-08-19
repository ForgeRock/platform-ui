/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { findByText } from '@forgerock/platform-shared/src/utils/testHelpers';
import RelatedEntitySettingsModal from './RelatedEntitySettingsModal';
import i18n from '@/i18n';

describe('Related entity settings modal', () => {
  function setup(props) {
    return mount(RelatedEntitySettingsModal, {
      global: {
        plugins: [i18n],
      },
      props: {
        isTesting: true,
        ...props,
      },
    });
  }

  let wrapper;

  describe('@component', () => {
    beforeEach(() => {
      wrapper = setup();
    });

    it('ensures that the expected join type radio buttons show up as expected', () => {
      const radioGroup = wrapper.find('[role="radiogroup"]');
      const radios = radioGroup.findAll('div');
      const [leftRadio, rightRadio, innerRadio] = radios;

      expect(radios.length).toBe(3);

      expect(leftRadio.text()).toBe('Include parent match');
      expect(rightRadio.text()).toBe('Include parent non match');
      expect(innerRadio.text()).toBe('Include match only');

      expect(leftRadio.find('input').element.checked).toBe(true); // default
      expect(leftRadio.find('input').element.value).toBe('left');
      expect(rightRadio.find('input').element.value).toBe('right');
      expect(innerRadio.find('input').element.value).toBe('inner');
    });

    it('ensures that the expected payload is emitted for the left value radio when the save button is clicked', async () => {
      // Saves form and emits payload
      const saveButton = findByText(wrapper, 'button', 'Save');
      await saveButton.trigger('click');

      expect(wrapper.emitted('set-related-entity-type')).toEqual([['left']]);
    });

    it('ensures that the expected payload is emitted for the right value radio when the save button is clicked', async () => {
      const radioGroup = wrapper.find('[role="radiogroup"]');
      const radios = radioGroup.findAll('input');
      const [, rightRadio] = radios;

      await rightRadio.setChecked();

      // Saves form and emits payload
      const saveButton = findByText(wrapper, 'button', 'Save');
      await saveButton.trigger('click');

      expect(wrapper.emitted('set-related-entity-type')).toEqual([['right']]);
    });

    it('ensures that the expected payload is emitted for the inner value radio when the save button is clicked', async () => {
      const radioGroup = wrapper.find('[role="radiogroup"]');
      const radios = radioGroup.findAll('input');
      const [,, innerRadio] = radios;

      await innerRadio.setChecked();

      // Saves form and emits payload
      const saveButton = findByText(wrapper, 'button', 'Save');
      await saveButton.trigger('click');

      expect(wrapper.emitted('set-related-entity-type')).toEqual([['inner']]);
    });

    it('ensures that it selects the correct radio button for an existing related entity definition that has a joinType of "left"', async () => {
      const radioGroup = wrapper.find('[role="radiogroup"]');
      const radios = radioGroup.findAll('input');
      const [leftRadio] = radios;

      // initially assertion should be true because default value is 'left'
      expect(leftRadio.element.checked).toBe(true);
      await wrapper.setProps({ joinType: 'left' });
      expect(leftRadio.element.checked).toBe(true);
    });

    it('ensures that it selects the correct radio button for an existing related entity definition that has a joinType of "right"', async () => {
      const radioGroup = wrapper.find('[role="radiogroup"]');
      const radios = radioGroup.findAll('input');
      const [, rightRadio] = radios;

      expect(rightRadio.element.checked).toBe(false);
      await wrapper.setProps({ joinType: 'right' });
      expect(rightRadio.element.checked).toBe(true);
    });

    it('ensures that it selects the correct radio button for an existing related entity definition that has a joinType of "inner"', async () => {
      const radioGroup = wrapper.find('[role="radiogroup"]');
      const radios = radioGroup.findAll('input');
      const [,, innerRadio] = radios;

      expect(innerRadio.element.checked).toBe(false);
      await wrapper.setProps({ joinType: 'inner' });
      expect(innerRadio.element.checked).toBe(true);
    });
  });
});
