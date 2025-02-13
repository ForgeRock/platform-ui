/**
 * Copyright (c) 2023-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { nextTick } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import { findByText, findAllByTestId, findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import * as autoApi from '@forgerock/platform-shared/src/api/AutoApi';
import ValidationRules from '@forgerock/platform-shared/src/utils/validationRules';
import i18n from '@/i18n';
import ReportTemplateSettings from './ReportTemplateSettings';
import stubs from './ReportTemplateSettingsStubs';
import * as ManagedResourceApi from '@/api/ManagedResourceApi';

ValidationRules.extendRules({
  alpha_num_spaces: ValidationRules.getRules(i18n).alpha_num_spaces,
});

describe('Report Template Settings component', () => {
  function setup(props) {
    return mount(ReportTemplateSettings, {
      global: {
        plugins: [i18n],
      },
      props: {
        reportSettings: stubs.reportSettingsStub,
        value: {
          viewers: [],
        },
        ...props,
      },
    });
  }

  let wrapper;

  describe('@component', () => {
    beforeEach(async () => {
      ManagedResourceApi.getManagedResourceList = jest.fn().mockResolvedValue({
        data: {
          result: [
            {
              _id: '1',
              sn: 'Doe',
              givenName: 'John',
              profileImage: 'image',
              userName: 'johndoe',
            },
            {
              _id: '2',
              sn: 'Doe',
              givenName: 'Jane',
              profileImage: 'image',
              userName: 'janedoe',
            },
          ],
        },
      });

      wrapper = setup();
    });

    const [
      dataSourcesStub,
      parametersStub,
      filtersStub,
      aggregatesStub,
      sortingStub,
    ] = stubs.reportSettingsStub;

    describe('@global', () => {
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
    });

    describe('@addDefinitionButton', () => {
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
    });

    describe('@entities', () => {
      autoApi.getReportEntities = jest.fn().mockReturnValue(Promise.resolve({
        data: {
          result: [
            {
              name: 'applications',
              relatedEntities: [{
                name: 'roles',
                label: 'roles',
              },
              {
                name: 'assignments',
                label: 'assignments',
              }],
            },
            {
              name: 'Users',
            },
          ],
        },
      }));

      autoApi.getReportFieldOptions = jest.fn().mockReturnValue(Promise.resolve({
        data: {
          'applications.name': {
            class: 'json',
            column_label: 'Name',
            type: 'string',
          },
          'applications._id': {
            class: 'json',
            column_label: 'ID',
            type: 'string',
          },
        },
      }));

      const entityDefinitionStub = {
        dataSource: 'applications',
        dataSourceColumns: [
          {
            format: 'json',
            label: '_id',
            columnLabel: 'ID',
            type: 'string',
            path: 'applications._id',
          },
          {
            format: 'json',
            label: 'name',
            columnLabel: 'Name',
            type: 'string',
            path: 'applications.name',
          },
        ],
        relatedDataSources: [{
          name: 'assignments',
          label: 'assignments',
        },
        {
          name: 'roles',
          label: 'roles',
        }],
        selectedColumns: [{ path: 'applications.name', order: 0 }],
        selectedRelatedDataSources: ['roles'],
      };

      it('ensures that the dataSources definitions only show if the definitions property has items', async () => {
        const dataSourcesWithoutDefinitions = [{ _id: 'entities', definitions: [] }];
        const dataSourcesWithDefinitions = [{ _id: 'entities', definitions: [entityDefinitionStub] }];
        wrapper = setup({ reportSettings: dataSourcesWithoutDefinitions });

        let dataSourcesSettingsContainer = findByTestId(wrapper, 'entities-settings-container');
        let definitionBody = findByTestId(dataSourcesSettingsContainer, 'definition-body');
        expect(definitionBody.exists()).toBe(false);

        await wrapper.setProps({ reportSettings: dataSourcesWithDefinitions });
        dataSourcesSettingsContainer = findByTestId(wrapper, 'entities-settings-container');
        definitionBody = findByTestId(dataSourcesSettingsContainer, 'definition-body');
        expect(definitionBody.exists()).toBe(true);
      });

      it('ensures that the name column checkbox is checked with the provided definition stub', () => {
        const dataSourcesWithDefinitions = [{ _id: 'entities', definitions: [entityDefinitionStub] }];
        wrapper = setup({ reportSettings: dataSourcesWithDefinitions });

        const dataSourcesSettingsContainer = findByTestId(wrapper, 'entities-settings-container');
        const definitionBody = findByTestId(dataSourcesSettingsContainer, 'definition-body');
        const [_idCheckbox, nameCheckbox] = definitionBody.findAll('input[type="checkbox"]');
        expect(_idCheckbox.wrapperElement).not.toBeChecked();
        expect(nameCheckbox.wrapperElement).toBeChecked();
      });

      it('ensures that the related entities button list shows, along with the correctly selected and unselected states, when the definition contains values for the relatedDataSources and selectedRelatedDataSources properties', () => {
        const dataSourcesWithDefinitions = [{ _id: 'entities', definitions: [entityDefinitionStub] }];
        wrapper = setup({ reportSettings: dataSourcesWithDefinitions });

        const relatedDataSourceLegend = findByText(wrapper, 'legend', 'Related data sources');
        expect(relatedDataSourceLegend.exists()).toBe(true);

        const definitionElement = findByTestId(wrapper, 'definition-body');
        const [, relatedDataSources] = definitionElement.findAll('fieldset');
        const [assignmentsRelatedEntityElement, rolesRelatedEntityElement] = findAllByTestId(relatedDataSources, 'related-entity-list-item');

        // checks that the related entity buttons exist since they are included in the relatedDataSources property
        expect(assignmentsRelatedEntityElement.find('p').text()).toBe('assignments');
        expect(rolesRelatedEntityElement.find('p').text()).toBe('roles');

        // ensures that the assignments related data source DOES NOT show a check icon since it is NOT listed under the selectedRelatedDataSources property
        const assignmentsRelatedEntityCheck = findByText(assignmentsRelatedEntityElement, 'span', 'check');
        expect(assignmentsRelatedEntityCheck).toBeUndefined();

        // ensures that the roles related data source has a check icon since it is listed under the selectedRelatedDataSources property
        const rolesRelatedEntityCheck = findByText(rolesRelatedEntityElement, 'span', 'check');
        expect(rolesRelatedEntityCheck.exists()).toBe(true);
      });

      it('emits "set-related-data-source" when the "Add as Data Source" button is clicked for a related data source', async () => {
        const dataSourcesWithDefinitions = [{ _id: 'entities', definitions: [entityDefinitionStub] }];
        wrapper = setup({ reportSettings: dataSourcesWithDefinitions });

        const definitionElement = findByTestId(wrapper, 'definition-body');
        const [, relatedDataSources] = definitionElement.findAll('fieldset');
        const [assignmentsRelatedEntityElement] = findAllByTestId(relatedDataSources, 'related-entity-list-item');
        const assignmentsRelatedEntityButton = assignmentsRelatedEntityElement.find('button');
        const assignmentsRelatedEntityAddOption = assignmentsRelatedEntityElement.find('a');

        await assignmentsRelatedEntityButton.trigger('click');
        await assignmentsRelatedEntityAddOption.trigger('click');
        const [[definitionIndex, entityValue]] = wrapper.emitted()['set-related-data-source'];
        expect(definitionIndex).toEqual(0);
        expect(entityValue).toBe('assignments');
      });
    });

    describe('@parameters', () => {
      const parameterDefinitionStub = {
        enumeratedValues: [],
        helpText: '',
        inputType: 'String',
        inputLabel: 'my label',
        multivalued: false,
        parameterType: 'user_provided',
        parameterName: 'my parameter',
        profileAttribute: undefined,
      };

      it('ensures that the Parameters definitions only show if the definitions property has items', async () => {
        const parametersWithoutDefinitions = [{ _id: 'parameters', definitions: [] }];
        const parametersWithDefinitions = [{ _id: 'parameters', definitions: [parameterDefinitionStub] }];

        wrapper = setup({ reportSettings: parametersWithoutDefinitions });

        let parametersSettingsContainer = findByTestId(wrapper, 'parameters-settings-container');
        let definitionBody = findByTestId(parametersSettingsContainer, 'definition-body');
        expect(definitionBody.exists()).toBe(false);

        await wrapper.setProps({ reportSettings: parametersWithDefinitions });
        parametersSettingsContainer = findByTestId(wrapper, 'parameters-settings-container');
        definitionBody = findByTestId(parametersSettingsContainer, 'definition-body');
        expect(definitionBody.exists()).toBe(true);
      });

      it('ensures that the definition card shows the given title and parameter type', async () => {
        const parametersWithDefinitions = [{ _id: 'parameters', definitions: [parameterDefinitionStub] }];
        wrapper = setup({ reportSettings: parametersWithDefinitions });

        const parametersSettingsContainer = findByTestId(wrapper, 'parameters-settings-container');
        const definitionBody = findByTestId(parametersSettingsContainer, 'definition-body');
        const definitionHeading = definitionBody.find('h4');
        const definitionSubheading = definitionHeading.find('small');
        expect(definitionHeading.text()).toBe('my parameter user_provided');
        expect(definitionSubheading.text()).toBe('user_provided');
      });
    });

    describe('@filters', () => {
      it('ensures that the Filters definitions only show if the definitions property has items', () => {
        const filtersWithoutDefinitions = [{ _id: 'filter', definitions: [] }];
        wrapper = setup({ reportSettings: filtersWithoutDefinitions });

        const filtersSettingsContainer = findByTestId(wrapper, 'filter-settings-container');
        const definitionBody = findByTestId(filtersSettingsContainer, 'definition-body');
        expect(definitionBody.exists()).toBe(false);
      });
    });

    describe('@aggregates', () => {
      it('ensures that the Aggregates definitions only show if the definitions property has items', () => {
        const aggregatesWithoutDefinitions = [{ _id: 'aggregate', definitions: [] }];
        wrapper = setup({ reportSettings: aggregatesWithoutDefinitions });

        const aggregatesSettingsContainer = findByTestId(wrapper, 'aggregate-settings-container');
        const definitionBody = findByTestId(aggregatesSettingsContainer, 'definition-body');
        expect(definitionBody.exists()).toBe(false);
      });
    });

    describe('@sorting', () => {
      it('ensures that the Sorting definitions only show if the definitions property has items', () => {
        const sortingWithoutDefinitions = [{ _id: 'sort', definitions: [] }];
        wrapper = setup({ reportSettings: sortingWithoutDefinitions });

        const sortingSettingsContainer = findByTestId(wrapper, 'sort-settings-container');
        const definitionBody = findByTestId(sortingSettingsContainer, 'definition-body');
        expect(definitionBody.exists()).toBe(false);
      });
    });

    describe('@details', () => {
      it('input event is emitted if details change', async () => {
        const viewersSelect = wrapper.find('#data-allowed-viewers');
        const viewersOptions = viewersSelect.findAll('.multiselect__option');
        await viewersOptions[0].trigger('click');

        await flushPromises();

        expect(wrapper.emitted('input')).toBeTruthy();
        expect(wrapper.emitted('input')[1][0]).toEqual({
          description: '',
          name: '',
          viewers: [
            '1',
          ],
        });
      });
    });
  });
});
