/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import useReportSettings from './ReportSettings';
import useReportParameters from './ReportParameters';
import useReportEntities from './ReportEntities';
import useReportFilters from './ReportFilters';
import useReportAggregates from './ReportAggregates';
import useReportSorting from './ReportSorting';

describe('@useReportSettings', () => {
  const { entitiesPayload } = useReportEntities();
  const { parametersPayload } = useReportParameters();
  const { filtersPayload } = useReportFilters();
  const { aggregatesPayload } = useReportAggregates();
  const { sortingPayload } = useReportSorting();
  const {
    findSettingsObject,
    generateNewDefinitions,
    reportPayload,
    reportSettings,
  } = useReportSettings(
    parametersPayload,
    entitiesPayload,
    filtersPayload,
    aggregatesPayload,
    sortingPayload,
  );

  describe('@unit', () => {
    it('finds the correct reportSettings object by id', () => {
      const entitiesSettingObject = findSettingsObject('entities');
      const [entitiesFromReportSettings] = reportSettings.value;
      expect(entitiesSettingObject).toEqual(entitiesFromReportSettings);
    });

    it('generates a new list of definitions with the provided definition object', () => {
      const newDefinition = { _id: 'my parameter name' };
      const newDefinitionsArray = generateNewDefinitions([], newDefinition);
      expect(newDefinitionsArray.length).toBe(1);
      expect(newDefinitionsArray[0]._id).toBe('my parameter name');
    });

    it('generates a new list of definitions with the provided definition object and existing list', () => {
      const secondDefinition = { _id: 'my second parameter' };
      const updatedDefinitionsArray = generateNewDefinitions([{ _id: 'my parameter name' }], secondDefinition);
      expect(updatedDefinitionsArray.length).toBe(2);
      expect(updatedDefinitionsArray[1]._id).toBe('my second parameter');
    });

    it('outputs an API friendly payload object for parameters', () => {
      const parametersSetting = findSettingsObject('parameters');
      const newDefinition = {
        _id: 'my parameter name',
        parameterName: 'my parameter name',
      };
      const newDefinitionsArray = generateNewDefinitions([], newDefinition);

      parametersSetting.definitions.push(...newDefinitionsArray);
      expect(reportPayload(reportSettings.value)).toEqual({
        parameters: {
          'my parameter name': {
            profile_attribute: undefined,
            source: undefined,
            type: undefined,
          },
        },
      });
    });

    it('removes an existing definition', () => {
      const definitionNameBeingDeleted = 'my parameter name';
      const { definitions } = findSettingsObject('parameters');
      const [firstDefinition] = definitions;
      expect(firstDefinition._id).toBe(definitionNameBeingDeleted);

      const updatedDefinitionsArray = generateNewDefinitions(definitions, definitionNameBeingDeleted);
      expect(updatedDefinitionsArray.length).toBe(0);
    });
  });
});
