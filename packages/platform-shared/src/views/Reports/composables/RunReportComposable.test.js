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

  const { _REPORT_FIELDS_CONTROLLER: controller } = useRunReport();
  const managedResourcePropertyRequestSpy = jest.spyOn(ReportsUtils, 'managedResourcePropertyRequest');
  const requestTreesSpy = jest.spyOn(ReportsUtils, 'requestTrees');

  describe('@fetch', () => {
    it('ensures that the applications property fetches with expected config data', async () => {
      await controller.applications.fetch();
      expect(managedResourcePropertyRequestSpy).toHaveBeenCalled();
    });

    it('ensures that the org_names property fetches with expected config data', async () => {
      await controller.org_names.fetch();
      expect(managedResourcePropertyRequestSpy).toHaveBeenCalled();
    });

    it('ensures that the journeyName property fetches with expected config data', async () => {
      await controller.journeyName.fetch();
      expect(requestTreesSpy).toHaveBeenCalled();
    });

    it('ensures that the treeName property fetches with expected config data', async () => {
      await controller.treeName.fetch();
      expect(requestTreesSpy).toHaveBeenCalled();
    });

    it('ensures that the user_names property fetches with expected config data', async () => {
      await controller.user_names.fetch();
      expect(managedResourcePropertyRequestSpy).toHaveBeenCalled();
    });

    it('ensures that the roles property fetches with expected config data', async () => {
      await controller.roles.fetch();
      expect(managedResourcePropertyRequestSpy).toHaveBeenCalled();
    });
  });

  describe('@unit', () => {
    it('ensures that each field in the controller has a label property', () => {
      // api requires realm for every request but it is not a
      // field so we filter it out for this assertion.
      const filterRealmFromFields = Object.keys(controller).filter((field) => field !== 'realm');
      filterRealmFromFields.forEach((field) => {
        expect(Object.prototype.hasOwnProperty.call(controller[field], 'label')).toBe(true);
      });
    });

    it('ensures that each field in the controller has a payload property', () => {
      Object.keys(controller).forEach((field) => {
        expect(Object.prototype.hasOwnProperty.call(controller[field], 'payload')).toBe(true);
      });
    });
  });
});
