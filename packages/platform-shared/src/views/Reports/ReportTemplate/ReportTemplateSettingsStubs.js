/**
 * Copyright 2024 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

const reportSettingsStub = [{
  _id: 'entities',
  title: 'Data Sources',
  description: 'Data sources description',
  hideAddDefinitionButton: () => !!reportSettingsStub.find((obj) => obj._id === 'entities').definitions.length,
  modal: 'report-data-sources-modal',
  definitions: [{
    _id: 'applications',
    dataSourceColumns: [{
      format: 'json',
      label: '_id',
      type: 'string',
      value: 'applications._id',
    },
    {
      format: 'json',
      label: 'name',
      type: 'string',
      value: 'applications.name',
    }],
    relatedDataSources: ['assignments', 'roles'],
    selectedColumns: [],
    selectedRelatedDataSources: [],
  }],
},
{
  _id: 'parameters',
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
  _id: 'filter',
  title: 'Filters',
  description: 'Filters description',
  hideAddDefinitionButton: () => !!reportSettingsStub.find((obj) => obj._id === 'filter').definitions.length,
  modal: 'report-filters-modal',
  definitions: [{}],
},
{
  _id: 'aggregate',
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
  _id: 'sort',
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
