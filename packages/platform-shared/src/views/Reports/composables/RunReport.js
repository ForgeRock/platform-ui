/**
 * Copyright (c) 2023-2025 ForgeRock. All rights reserved.
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

export default function useRunReport() {
  const campaignStatusOptionsMap = {
    [i18n.global.t('reports.tabs.runReport.campaignStatus.inProgress')]: 'in-progress',
    [i18n.global.t('reports.tabs.runReport.campaignStatus.signedOff')]: 'signed-off',
  };

  const outcomeOptionsMap = {
    [i18n.global.t('common.successful')]: 'successful',
    [i18n.global.t('common.failed')]: 'failed',
    [i18n.global.t('common.continue')]: 'continue',
  };

  const statusOptionsMap = {
    [i18n.global.t('reports.tabs.runReport.status.active')]: 'active',
    [i18n.global.t('reports.tabs.runReport.status.inactive')]: 'inactive',
    [i18n.global.t('reports.tabs.runReport.status.blocked')]: 'blocked',
  };

  /**
   * Used for mapping field type names that come from the API,
   * to the field type names that the field component expects.
   */
  const fieldTypeMap = {
    array: 'multiselect',
    boolean: 'boolean',
    date: 'date',
    float: 'number',
    integer: 'number',
    select: 'select',
    string: 'string',
  };

  /**
   * @description
   * Schema for handling parameters that are not mapped to the _PARAMETERS_CONTROLLER.
  */
  class UnmappedParametersSchema {
    constructor(args) {
      this.component = args.component;
      this.label = args.label;
      this.placeholder = args.placeholder;
      this.type = args.type;
      this.payload = args.payload;
      if (args.enums) this.enums = args.enums;
      if (args.mutation) this.mutation = args.mutation;
    }

    static dateMutation(date) {
      return Date.parse(date) ? new Date(date).toISOString() : date;
    }

    static enumMutation(list) {
      return list.map(({ name, value }) => ({ text: name, value }));
    }
  }

  /**
   * Journey field schema extracted because both the journeyName
   * and treeName properties point to the same component.
   */
  const journeyFieldMap = {
    component: 'FrReportsMultiSelect',
    label: i18n.global.t('common.journeys'),
    config: {
      fetch: requestTrees,
      model: [],
      mutation: (model) => model.map(({ _id }) => _id),
      fields: '_id',
      internalSearch: true,
      canFetch: store.state.SharedStore.currentPackage === 'admin',
    },
    payload: [],
    testId: 'fr-field-journeys',
  };

  /**
   * @description
   * Schema that handles data to fetch and model for displaying
   * pre-packaged report fields.
   *
   * CONFIG PROPERTIES:
   * fetch: Function to fetch data
   * model: Property where the fetched data gets injected
   * mutation: Function to transform the model data
   * managedObject: Managed object name to query
   * fields: queryFilter fields parameter
   * canFetch: Conditional to determine if the fetch should execute
   * internalSearch: Flag to enable internal search for the multiselect component
   * singleSelection: Flag to enable single selection for the multiselect component
   * taggable: Flag to enable user input tags for the multiselect component
   */
  const _PARAMETERS_CONTROLLER = {
    accountStatus: {
      component: 'FrReportsMultiSelect',
      label: i18n.global.t('reports.tabs.runReport.parameters.accountStatus'),
      config: {
        model: Object.keys(statusOptionsMap),
        internalSearch: true,
        taggable: true,
      },
      payload: Object.values(statusOptionsMap),
      mutation: (payload) => payload.map((status) => statusOptionsMap[status] || status),
      testId: 'fr-field-account-status',
    },
    applications: {
      component: 'FrReportsMultiSelect',
      label: i18n.global.t('common.applications'),
      config: {
        fetch: managedResourcePropertyRequest,
        model: [],
        mutation: (model) => model.map(({ name }) => name),
        managedObject: 'application',
        fields: 'name',
        canFetch: store.state.SharedStore.currentPackage === 'admin',
      },
      payload: [],
      testId: 'fr-field-applications',
    },
    campaign_name: {
      component: 'FrReportsMultiSelect',
      label: i18n.global.t('reports.tabs.runReport.parameters.campaignName'),
      config: {
        fetch: getCertificationsForReports,
        model: [],
        mutation: (model) => model.map(({ name }) => name),
        internalSearch: true,
        singleSelection: true,
      },
      payload: [],
      testId: 'fr-field-campaign-name',
    },
    campaign_status: {
      component: 'FrReportsMultiSelect',
      label: i18n.global.t('reports.tabs.runReport.parameters.campaignStatus'),
      config: {
        model: Object.keys(campaignStatusOptionsMap),
        internalSearch: true,
        singleSelection: true,
      },
      payload: '',
      mutation: (payload) => campaignStatusOptionsMap[payload] || '',
      testId: 'fr-field-campaign-status',
    },
    endDate: { payload: '' },
    journeyName: journeyFieldMap,
    oauth2_applications: {
      component: 'FrReportsMultiSelect',
      label: i18n.global.t('reports.tabs.runReport.applications.OAuth2Applications'),
      config: {
        fetch: getOauth2Clients,
        model: [],
        mutation: (model) => model.map(({ _id }) => _id),
        fields: '_id',
        canFetch: store.state.SharedStore.currentPackage === 'admin',
      },
      payload: [],
      testId: 'fr-field-oauth-applications',
    },
    org_names: {
      component: 'FrReportsMultiSelect',
      label: i18n.global.t('reports.tabs.runReport.organizations'),
      config: {
        fetch: managedResourcePropertyRequest,
        model: [],
        mutation: (model) => model.map(({ name }) => name),
        managedObject: 'organization',
        fields: 'name',
        canFetch: store.state.SharedStore.currentPackage === 'admin',
      },
      payload: [],
      testId: 'fr-field-organizations',
    },
    realm: {
      payload: ref(store.state.realm),
    },
    roles: {
      component: 'FrReportsMultiSelect',
      label: i18n.global.t('common.roles'),
      config: {
        fetch: managedResourcePropertyRequest,
        model: [],
        mutation: (model) => model.map(({ name }) => name),
        managedObject: 'role',
        fields: 'name',
        canFetch: store.state.SharedStore.currentPackage === 'admin',
      },
      payload: [],
      testId: 'fr-field-roles',
    },
    startDate: {
      component: 'FrTimeframeField',
      label: i18n.global.t('reports.tabs.runReport.timeframe.label'),
      payload: '',
    },
    status: {
      component: 'FrReportsMultiSelect',
      label: i18n.global.t('common.status'),
      config: {
        model: Object.keys(statusOptionsMap),
        internalSearch: true,
        taggable: true,
      },
      payload: Object.values(statusOptionsMap),
      mutation: (payload) => payload.map((status) => statusOptionsMap[status] || status),
      testId: 'fr-field-status',
    },
    treeName: journeyFieldMap,
    treeResult: {
      component: 'FrReportsMultiSelect',
      label: i18n.global.t('common.outcomes'),
      config: {
        model: Object.keys(outcomeOptionsMap),
        internalSearch: true,
      },
      payload: Object.keys(outcomeOptionsMap),
      mutation: (payload) => payload.map((outcome) => (outcome in outcomeOptionsMap
        ? outcomeOptionsMap[outcome].toUpperCase()
        : outcome)),
      testId: 'fr-field-outcome',
    },
    user_names: {
      component: 'FrReportsMultiSelect',
      label: i18n.global.t('common.users'),
      config: {
        fetch: managedResourcePropertyRequest,
        model: [],
        mutation: (model) => model.map(({ userName }) => userName),
        managedObject: 'user',
        fields: 'userName',
        canFetch: store.state.SharedStore.currentPackage === 'admin',
      },
      payload: [],
      testId: 'fr-field-users',
    },
  };

  return {
    _PARAMETERS_CONTROLLER,
    fieldTypeMap,
    UnmappedParametersSchema,
  };
}
