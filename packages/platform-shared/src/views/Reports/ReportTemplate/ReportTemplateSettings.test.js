/**
 * Copyright (c) 2023-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { findByText, findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import i18n from '@/i18n';
import ReportTemplateSettings from './ReportTemplateSettings';
import stubs from './ReportTemplateSettingsStubs';

describe('Report Template Settings component', () => {
  function setup(props) {
    return mount(ReportTemplateSettings, {
      global: {
        plugins: [i18n],
      },
      props: {
        reportSettings: stubs.reportSettingsStub,
        ...props,
      },
    });
  }

  let wrapper;

  describe('@component', () => {
    beforeEach(async () => {
      wrapper = setup();
    });

    const [
      dataSourcesStub,
      parametersStub,
      filtersStub,
      aggregatesStub,
      sortingStub,
    ] = stubs.reportSettingsStub;

    it('ensures that the "Data" and "Details" tabs are present and showing on mount', async () => {
      await nextTick();

      const allTabs = wrapper.findAll('[role="tab"]');
      const [dataTab, detailsTab] = allTabs;
      expect(allTabs.length).toBe(2);
      expect(dataTab.classes()).toContain('active');
      expect(dataTab.text()).toBe('Data');
      expect(detailsTab.text()).toBe('Details');
    });

    it('ensures that the five settings block headings render with the given reportSettings stubs', () => {
      const [
        dataSourcesHeading,
        parametersHeading,
        filtersHeading,
        aggregatesHeading,
        sortingHeading,
      ] = wrapper.findAll('h3');

      expect(dataSourcesHeading.text()).toBe(dataSourcesStub.title);
      expect(parametersHeading.text()).toBe(parametersStub.title);
      expect(filtersHeading.text()).toBe(filtersStub.title);
      expect(aggregatesHeading.text()).toBe(aggregatesStub.title);
      expect(sortingHeading.text()).toBe(sortingStub.title);
    });

    it('ensures that the five settings block descriptions render with the given reportSettings stubs', () => {
      const dataSourcesDescription = findByText(wrapper, 'p', dataSourcesStub.description);
      const parametersDescription = findByText(wrapper, 'p', parametersStub.description);
      const filtersDescription = findByText(wrapper, 'p', filtersStub.description);
      const aggregatesDescription = findByText(wrapper, 'p', aggregatesStub.description);
      const sortingDescription = findByText(wrapper, 'p', sortingStub.description);

      expect(dataSourcesDescription.exists()).toBe(true);
      expect(parametersDescription.exists()).toBe(true);
      expect(filtersDescription.exists()).toBe(true);
      expect(aggregatesDescription.exists()).toBe(true);
      expect(sortingDescription.exists()).toBe(true);
    });

    it('ensures that the Data Source settings block does NOT show the "add" plus button if there are any definitions', () => {
      const dataSourcesSettingsContainer = findByTestId(wrapper, 'entities-settings-container');
      const dataSourceHeadingContainer = findByTestId(dataSourcesSettingsContainer, 'setting-heading');
      const addButton = dataSourceHeadingContainer.find('button');

      expect(addButton.exists()).toBe(false);
    });

    it('ensures that the Data Source settings block DOES show the "add" plus button if there are NO definitions', () => {
      const dataSourcesWithoutAnyDefinitions = [{
        _id: 'entities',
        title: 'Data Sources',
        description: 'Data sources description',
        hideAddDefinitionButton: () => !!dataSourcesWithoutAnyDefinitions.find((obj) => obj._id === 'entities').definitions.length,
        modal: 'report-data-sources-modal',
        definitions: [],
      }];

      wrapper = setup({ reportSettings: dataSourcesWithoutAnyDefinitions });
      const dataSourcesSettingsContainer = findByTestId(wrapper, 'entities-settings-container');
      const dataSourceHeadingContainer = findByTestId(dataSourcesSettingsContainer, 'setting-heading');
      const addButton = dataSourceHeadingContainer.find('button');

      expect(addButton.exists()).toBe(true);
    });

    it('ensures that the Parameters settings block always shows the "add" plus button', () => {
      const parametersSettingsContainer = findByTestId(wrapper, 'parameters-settings-container');
      const parametersHeadingContainer = findByTestId(parametersSettingsContainer, 'setting-heading');
      const addButton = parametersHeadingContainer.find('button');

      expect(addButton.exists()).toBe(true);
    });

    it('ensures that the Filters settings block does NOT show the "add" plus button if there are any definitions', () => {
      const filtersSettingsContainer = findByTestId(wrapper, 'filter-settings-container');
      const filtersHeadingContainer = findByTestId(filtersSettingsContainer, 'setting-heading');
      const addButton = filtersHeadingContainer.find('button');

      expect(addButton.exists()).toBe(false);
    });

    it('ensures that the Filters settings block DOES show the "add" plus button if there are NO definitions', () => {
      const filtersWithoutAnyDefinitions = [{
        _id: 'filter',
        title: 'Filters',
        description: 'Filters description',
        hideAddDefinitionButton: () => !!filtersWithoutAnyDefinitions.find((obj) => obj._id === 'filter').definitions.length,
        modal: 'report-filters-modal',
        definitions: [],
      }];

      wrapper = setup({ reportSettings: filtersWithoutAnyDefinitions });
      const filtersSettingsContainer = findByTestId(wrapper, 'filter-settings-container');
      const filtersHeadingContainer = findByTestId(filtersSettingsContainer, 'setting-heading');
      const addButton = filtersHeadingContainer.find('button');

      expect(addButton.exists()).toBe(true);
    });

    it('ensures that the Aggregate settings block always shows the "add" plus button', () => {
      const aggregatesSettingsContainer = findByTestId(wrapper, 'aggregate-settings-container');
      const aggregatesHeadingContainer = findByTestId(aggregatesSettingsContainer, 'setting-heading');
      const addButton = aggregatesHeadingContainer.find('button');

      expect(addButton.exists()).toBe(true);
    });

    it('ensures that the Sorting settings block always shows the "add" plus button', () => {
      const sortingSettingsContainer = findByTestId(wrapper, 'sort-settings-container');
      const sortingHeadingContainer = findByTestId(sortingSettingsContainer, 'setting-heading');
      const addButton = sortingHeadingContainer.find('button');

      expect(addButton.exists()).toBe(true);
    });

    it('ensures that the dataSources definitions only show if the definitions property has items', () => {
      const dataSourcesWithoutDefinitions = [{ _id: 'entities', definitions: [] }];
      wrapper = setup({ reportSettings: dataSourcesWithoutDefinitions });

      const dataSourcesSettingsContainer = findByTestId(wrapper, 'entities-settings-container');
      const definitionBody = findByTestId(dataSourcesSettingsContainer, 'definition-body');
      expect(definitionBody.exists()).toBe(false);
    });

    it('ensures that the Parameters definitions only show if the definitions property has items', () => {
      const parametersWithoutDefinitions = [{ _id: 'parameters', definitions: [] }];
      wrapper = setup({ reportSettings: parametersWithoutDefinitions });

      const parametersSettingsContainer = findByTestId(wrapper, 'parameters-settings-container');
      const definitionBody = findByTestId(parametersSettingsContainer, 'definition-body');
      expect(definitionBody.exists()).toBe(false);
    });

    it('ensures that the Filters definitions only show if the definitions property has items', () => {
      const filtersWithoutDefinitions = [{ _id: 'filter', definitions: [] }];
      wrapper = setup({ reportSettings: filtersWithoutDefinitions });

      const filtersSettingsContainer = findByTestId(wrapper, 'filter-settings-container');
      const definitionBody = findByTestId(filtersSettingsContainer, 'definition-body');
      expect(definitionBody.exists()).toBe(false);
    });

    it('ensures that the Aggregates definitions only show if the definitions property has items', () => {
      const aggregatesWithoutDefinitions = [{ _id: 'aggregate', definitions: [] }];
      wrapper = setup({ reportSettings: aggregatesWithoutDefinitions });

      const aggregatesSettingsContainer = findByTestId(wrapper, 'aggregate-settings-container');
      const definitionBody = findByTestId(aggregatesSettingsContainer, 'definition-body');
      expect(definitionBody.exists()).toBe(false);
    });

    it('ensures that the Sorting definitions only show if the definitions property has items', () => {
      const sortingWithoutDefinitions = [{ _id: 'sort', definitions: [] }];
      wrapper = setup({ reportSettings: sortingWithoutDefinitions });

      const sortingSettingsContainer = findByTestId(wrapper, 'sort-settings-container');
      const definitionBody = findByTestId(sortingSettingsContainer, 'definition-body');
      expect(definitionBody.exists()).toBe(false);
    });
  });
});
