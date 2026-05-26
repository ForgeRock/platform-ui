/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { getCertificationUserFilter } from '@forgerock/platform-shared/src/api/governance/CertificationApi';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrSearchInput from '@forgerock/platform-shared/src/components/SearchInput';
import FrGovResourceSelect from '@forgerock/platform-shared/src/components/governance/GovResourceSelect';
import accessConstants from '../../../Access/utils/accessConstants';
import i18n from '@/i18n';

const defaultUserValue = {
  value: '',
  text: i18n.global.t('governance.certificationTask.allUsers'),
};

export function getInitialFilterData() {
  return {
    neverCertified: {
      value: false,
      grantTypes: [accessConstants.GRANT_TYPES.ACCOUNT, accessConstants.GRANT_TYPES.ENTITLEMENT, accessConstants.GRANT_TYPES.ROLE],
    },
    roleBased: {
      value: false,
      grantTypes: [accessConstants.GRANT_TYPES.ACCOUNT, accessConstants.GRANT_TYPES.ENTITLEMENT],
    },
    conditionalRoles: {
      value: false,
      grantTypes: [accessConstants.GRANT_TYPES.ROLE],
    },
    directRoles: {
      value: false,
      grantTypes: [accessConstants.GRANT_TYPES.ROLE],
    },
    roleName: {
      value: '',
      grantTypes: [accessConstants.GRANT_TYPES.ROLE],
    },
    applications: {
      value: '',
      grantTypes: [accessConstants.GRANT_TYPES.ACCOUNT, accessConstants.GRANT_TYPES.ENTITLEMENT],
    },
    entitlementName: {
      value: '',
      grantTypes: [accessConstants.GRANT_TYPES.ENTITLEMENT],
    },
    certify: {
      value: true,
      grantTypes: [accessConstants.GRANT_TYPES.ACCOUNT, accessConstants.GRANT_TYPES.ENTITLEMENT],
    },
    revoke: {
      value: true,
      grantTypes: [accessConstants.GRANT_TYPES.ACCOUNT, accessConstants.GRANT_TYPES.ENTITLEMENT],
    },
    noDecision: {
      value: true,
      grantTypes: [accessConstants.GRANT_TYPES.ACCOUNT, accessConstants.GRANT_TYPES.ENTITLEMENT],
    },
    exception: {
      value: true,
      grantTypes: [accessConstants.GRANT_TYPES.ACCOUNT, accessConstants.GRANT_TYPES.ENTITLEMENT],
    },
    user: {
      value: '',
      grantTypes: [accessConstants.GRANT_TYPES.ACCOUNT, accessConstants.GRANT_TYPES.ENTITLEMENT],
    },
  };
}
const filterData = getInitialFilterData();
export const ROLE_FILTERS = {
  name: i18n.global.t('common.role'),
  filters: {
    roleName: {
      operator: 'CONTAINS',
      path: 'role.name',
    },
    conditionalRoles: {
      operator: 'EQUALS',
      path: 'relationship.properties.grantTypes.conditional',
      value: true,
    },
    directRoles: {
      not: true,
      operator: 'EQUALS',
      path: 'relationship.properties.grantTypes.conditional',
      value: null,
    },
  },
  components: [
    {
      id: 'role-search',
      component: FrSearchInput,
      modelKey: 'roleName',
      props: {
        'display-text': filterData?.roleName.value,
        placeholder: i18n.global.t('common.role'),
        class: 'w-100 mb-4',
        name: 'roleName',
      },
    },
    {
      id: 'conditional-roles',
      component: FrField,
      modelKey: 'conditionalRoles',
      props: {
        type: 'checkbox',
        class: 'mr-2',
        label: i18n.global.t('governance.access.filter.conditional'),
        value: filterData?.conditionalRoles.value,
        name: 'conditionalRoles',
      },
    },
    {
      id: 'direct-roles',
      component: FrField,
      modelKey: 'directRoles',
      props: {
        type: 'checkbox',
        class: 'mr-2',
        label: i18n.global.t('governance.access.filter.direct'),
        value: filterData?.directRoles.value,
        name: 'directRoles',
      },
    },
  ],
};
export const ENTITLEMENT_FILTERS = {
  name: i18n.global.t('common.entitlement'),
  filters: {
    entitlementName: {
      operator: 'CONTAINS',
      path: 'descriptor.idx./entitlement.displayName',
    },
  },
  components: [{
    id: 'entitlement-search',
    component: FrSearchInput,
    props: {
      'display-text': filterData?.entitlementName.value,
      placeholder: i18n.global.t('common.displayName'),
      class: 'w-100 mb-4',
      name: 'entitlementName',
    },
  }],
};
export const GENERAL_FILTERS = {
  name: i18n.global.t('governance.access.filter.generalFilters'),
  filters: {
    neverCertified: {
      not: true,
      operator: 'EXISTS',
      path: 'item.decision.certification.decision',
      value: null,
    },
    roleBased: {
      operator: 'EQUALS',
      path: 'relationship.properties.grantTypes.grantType',
      value: 'role',
    },
  },
  components: [
    {
      id: 'never-certified',
      component: FrField,
      modelKey: 'neverCertified',
      props: {
        value: filterData?.neverCertified.value,
        type: 'checkbox',
        class: 'mr-2',
        label: i18n.global.t('governance.access.filter.neverCertified'),
        name: 'neverCertified',
      },
    },
    {
      id: 'role-based',
      component: FrField,
      modelKey: 'roleBased',
      props: {
        value: filterData?.roleBased.value,
        type: 'checkbox',
        class: 'mr-2',
        label: i18n.global.t('governance.access.filter.roleBased'),
        name: 'roleBased',
      },
    }],
};
export const APPLICATION_FILTERS = {
  name: i18n.global.t('common.application'),
  filters: {
    applications: {
      operator: 'IN',
      path: 'application.id',
    },
  },
  components: [
    {
      id: 'application-search',
      component: FrGovResourceSelect,
      props: {
        fields: ['name'],
        class: 'mb-4 pt-2',
        label: i18n.global.t('common.application'),
        'filter-schema': true,
        'resource-path': 'alpha_application',
        'initial-data': {
          id: '',
        },
        'first-option': {
          id: '',
          name: '',
          templateName: '',
          text: '',
          value: '',
        },
        value: false,
        name: 'applications',
      },
    },
  ],
};
export const CERTIFICATION_FILTERS = {
  name: i18n.global.t('governance.access.filter.certification'),
  filters: {
    certify: {
      operator: 'EXISTS',
      path: 'item.decision.certification.decision',
      value: null,
    },
    revoke: {
      operator: 'EXISTS',
      path: 'item.decision.certification.decision',
      value: null,
    },
    exception: {
      operator: 'EXISTS',
      path: 'item.decision.certification.decision',
      value: null,
    },
    noDecision: {
      not: true,
      operator: 'EXISTS',
      path: 'item.decision.certification.decision',
      value: null,
    },
  },
  components: [
    {
      id: 'certify',
      component: FrField,
      modelKey: 'certify',
      props: {
        value: filterData?.certify.value,
        type: 'checkbox',
        class: 'mr-2',
        label: i18n.global.t('governance.certificationTask.certified'),
        name: 'certify',
      },
    },
    {
      id: 'revoke',
      component: FrField,
      modelKey: 'revoke',
      props: {
        value: filterData?.revoke.value,
        type: 'checkbox',
        class: 'mr-2',
        label: i18n.global.t('governance.certificationTask.revoked'),
        name: 'revoke',
      },
    },
    {
      id: 'exception',
      component: FrField,
      modelKey: 'exception',
      props: {
        value: filterData?.exception.value,
        type: 'checkbox',
        class: 'mr-2',
        label: i18n.global.t('governance.certificationTask.exceptionAllowed'),
        name: 'exception',
      },
    },
    {
      id: 'noDecision',
      component: FrField,
      modelKey: 'noDecision',
      props: {
        value: filterData?.noDecision.value,
        type: 'checkbox',
        class: 'mr-2',
        label: i18n.global.t('governance.certificationTask.noDecision'),
        name: 'noDecision',
      },
    }],
};
export const USER_FILTERS = {
  name: i18n.global.t('common.user.user'),
  filters: {
    user: {
      operator: 'EQUALS',
      path: 'user.id',
      value: null,
    },
  },
  components: [
    {
      id: 'user',
      component: FrField,
      modelKey: 'user',
      props: {
        class: 'text-muted w-100 certification-task-filter-dropdown certification-task-filter-list',
        id: 'certificationTaskUser',
        type: 'select',
        label: i18n.global.t('governance.certificationTask.user'),
        options: [],
        value: filterData?.user.value,
        name: 'user',
      },
      on: {},
    }],
};
export const ACCOUNT_FILTERS = {
  name: i18n.global.t('common.account'),
  filters: {
  },
  components: [],
};

const initialFilterStates = {
  USER_FILTERS: {
    components: [...USER_FILTERS.components],
    filters: { ...USER_FILTERS.filters },
  },
  APPLICATION_FILTERS: {
    components: [...APPLICATION_FILTERS.components],
    filters: { ...APPLICATION_FILTERS.filters },
  },
  ENTITLEMENT_FILTERS: {
    components: [...ENTITLEMENT_FILTERS.components],
    filters: { ...ENTITLEMENT_FILTERS.filters },
  },
  CERTIFICATION_FILTERS: {
    components: [...CERTIFICATION_FILTERS.components],
    filters: { ...CERTIFICATION_FILTERS.filters },
  },
  ROLE_FILTERS: {
    components: [...ROLE_FILTERS.components],
    filters: { ...ROLE_FILTERS.filters },
  },
  ACCOUNT_FILTERS: {
    components: [...ACCOUNT_FILTERS.components],
    filters: { ...ACCOUNT_FILTERS.filters },
  },
};

export function resetFilterTypes() {
  USER_FILTERS.components = [...initialFilterStates.USER_FILTERS.components];
  USER_FILTERS.filters = { ...initialFilterStates.USER_FILTERS.filters };
  APPLICATION_FILTERS.components = [...initialFilterStates.APPLICATION_FILTERS.components];
  APPLICATION_FILTERS.filters = { ...initialFilterStates.APPLICATION_FILTERS.filters };
  ENTITLEMENT_FILTERS.components = [...initialFilterStates.ENTITLEMENT_FILTERS.components];
  ENTITLEMENT_FILTERS.filters = { ...initialFilterStates.ENTITLEMENT_FILTERS.filters };
  CERTIFICATION_FILTERS.components = [...initialFilterStates.CERTIFICATION_FILTERS.components];
  CERTIFICATION_FILTERS.filters = { ...initialFilterStates.CERTIFICATION_FILTERS.filters };
  ROLE_FILTERS.components = [...initialFilterStates.ROLE_FILTERS.components];
  ROLE_FILTERS.filters = { ...initialFilterStates.ROLE_FILTERS.filters };
  ACCOUNT_FILTERS.components = [...initialFilterStates.ACCOUNT_FILTERS.components];
  ACCOUNT_FILTERS.filters = { ...initialFilterStates.ACCOUNT_FILTERS.filters };
}

export async function getUserInfoFilter(campaignId, actorId, queryString) {
  return getCertificationUserFilter(campaignId, actorId, queryString)
    .then(({ data }) => {
      const users = data.map((user) => ({
        ...user,
        value: user?.id,
        text: [user?.givenName, user?.sn, user?.mail].join(' '),
      }));
      return [defaultUserValue, ...users];
    }).catch((error) => {
      showErrorMessage(error, i18n.global.t('governance.certificationTask.errors.filterError'));
      return [defaultUserValue];
    });
}

export async function generateFilter(certificationGrantType, campaignId, actorId, queryString, debounceUserSearch) {
  USER_FILTERS.components[0].props.options = await getUserInfoFilter(campaignId, actorId, queryString);
  USER_FILTERS.components[0].on = {
    searchChange: (value) => {
      debounceUserSearch(value);
    },
  };
  const filters = {
    general: GENERAL_FILTERS,
    certs: CERTIFICATION_FILTERS,
  };
  switch (certificationGrantType) {
    case 'roles':
      filters.role = ROLE_FILTERS;
      filters.user = USER_FILTERS;
      return filters;
    case 'entitlements':
    case 'entitlementComposition':
      filters.application = APPLICATION_FILTERS;
      filters.entitlement = ENTITLEMENT_FILTERS;
      filters.user = USER_FILTERS;
      filters.account = ACCOUNT_FILTERS;
      return filters;
    default:
      filters.application = APPLICATION_FILTERS;
      filters.user = USER_FILTERS;
      filters.account = ACCOUNT_FILTERS;
      return filters;
  }
}

export function addFilterTypes(newFilter, type) {
  switch (type) {
    case 'user':
      USER_FILTERS.components = [...USER_FILTERS.components, ...newFilter.components];
      USER_FILTERS.filters = { ...USER_FILTERS.filters, ...newFilter.filters };
      break;
    case 'application':
      APPLICATION_FILTERS.components = [...APPLICATION_FILTERS.components, ...newFilter.components];
      APPLICATION_FILTERS.filters = { ...APPLICATION_FILTERS.filters, ...newFilter.filters };
      break;
    case 'entitlement':
      ENTITLEMENT_FILTERS.components = [...ENTITLEMENT_FILTERS.components, ...newFilter.components];
      ENTITLEMENT_FILTERS.filters = { ...ENTITLEMENT_FILTERS.filters, ...newFilter.filters };
      break;
    case 'decision':
      CERTIFICATION_FILTERS.components = [...CERTIFICATION_FILTERS.components, ...newFilter.components];
      CERTIFICATION_FILTERS.filters = { ...CERTIFICATION_FILTERS.filters, ...newFilter.filters };
      break;
    case 'role':
      ROLE_FILTERS.components = [...ROLE_FILTERS.components, ...newFilter.components];
      ROLE_FILTERS.filters = { ...ROLE_FILTERS.filters, ...newFilter.filters };
      break;
    case 'account':
      ACCOUNT_FILTERS.components = [...ACCOUNT_FILTERS.components, ...newFilter.components];
      ACCOUNT_FILTERS.filters = { ...ACCOUNT_FILTERS.filters, ...newFilter.filters };
      break;
    default:
      break;
  }
}
