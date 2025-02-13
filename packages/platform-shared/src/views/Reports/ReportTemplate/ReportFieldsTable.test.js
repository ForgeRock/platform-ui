/**
 * Copyright (c) 2023-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { findByRole } from '@forgerock/platform-shared/src/utils/testHelpers';
import i18n from '@/i18n';
import ReportFieldsTable from './ReportFieldsTable';

describe('Report Fields table component', () => {
  const dataSources = [{
    _id: 'applications',
    name: 'applications',
    dataSourceColumns: [
      {
        format: 'json',
        label: 'Name',
        columnLabel: 'Name',
        type: 'string',
        path: 'applications.name',
      },
      {
        format: 'json',
        label: '_id',
        columnLabel: 'ID',
        type: 'string',
        path: 'applications._id',
      },
    ],
    selectedColumns: [{ path: 'applications.name', order: 0 }, { path: 'applications._id', order: 1 }],
  }];

  function setup(props) {
    return mount(ReportFieldsTable, {
      global: {
        plugins: [i18n],
      },
      props: {
        dataSources,
        ...props,
      },
    });
  }

  let wrapper;

  describe('@component', () => {
    beforeEach(async () => {
      wrapper = setup();
    });

    it('outputs the empty state heading text on load if there are no dataSources', () => {
      wrapper = setup({ dataSources: [] });

      const emptyStateHeading = wrapper.find('h3');
      expect(emptyStateHeading.text()).toBe('No columns added');
    });

    it('outputs the empty state heading text on load if there is are dataSources but no selected columns', () => {
      wrapper = setup({
        dataSources: [{
          _id: 'applications',
          name: 'applications',
          dataSourceColumns: [],
          selectedColumns: [],
        }],
      });

      const emptyStateHeading = wrapper.find('h3');
      expect(emptyStateHeading.text()).toBe('No columns added');
    });

    it('displays the expected column headers and rows for any values within the selectedColumns property inside of dataSources', async () => {
      wrapper = setup({ dataSources: [] });

      const emptyStateHeading = wrapper.find('h3');
      expect(emptyStateHeading.text()).toBe('No columns added');

      const tableHeaders = findByRole(wrapper, 'columnheader');
      expect(tableHeaders.exists()).toBe(false);

      wrapper = setup({ dataSources });
      await nextTick();

      const [nameHeader, _idHeader] = wrapper.findAll('[role="columnheader"]');
      expect(wrapper.findAll('[role="columnheader"]').length).toBe(2);

      const nameInputValue = nameHeader.find('input').element.value;
      expect(nameInputValue).toBe('Name');

      const _idInputValue = _idHeader.find('input').element.value;
      expect(_idInputValue).toBe('ID');

      const [nameRow, _idRow] = wrapper.findAll('[role="cell"]');
      expect(wrapper.findAll('[role="cell"]').length).toBe(2);
      expect(nameRow.text()).toBe('{applications.name}');
      expect(_idRow.text()).toBe('{applications._id}');
    });

    it('ensures that the component emits "update-table-entry-label" when a table header input value is changed', async () => {
      const [nameHeader] = wrapper.findAll('[role="columnheader"]');
      const nameInput = nameHeader.find('input');
      await nameInput.setValue('New Name');
      expect(wrapper.emitted('update-table-entry-label')[0]).toEqual(['entities', 'applications.name', 'New Name']);
    });

    it('Orders the columns correctly based on the selectedColumns data', async () => {
      // Custom test data
      const updatedDataSources = [...dataSources];
      const dataSourceColumns = [{
        format: 'json', label: 'AppOne', columnLabel: 'AppOne', type: 'string', path: 'appOne.name',
      }, {
        format: 'json', label: 'AppTwo', columnLabel: 'AppTwo', type: 'string', path: 'appTwo.name',
      }, {
        format: 'json', label: 'AppThree', columnLabel: 'AppThree', type: 'string', path: 'appThree.name',
      }, {
        format: 'json', label: 'AppFour', columnLabel: 'AppFour', type: 'string', path: 'appFour.name',
      }, {
        format: 'json', label: 'AppFive', columnLabel: 'AppFive', type: 'string', path: 'appFive.name',
      }];
      const selectedColumns = [{
        path: 'appOne.name', order: 0,
      }, {
        path: 'appTwo.name', order: 1,
      }, {
        path: 'appThree.name', order: 2,
      }, {
        path: 'appFour.name', order: 3,
      }, {
        path: 'appFive.name', order: 4,
      }];
      updatedDataSources[0].dataSourceColumns = dataSourceColumns;
      updatedDataSources[0].selectedColumns = selectedColumns;
      wrapper = setup({ updatedDataSources });

      // Get the draggable component
      const draggableComponent = wrapper.findComponent({ name: 'Draggable' });
      const tableHeaders = draggableComponent.findAll('[role=columnheader]');

      // Check the order of header columns is correct
      tableHeaders.forEach((header, index) => {
        const input = header.find('input[type=text]');
        expect(input.element.name).toBe(dataSourceColumns[index].label);
      });

      // // Reorder columns for next test
      updatedDataSources[0].selectedColumns[0].order = 3;
      updatedDataSources[0].selectedColumns[1].order = 2;
      updatedDataSources[0].selectedColumns[2].order = 4;
      updatedDataSources[0].selectedColumns[3].order = 0;
      updatedDataSources[0].selectedColumns[4].order = 1;

      // Check the order of header columns is correct
      tableHeaders.forEach((header, index) => {
        const input = header.find('input[type=text]');
        expect(input.element.name).toBe(dataSourceColumns[index].label);
      });
    });

    it('emits the column order event with correct new and old indexes', async () => {
      wrapper = setup({ dataSources });
      const draggableComponent = wrapper.findComponent({ name: 'Draggable' });
      const movedEvent = {
        moved: {
          element: {
            format: 'json',
            label: 'City',
            columnLabel: 'City',
            type: 'string',
            path: 'users.city',
            context: 'users.city',
            settingId: 'entities',
          },
          oldIndex: 5,
          newIndex: 1,
        },
      };
      draggableComponent.vm.$emit('change', movedEvent);
      await nextTick();
      expect(wrapper.emitted()['update-table-column-order'][0]).toEqual([movedEvent.moved.newIndex, movedEvent.moved.oldIndex]);
    });
  });
});
