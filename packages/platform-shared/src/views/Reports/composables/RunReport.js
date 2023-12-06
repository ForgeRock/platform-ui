/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { ref } from 'vue';
import {
  managedResourcePropertyRequest,
  relationshipPropertyRequest,
  requestTrees,
} from '@forgerock/platform-shared/src/utils/reportsUtils';
import { actionGetAllTrees } from '@forgerock/platform-shared/src/api/TreeApi';
import store from '@/store';
import i18n from '@/i18n';

export default function useRunReport(
  applicationsModel,
  applicationsRelationshipProperty,
  endDateModel,
  eventTypesModel,
  journeysModel,
  journeyOptions,
  membersRelationshipProperty,
  organizationOptions,
  organizationsModel,
  outcomeModel,
  roleOptions,
  rolesModel,
  startDateModel,
  statusModel,
  usersModel,
) {
  /**
   * Journey field schema extracted because both the journeyName
   * and treeName properties point to the same component.
   */
  const journeyFieldMap = {
    label: i18n.t('common.journeys'),
    config: {
      model: journeyOptions,
      viewable: store.state.SharedStore.currentPackage === 'admin',
    },
    payload: journeysModel,
    fetch: () => requestTrees(actionGetAllTrees),
  };

  /**
   * Schema that handles data to fetch and model.
   * NOTE: If a fetch request is conditional, then a property titled 'viewable'
   * can be added to the config oject which will prevent the fetch from executing
   * when the condition is false. The UI will then display a generic text field
   * that corresponds with the given parameter.
   */
  const _REPORT_FIELDS_CONTROLLER = {
    accountStatus: {
      label: i18n.t('reports.tabs.runReport.parameters.accountStatus'),
      payload: statusModel,
    },
    applications: {
      label: i18n.t('common.applications'),
      config: {
        managedObject: 'user',
        schemaProperty: 'applications',
        model: applicationsRelationshipProperty,
      },
      payload: applicationsModel,
      fetch: () => relationshipPropertyRequest(_REPORT_FIELDS_CONTROLLER.applications.config),
    },
    endDate: {
      label: i18n.t('reports.tabs.runReport.parameters.endDate'),
      payload: endDateModel,
    },
    events: {
      label: i18n.t('reports.tabs.runReport.parameters.eventTypes'),
      payload: eventTypesModel,
    },
    journeyName: journeyFieldMap,
    org_names: {
      label: i18n.t('reports.tabs.runReport.organizations'),
      config: {
        managedObject: 'organization',
        model: organizationOptions,
      },
      payload: organizationsModel,
      fetch: () => managedResourcePropertyRequest(_REPORT_FIELDS_CONTROLLER.org_names.config),
    },
    realm: {
      payload: ref(store.state.realm),
    },
    roles: {
      label: i18n.t('common.applications'),
      config: {
        managedObject: 'role',
        model: roleOptions,
      },
      payload: rolesModel,
      fetch: () => managedResourcePropertyRequest(_REPORT_FIELDS_CONTROLLER.roles.config),
    },
    startDate: {
      label: i18n.t('reports.tabs.runReport.parameters.startDate'),
      payload: startDateModel,
    },
    status: {
      label: i18n.t('common.status'),
      payload: statusModel,
    },
    treeName: journeyFieldMap,
    treeResult: {
      label: i18n.t('common.outcomes'),
      payload: outcomeModel,
    },
    user_names: {
      label: i18n.t('common.users'),
      config: {
        managedObject: 'application',
        schemaProperty: 'members',
        model: membersRelationshipProperty,
      },
      payload: usersModel,
      fetch: () => relationshipPropertyRequest(_REPORT_FIELDS_CONTROLLER.user_names.config),
    },
  };

  return {
    _REPORT_FIELDS_CONTROLLER,
  };
}
