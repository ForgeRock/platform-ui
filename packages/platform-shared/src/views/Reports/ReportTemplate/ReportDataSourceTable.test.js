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
import ReportDataSourceTable from './ReportDataSourceTable';

describe('Report Data Source Table component', () => {
  const dataSources = [{
    _id: 'applications',
    name: 'applications',
    dataSourceColumns: [
      {
        format: 'json',
        label: 'Name',
        type: 'string',
        value: 'applications.name',
      },
      {
        format: 'json',
        label: '_id',
        type: 'string',
        value: 'applications._id',
      },
    ],
    selectedColumns: ['applications.name', 'applications._id'],
  }];

  function setup(props) {
    return mount(ReportDataSourceTable, {
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
      expect(_idInputValue).toBe('_id');

      const [nameRow, _idRow] = wrapper.findAll('[role="cell"]');
      expect(wrapper.findAll('[role="cell"]').length).toBe(2);
      expect(nameRow.text()).toBe('{name}');
      expect(_idRow.text()).toBe('{_id}');
    });

    it('ensures that the component emits "update-data-source-column-label" when a table header input value is changed', async () => {
      const [nameHeader] = wrapper.findAll('[role="columnheader"]');
      const nameInput = nameHeader.find('input');
      await nameInput.setValue('New Name');
      expect(wrapper.emitted('update-data-source-column-label')[0]).toEqual(['New Name', 'applications.name']);
    });
  });
});
