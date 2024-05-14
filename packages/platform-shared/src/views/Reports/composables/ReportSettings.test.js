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
      const newDefinition = { parameterName: 'my parameter name' };
      // middle argument is the definition index (if undefined or -1 means it is a new definition)
      const newDefinitionsArray = generateNewDefinitions([], -1, newDefinition);
      expect(newDefinitionsArray.length).toBe(1);
      expect(newDefinitionsArray[0].parameterName).toBe('my parameter name');
    });

    it('generates a new list of definitions with the provided definition object and existing list', () => {
      const secondDefinition = { parameterName: 'my second parameter' };
      // middle argument is the definition index (if undefined or -1 means it is a new definition)
      const updatedDefinitionsArray = generateNewDefinitions([{ parameterName: 'my parameter name' }], -1, secondDefinition);
      expect(updatedDefinitionsArray.length).toBe(2);
      expect(updatedDefinitionsArray[1].parameterName).toBe('my second parameter');
    });

    it('updates an existing definition', () => {
      const firstDefinitionUpdated = { parameterName: 'my first parameter with updated name' };
      // middle argument is the definition index
      const updatedDefinitionsArray = generateNewDefinitions([{ parameterName: 'my first parameter existing' }], 0, firstDefinitionUpdated);
      expect(updatedDefinitionsArray.length).toBe(1);
      expect(updatedDefinitionsArray[0].parameterName).toBe('my first parameter with updated name');
    });

    it('outputs an API friendly payload object for parameters', () => {
      const parametersSetting = findSettingsObject('parameters');
      const newDefinition = { parameterName: 'my parameter name' };
      // middle argument is the definition index (if undefined or -1 means it is a new definition)
      const newDefinitionsArray = generateNewDefinitions([], -1, newDefinition);

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
      const { definitions } = findSettingsObject('parameters');
      expect(definitions.length).toBe(1);

      // Middle argument is the definition index (if undefined or -1 means it is a new definition).
      // If third argument not present, it means the definition in the provided index
      // (second argument) is intended to be deleted.
      const updatedDefinitionsArray = generateNewDefinitions(definitions, 0);
      expect(updatedDefinitionsArray.length).toBe(0);
    });
  });
});
