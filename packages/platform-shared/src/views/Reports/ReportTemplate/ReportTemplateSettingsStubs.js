/**
 * Copyright 2024 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

const reportSettingsStub = [{
  id: 'dataSources',
  title: 'Data Sources',
  description: 'Data sources description',
  hideAddDefinitionButton: () => !!reportSettingsStub.find((obj) => obj.id === 'dataSources').definitions.length,
  modal: 'report-data-sources-modal',
  definitions: [{
    name: 'applications',
    dataSourceColumns: ['name', '_id'],
    relatedEntities: ['assignments', 'roles'],
    selectedColumns: [],
    selectedRelatedEntities: [],
  }],
},
{
  id: 'parameters',
  title: 'Parameters',
  description: 'Parameters description',
  modal: 'report-parameters-modal',
  definitions: [
    {
      name: 'Account Status',
      parameterType: 'User Provided',
    },
    {
      name: 'Users',
      parameterType: 'Hidden',
    },
  ],
},
{
  id: 'filters',
  title: 'Filters',
  description: 'Filters description',
  hideAddDefinitionButton: () => !!reportSettingsStub.find((obj) => obj.id === 'filters').definitions.length,
  modal: 'report-filters-modal',
  definitions: [{}],
},
{
  id: 'aggregates',
  title: 'Aggregates',
  description: 'Aggregates description',
  modal: 'report-aggregates-modal',
  definitions: [
    {
      name: 'My aggregate 1',
      parameterType: 'User Provided',
      checked: false,
    },
    {
      name: 'My aggregate 2',
      parameterType: 'User Provided',
      checked: false,
    },
  ],
},
{
  id: 'sorting',
  title: 'Sorting',
  description: 'Sorting description',
  modal: 'report-aggregates-modal',
  definitions: [
    {
      sortBy: 'First Name',
      direction: 'desc',
    },
    {
      sortBy: 'Last Name',
      direction: 'asc',
    },
  ],
}];

export default { reportSettingsStub };
