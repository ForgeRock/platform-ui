/**
 * Copyright (c) 2023-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as ReportsUtils from '@forgerock/platform-shared/src/utils/reportsUtils';
import * as TreeApi from '@/api/TreeApi';
import useRunReport from './RunReport';

describe('@useRunReport', () => {
  ReportsUtils.relationshipPropertyRequest = jest.fn();
  ReportsUtils.managedResourcePropertyRequest = jest.fn();
  ReportsUtils.requestTrees = jest.fn();
  TreeApi.actionGetAllTrees = jest.fn();

  const {
    _PARAMETERS_CONTROLLER: controller,
    UnmappedParametersSchema,
  } = useRunReport();
  const managedResourcePropertyRequestSpy = jest.spyOn(ReportsUtils, 'managedResourcePropertyRequest');
  const requestTreesSpy = jest.spyOn(ReportsUtils, 'requestTrees');

  describe('@fetch', () => {
    it('ensures that the applications property fetches with expected config data', async () => {
      await controller.applications.config.fetch();
      expect(managedResourcePropertyRequestSpy).toHaveBeenCalled();
    });

    it('ensures that the org_names property fetches with expected config data', async () => {
      await controller.org_names.config.fetch();
      expect(managedResourcePropertyRequestSpy).toHaveBeenCalled();
    });

    it('ensures that the journeyName property fetches with expected config data', async () => {
      await controller.journeyName.config.fetch();
      expect(requestTreesSpy).toHaveBeenCalled();
    });

    it('ensures that the treeName property fetches with expected config data', async () => {
      await controller.treeName.config.fetch();
      expect(requestTreesSpy).toHaveBeenCalled();
    });

    it('ensures that the user_names property fetches with expected config data', async () => {
      await controller.user_names.config.fetch();
      expect(managedResourcePropertyRequestSpy).toHaveBeenCalled();
    });

    it('ensures that the roles property fetches with expected config data', async () => {
      await controller.roles.config.fetch();
      expect(managedResourcePropertyRequestSpy).toHaveBeenCalled();
    });
  });

  describe('@unit', () => {
    it('ensures that each field in the controller has a payload property', () => {
      Object.keys(controller).forEach((field) => {
        expect(Object.prototype.hasOwnProperty.call(controller[field], 'payload')).toBe(true);
      });
    });

    it('ensures that the unmapped parameters schema has the expected properties', () => {
      const unmappedParametersSchema = new UnmappedParametersSchema({
        component: 'FrInput',
        label: 'Label',
        placeholder: 'placeholder',
        type: 'string',
        payload: '',
        enums: [{ name: 'enum1', value: 'enum1' }],
        mutation: (model) => model,
      });
      expect(unmappedParametersSchema.component).toBe('FrInput');
      expect(unmappedParametersSchema.label).toBe('Label');
      expect(unmappedParametersSchema.placeholder).toBe('placeholder');
      expect(unmappedParametersSchema.type).toBe('string');
      expect(unmappedParametersSchema.payload).toBe('');
      expect(unmappedParametersSchema.enums).toEqual([{ name: 'enum1', value: 'enum1' }]);
      expect(unmappedParametersSchema.mutation).toBeInstanceOf(Function);
    });
  });
});
