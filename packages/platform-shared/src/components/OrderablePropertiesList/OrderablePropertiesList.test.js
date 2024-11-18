/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import i18n from '@/i18n';
import OrderablePropertiesList from './OrderablePropertiesList';

console.warn = jest.fn();

describe('OrderablePropertiesList', () => {
  function setup() {
    return mount(OrderablePropertiesList, {
      global: {
        plugins: [i18n],
      },
      props: {
        properties: [
          {
            key: 'username',
            title: 'Username',
            type: 'STRING',
            required: true,
          },
          {
            key: 'booleanValue',
            title: 'Boolean value',
            type: 'BOOLEAN',
            required: false,
          },
          {
            key: 'numberValue',
            title: 'Number value',
            type: 'NUMBER',
            required: true,
          },
          {
            key: 'objectValue',
            title: 'Object value',
            type: 'OBJECT',
            required: true,
          },
          {
            key: 'stringOptionsValue',
            title: 'String options value',
            type: 'STRING',
            required: true,
          },
          {
            key: 'multivaluedValue',
            title: 'Multivalued value',
            type: 'STRING',
            required: true,
          },
        ],
      },
    });
  }

  describe('@renders', () => {
    it('should display properties table', async () => {
      const wrapper = setup();
      await flushPromises();

      const tableHeaders = wrapper.findAll('th');
      const tableRows = wrapper.findAll('tr');

      expect(tableHeaders[0].text()).toContain('Order');
      expect(tableHeaders[1].text()).toContain('Property');
      expect(tableHeaders[2].text()).toContain('Type');
      expect(tableHeaders[3].text()).toContain('Required');

      expect(tableRows.length).toBe(7); // 6 properties and header row

      const property = tableRows[1].findAll('td');
      expect(property[0].text()).toContain('drag_indicator1');
      expect(property[1].text()).toContain('Usernameusername');
      expect(property[2].text()).toContain('string');
      expect(property[3].text()).toContain('Required');

      const property2 = tableRows[2].findAll('td');
      expect(property2[0].text()).toContain('drag_indicator2');
      expect(property2[1].text()).toContain('Boolean valuebooleanValue');
      expect(property2[2].text()).toContain('boolean');
      expect(property2[3].text()).not.toContain('Required');
    });

    it('should display move down button only for first item in table', async () => {
      const wrapper = setup();
      await flushPromises();

      const property = findByTestId(wrapper, 'actions-property-0');

      await property.trigger('click');

      const moveUp = findByTestId(property, 'move-up-btn');
      const moveDown = findByTestId(property, 'move-down-btn');

      expect(moveDown.isVisible()).toBeTruthy();
      expect(moveUp.exists()).toBeFalsy();
    });

    it('should display move down and down buttons for items in middle of the table', async () => {
      const wrapper = setup();
      await flushPromises();

      const property = findByTestId(wrapper, 'actions-property-1');

      await property.trigger('click');

      const moveUp = findByTestId(property, 'move-up-btn');
      const moveDown = findByTestId(property, 'move-down-btn');

      expect(moveDown.isVisible()).toBeTruthy();
      expect(moveUp.isVisible()).toBeTruthy();
    });

    it('should display move up button only for last item in table', async () => {
      const wrapper = setup();
      await flushPromises();

      const property = findByTestId(wrapper, 'actions-property-5');

      await property.trigger('click');

      const moveUp = findByTestId(property, 'move-up-btn');
      const moveDown = findByTestId(property, 'move-down-btn');

      expect(moveUp.isVisible()).toBeTruthy();
      expect(moveDown.exists()).toBeFalsy();
    });
  });

  describe('@actions', () => {
    it('should show edit modal', async () => {
      const wrapper = setup();
      await flushPromises();

      expect(wrapper.emitted('show-edit-modal')).toBeFalsy();

      const tableRows = wrapper.findAll('tr');
      const property = tableRows[1].find('td');
      await property.trigger('click');
      flushPromises();

      expect(wrapper.emitted('show-edit-modal')).toBeTruthy();
    });

    it('should show add modal', async () => {
      const wrapper = setup();
      await flushPromises();

      expect(wrapper.emitted('show-add-modal')).toBeFalsy();

      const addBtn = findByTestId(wrapper, 'btn-add-property');
      await addBtn.trigger('click');
      flushPromises();

      expect(wrapper.emitted('show-add-modal')).toBeTruthy();
    });

    it('should move a property via butttons', async () => {
      const wrapper = setup();
      await flushPromises();

      let tableRows = wrapper.findAll('tr');
      let property1 = tableRows[1].findAll('td');
      let property2 = tableRows[2].findAll('td');

      expect(property1[1].text()).toContain('Usernameusername');
      expect(property2[1].text()).toContain('Boolean valuebooleanValue');

      let actions = findByTestId(wrapper, 'actions-property-0');
      await actions.trigger('click');

      const moveDown = findByTestId(actions, 'move-down-btn');
      await moveDown.trigger('click');
      await flushPromises();

      tableRows = wrapper.findAll('tr');
      property1 = tableRows[1].findAll('td');
      property2 = tableRows[2].findAll('td');

      // Now properties have changed
      expect(property1[1].text()).toContain('Boolean valuebooleanValue');
      expect(property2[1].text()).toContain('Usernameusername');

      actions = findByTestId(wrapper, 'actions-property-1');
      await actions.trigger('click');

      const moveUp = findByTestId(actions, 'move-up-btn');
      await moveUp.trigger('click');
      await flushPromises();

      tableRows = wrapper.findAll('tr');
      property1 = tableRows[1].findAll('td');
      property2 = tableRows[2].findAll('td');

      // Now properties have changed back
      expect(property1[1].text()).toContain('Usernameusername');
      expect(property2[1].text()).toContain('Boolean valuebooleanValue');
    });
  });

  describe('@unit', () => {
    it('should add order property to each property in list if it didnt already exist', async () => {
      const wrapper = setup();
      await flushPromises();

      expect(wrapper.props('properties')[0].order).toBe(0);
      expect(wrapper.props('properties')[1].order).toBe(1);
      expect(wrapper.props('properties')[2].order).toBe(2);
      expect(wrapper.props('properties')[3].order).toBe(3);
      expect(wrapper.props('properties')[4].order).toBe(4);
      expect(wrapper.props('properties')[5].order).toBe(5);
    });
  });
});
