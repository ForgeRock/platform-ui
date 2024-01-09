/**
 * Copyright (c) 2023-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { ref } from 'vue';
import {
  getCertificationsForReports,
  getOauth2Clients,
  managedResourcePropertyRequest,
  requestTrees,
} from '@forgerock/platform-shared/src/utils/reportsUtils';
import store from '@/store';
import i18n from '@/i18n';

export default function useRunReport(
  applicationsModel,
  applicationOptions,
  campaignNameModel,
  campaignNameOptions,
  campaignStatusModel,
  endDateModel,
  journeysModel,
  journeyOptions,
  oAuthApplicationOptions,
  oAuthApplicationsModel,
  organizationsModel,
  orgOptions,
  outcomeModel,
  rolesModel,
  rolesOptions,
  startDateModel,
  statusModel,
  usersModel,
  usersOptions,
) {
  /**
   * Journey field schema extracted because both the journeyName
   * and treeName properties point to the same component.
   */
  const journeyFieldMap = {
    label: i18n.global.t('common.journeys'),
    config: {
      model: journeyOptions,
      fields: '_id',
      viewable: store.state.SharedStore.currentPackage === 'admin',
    },
    payload: journeysModel,
    fetch: requestTrees,
  };

  /**
   * Schema that handles data to fetch and model.
   * NOTE: If a fetch request is conditional, then a property titled 'viewable'
   * can be added to the config oject which will prevent the fetch from executing
   * when the condition is false. The UI will then display a field that
   * corresponds with the given parameter type.
   */
  const _REPORT_FIELDS_CONTROLLER = {
    accountStatus: {
      label: i18n.global.t('reports.tabs.runReport.parameters.accountStatus'),
      payload: statusModel,
    },
    applications: {
      label: i18n.global.t('common.applications'),
      config: {
        managedObject: 'application',
        model: applicationOptions,
        fields: 'name',
      },
      payload: applicationsModel,
      fetch: managedResourcePropertyRequest,
    },
    campaign_name: {
      label: i18n.global.t('reports.tabs.runReport.parameters.campaignName'),
      config: {
        model: campaignNameOptions,
      },
      payload: campaignNameModel,
      fetch: getCertificationsForReports,
    },
    campaign_status: {
      label: i18n.global.t('reports.tabs.runReport.parameters.campaignStatus'),
      payload: campaignStatusModel,
    },
    endDate: {
      label: i18n.global.t('reports.tabs.runReport.parameters.endDate'),
      payload: endDateModel,
    },
    journeyName: journeyFieldMap,
    oauth2_applications: {
      label: i18n.global.t('reports.tabs.runReport.applications.OAuth2Applications'),
      config: {
        model: oAuthApplicationOptions,
        fields: '_id',
        viewable: store.state.SharedStore.currentPackage === 'admin',
      },
      payload: oAuthApplicationsModel,
      fetch: getOauth2Clients,
    },
    org_names: {
      label: i18n.global.t('reports.tabs.runReport.organizations'),
      config: {
        managedObject: 'organization',
        model: orgOptions,
        fields: 'name',
      },
      payload: organizationsModel,
      fetch: managedResourcePropertyRequest,
    },
    realm: {
      payload: ref(store.state.realm),
    },
    roles: {
      label: i18n.global.t('common.roles'),
      config: {
        managedObject: 'role',
        model: rolesOptions,
        fields: 'name',
      },
      payload: rolesModel,
      fetch: managedResourcePropertyRequest,
    },
    startDate: {
      label: i18n.global.t('reports.tabs.runReport.parameters.startDate'),
      payload: startDateModel,
    },
    status: {
      label: i18n.global.t('common.status'),
      payload: statusModel,
    },
    treeName: journeyFieldMap,
    treeResult: {
      label: i18n.global.t('common.outcomes'),
      payload: outcomeModel,
    },
    user_names: {
      label: i18n.global.t('common.users'),
      config: {
        managedObject: 'user',
        model: usersOptions,
        fields: 'userName',
      },
      payload: usersModel,
      fetch: managedResourcePropertyRequest,
    },
  };

  return {
    _REPORT_FIELDS_CONTROLLER,
  };
}
