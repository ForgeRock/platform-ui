/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { findByText } from '@forgerock/platform-shared/src/utils/testHelpers';
import i18n from '@/i18n';
import ReportSettingsDefinition from './ReportSettingsDefinition';

describe('Report Settings Definition component', () => {
  function setup(props) {
    return mount(ReportSettingsDefinition, {
      global: {
        plugins: [i18n],
      },
      props: {
        ...props,
      },
    });
  }

  let wrapper;

  describe('@component', () => {
    beforeEach(async () => {
      wrapper = setup();
    });

    it('displays the parameters definition heading for "name" and "parameter type"', () => {
      let definitionHeading = wrapper.find('h4');
      expect(definitionHeading.exists()).toBe(false);

      wrapper = setup({
        settingId: 'parameters',
        definition: {
          parameterName: 'Parameter Definition Name',
          parameterType: 'User Provided',
        },
      });

      definitionHeading = wrapper.find('h4');
      expect(definitionHeading.text()).toBe('Parameter Definition Name User Provided');
    });

    it('displays the "Filter Active" state definition', () => {
      let filterDefinition = findByText(wrapper, 'p', 'checkFilter active');
      expect(filterDefinition).toBeFalsy();

      wrapper = setup({ settingId: 'filter' });

      filterDefinition = findByText(wrapper, 'p', 'checkFilter active');
      expect(filterDefinition.exists()).toBe(true);
    });

    it('displays the "Aggregate" definition checkboxes', () => {
      let aggregateCheckboxLabel = wrapper.find('label');
      expect(aggregateCheckboxLabel.exists()).toBe(false);

      wrapper = setup({
        settingId: 'aggregate',
        definition: { name: 'My aggregate' },
      });

      aggregateCheckboxLabel = wrapper.find('label');
      expect(aggregateCheckboxLabel.text()).toBe('My aggregate');
    });

    it('emits the aggregate checkbox selection', async () => {
      wrapper = setup({
        settingId: 'aggregate',
        definition: { name: 'My aggregate' },
      });

      const aggregateCheckbox = wrapper.find('input[type="checkbox"]');
      await aggregateCheckbox.setValue();
      expect(wrapper.emitted()['set-aggregate'][0]).toEqual([true]);
    });

    it('pre-selects an aggregate checkbox if the definition prop contains a checked property set to true', async () => {
      wrapper = setup({
        settingId: 'aggregate',
        definition: {
          name: 'My aggregate',
          checked: false,
        },
      });

      let aggregateCheckbox = wrapper.find('input[type="checkbox"]');
      expect(aggregateCheckbox.wrapperElement).not.toBeChecked();

      await wrapper.setProps({
        settingId: 'aggregate',
        definition: {
          name: 'My aggregate',
          checked: true,
        },
      });

      aggregateCheckbox = wrapper.find('input[type="checkbox"]');
      expect(aggregateCheckbox.wrapperElement).toBeChecked();
    });

    it('displays the sorting descending definition card elements', () => {
      let sortingDescDefinition = findByText(wrapper, 'p', 'arrow_downward Sort by: First Name');
      expect(sortingDescDefinition).toBeFalsy();

      wrapper = setup({
        settingId: 'sort',
        definition: {
          sortBy: 'First Name',
          direction: 'desc',
        },
      });

      sortingDescDefinition = findByText(wrapper, 'p', 'arrow_downwardSort by: First Name');
      expect(sortingDescDefinition.exists()).toBe(true);
    });

    it('displays the sorting ascending definition card elements', () => {
      let sortingAscDefinition = findByText(wrapper, 'p', 'arrow_upwardSort by: Last Name');
      expect(sortingAscDefinition).toBeFalsy();

      wrapper = setup({
        settingId: 'sort',
        definition: {
          sortBy: 'Last Name',
          direction: 'asc',
        },
      });

      sortingAscDefinition = findByText(wrapper, 'p', 'arrow_upwardSort by: Last Name');
      expect(sortingAscDefinition.exists()).toBe(true);
    });

    it('displays the definition name as part of the edit button in the ellipse menu', () => {
      wrapper = setup({ settingTitle: 'Parameters' });

      const [editButton] = wrapper.findAll('[role="menuitem"]');
      expect(editButton.text()).toContain('Edit Parameters');
    });

    it('displays the definition name as part of the edit button in the ellipse menu', () => {
      wrapper = setup({ settingTitle: 'Parameters' });

      const [editButton] = wrapper.findAll('[role="menuitem"]');
      expect(editButton.text()).toContain('Edit Parameters');
    });

    it('emits "edit-definition" when the edit button is clicked in the ellipse menu', async () => {
      wrapper = setup({ settingTitle: 'Parameters' });

      const [editButton] = wrapper.findAll('[role="menuitem"]');
      await editButton.trigger('click');
      expect(wrapper.emitted()['edit-definition'][0]).toBeTruthy();
    });

    it('displays the delete button in the ellipse menu', () => {
      const [, deleteButton] = wrapper.findAll('[role="menuitem"]');
      expect(deleteButton.text()).toContain('Delete');
    });

    it('emits "delete-definition" when the delete button is clicked in the ellipse menu', async () => {
      wrapper = setup({ settingTitle: 'Parameters' });

      const [, deleteButton] = wrapper.findAll('[role="menuitem"]');
      await deleteButton.trigger('click');
      expect(wrapper.emitted()['delete-definition'][0]).toBeTruthy();
    });
  });
});
