/**
 * Copyright 2023-2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import {
  cloneDeep,
  isEmpty,
  isEqual,
  isNil,
} from 'lodash';
import { getGovernanceFilter } from '@forgerock/platform-shared/src/utils/governance/filters';
import BaseTemplate from '@forgerock/platform-shared/src/views/Governance/Certification/Templates/EditTemplate/templateBase.json';
import { uiTypeMap } from '@forgerock/platform-shared/src/views/Governance/Certification/Templates/templateTypes';
import { getNameFromDisplayName, getDisplayNamefromName } from '@forgerock/platform-shared/src/views/Governance/utils/events';
import i18n from '@/i18n';

function getDayDuration(duration, interval) {
  if (interval === i18n.global.t('governance.timespans.days')) return duration;
  if (interval === i18n.global.t('governance.timespans.weeks')) return duration * 7;
  if (interval === i18n.global.t('governance.timespans.months')) return duration * 30;
  if (interval === i18n.global.t('governance.timespans.years')) return duration * 365;
  return 0;
}

export function getAllFilter() {
  return {
    operator: 'ALL',
    operand: [],
  };
}

export function getAllNonAuthoritativeApplications() {
  return {
    operator: 'EQUALS',
    operand: {
      targetName: 'authoritative',
      targetValue: false,
    },
  };
}

export function getSingleFilter(field, value) {
  return {
    operator: 'AND',
    operand: [
      {
        operator: 'EQUALS',
        operand: {
          targetName: field,
          targetValue: value,
        },
      },
    ],
  };
}

export function getEqualityFilter(field, values) {
  const operand = values.map((x) => ({
    operand: {
      targetName: field,
      targetValue: x,
    },
    operator: 'EQUALS',
  }));

  return {
    operator: 'OR',
    operand,
  };
}

export function checkForSingleFilter(filter, field) {
  if (filter.operand?.length === 1) {
    const value = filter.operand[0].operand?.targetValue;
    if (value?.length) {
      const exampleFilter = getSingleFilter(field, value);
      if (isEqual(exampleFilter, filter)) return true;
    }
  }
  return false;
}

function checkForEqualityFilter(filter, field) {
  if (filter.operator === 'OR' && filter.operand.length) {
    let isEqualityFilter = true;
    filter.operand.forEach((x) => {
      if (x.operator !== 'EQUALS' || x.operand.targetName !== field) {
        isEqualityFilter = false;
      }
    });
    return isEqualityFilter;
  }
  return false;
}

export function getFilterGrantByType(enableAccountGrant, enableEntitlementGrant, enableRoleGrant, enableEntitlementCompositionGrant) {
  const filterGrant = [];
  if (enableAccountGrant) filterGrant.push('accountGrant');
  if (enableEntitlementGrant) filterGrant.push('entitlementGrant');
  if (enableRoleGrant) filterGrant.push('roleMembership');
  if (enableEntitlementCompositionGrant) filterGrant.push('entitlement');

  return filterGrant;
}

export function buildSavePayload(type, forms, eventBased) {
  const saveObj = cloneDeep(BaseTemplate);
  saveObj.certificationType = uiTypeMap[type];

  // Details
  const details = forms.FrDetailsForm;
  saveObj.name = eventBased
    ? getNameFromDisplayName(details.name)
    : details.name;
  saveObj.description = details.description;
  saveObj.ownerId = details.owner;
  saveObj.stagingEnabled = details.stagingEnabled;

  // What to Certify
  const what = forms.FrWhat;
  let entitlementFilter = null;
  switch (what.entitlementSelection) {
    case i18n.global.t('governance.editTemplate.allEntitlements'):
      entitlementFilter = getAllFilter();
      break;
    case i18n.global.t('governance.editTemplate.filterEntitlements'):
      entitlementFilter = getGovernanceFilter(what.entitlementFilter);
      break;
    default:
      break;
  }

  let userFilter = null;
  if (eventBased) {
    userFilter = {
      operator: 'EQUALS',
      operand: {
        targetName: 'id',
        targetValue: '{{IGA_PARAM_userId_IGA_PARAM}}',
      },
    };
  } else {
    switch (what.userSelection) {
      case i18n.global.t('governance.editTemplate.allUsers'):
        userFilter = getAllFilter();
        break;
      case i18n.global.t('governance.editTemplate.singleUser'):
        userFilter = getSingleFilter('id', what.singleUser.split('/').pop());
        break;
      case i18n.global.t('governance.editTemplate.filterUsers'):
        userFilter = getGovernanceFilter(what.userFilter);
        break;
      default:
        break;
    }
  }

  let appFilter = null;
  switch (what.appSelection) {
    case i18n.global.t('governance.editTemplate.allApplications'):
      appFilter = getAllNonAuthoritativeApplications();
      break;
    case i18n.global.t('governance.editTemplate.specificApplications'):
      appFilter = getEqualityFilter('id', what.singleApp);
      break;
    case i18n.global.t('governance.editTemplate.filterApplications'):
      appFilter = getGovernanceFilter(what.appFilter);
      break;
    default:
      break;
  }

  let roleFilter = null;
  switch (what.roleSelection) {
    case i18n.global.t('governance.editTemplate.allRoles'):
      roleFilter = getAllFilter();
      break;
    case i18n.global.t('governance.editTemplate.filterRoles'):
      roleFilter = getGovernanceFilter(what.roleFilter);
      break;
    default:
      break;
  }

  let accountFilter;
  switch (what.accountSelection) {
    case i18n.global.t('governance.editTemplate.allAccounts'):
      accountFilter = getAllFilter();
      break;
    case i18n.global.t('governance.editTemplate.filterAccounts'):
      accountFilter = getGovernanceFilter(what.accountFilter);
      break;
    default:
      break;
  }

  saveObj.targetFilter = {
    type: getFilterGrantByType(what.enableAccountGrant, what.enableEntitlementGrant, what.enableRoleGrant, what.enableEntitlementCompositionGrant),
    user: userFilter,
    application: appFilter,
    account: accountFilter,
    memberOfOrg: [],
  };
  if (what.orgFilter === 'specificOrgs' && what.organizationSelection.length > 0) {
    saveObj.targetFilter.memberOfOrg = what.organizationSelection;
    saveObj.includeChildOrganizations = !!what.includeChildOrganizations;
  }

  if (what.enableEntitlementGrant) {
    saveObj.targetFilter.entitlement = entitlementFilter;
  }

  if (what.enableRoleGrant) {
    saveObj.targetFilter.role = roleFilter;
  }

  if (what.enableEntitlementCompositionGrant) {
    saveObj.targetFilter.entitlement = entitlementFilter;
  }

  Object.keys(saveObj.targetFilter).forEach((key) => {
    if (saveObj.targetFilter[key] === null) delete saveObj.targetFilter[key];
  });

  saveObj.targetFilter.decision = what.enableCertDecisionFilter
    ? getGovernanceFilter(what.decisionFilter)
    : getAllFilter();

  saveObj.excludeConditionalAccess = what.excludeConditionalAccess;
  saveObj.excludeRoleBasedAccess = what.excludeRoleBasedAccess;

  if (type === 'ENTITLEMENTCOMPOSITION') {
    delete saveObj.excludeConditionalAccess;
    delete saveObj.excludeRoleBasedAccess;
  }

  // When to Certify
  const when = forms.FrWhen;
  if (when.enableSchedule && when.scheduleConstraint) {
    let startTime = when.scheduleConstraint?.split('/')[0];
    startTime = `${startTime.split('.')[0]}-00:00`;
    let endTime = when.scheduleConstraint?.split('/')[1];
    endTime = `${endTime.split('.')[0]}-00:00`;

    const schedule = {
      type: 'simple',
      startTime,
      endTime,
      repeatInterval: getDayDuration(when.scheduleDuration, when.scheduleTimespan) * 86400000,
      repeatCount: -1,
      schedule: null,
    };
    saveObj.schedule = schedule;
  }
  saveObj.stageDuration = getDayDuration(when.duration, when.timespan);
  if (when.expireOption === 0) {
    saveObj.expirationAction = when.closeAction;
    saveObj.expirationActionDelay = when.closeActionTime === i18n.global.t('governance.timespans.immediately')
      ? 0
      : when.closeActionDuration;
  } else if (when.expireOption === 1) {
    saveObj.expirationAction = 'reassign';
    saveObj.expirationReassignee = when.reassignUser;
  } else {
    saveObj.expirationAction = null;
  }

  // Who will certify
  const who = forms.FrWho;
  let certifierType = who.certType;
  let certifierId = null;
  let certifierPath = null;
  if (certifierType === 'user') certifierId = who.certUser;
  if (certifierType === 'role') certifierId = who.certRole;
  if (certifierType === 'entitlementOwner') certifierType = 'entitlementOwner';
  if (certifierType === 'roleOwner') certifierType = 'roleOwner';
  if (certifierType === 'organizationAdmin') certifierType = 'organization';
  if (certifierType === 'custom') certifierPath = `user.${who.certifierPath}`;

  saveObj.stages = [
    {
      certifierType: certifierType === 'role' ? 'authzGroup' : certifierType,
      certifierId,
      certifierScript: null,
      certifierPath,
    },
  ];
  saveObj.defaultCertifierId = who.enableDefaultCertifier
    ? who.defaultCertifier
    : null;

  // Notifications
  const notif = forms.FrNotifications;
  saveObj.assignmentNotification = notif.initialNotification === false
    ? null
    : notif.initialEmail;
  saveObj.reassignNotification = notif.reassignNotification === false
    ? null
    : notif.reassignEmail;
  saveObj.expirationNotification = notif.expirationNotification === false
    ? null
    : notif.expirationEmail;
  if (notif.expirationNotification) saveObj.expirationNotificationDay = notif.expirationDays;
  saveObj.reminderNotification = notif.reminders === false
    ? null
    : notif.remindersEmail;
  if (notif.reminders) {
    saveObj.reminderFrequency = getDayDuration(notif.remindersDuration, notif.remindersTimespan);
  }

  saveObj.escalationNotification = notif.escalation === false
    ? null
    : notif.escalationEmail;
  if (notif.escalation) {
    saveObj.escalationFrequency = getDayDuration(notif.escalationDuration, notif.escalationTimespan);
    saveObj.escalationOwner = notif.escalationOwner;
  }

  // Additional Options
  const addOptions = forms.FrAdditionalOptions;
  saveObj.requireJustification = addOptions.requireJustification;
  saveObj.allowSelfCertification = addOptions.allowSelfCert;
  if (saveObj.allowSelfCertification) {
    saveObj.selfCertificationRule = addOptions.selfCertFilter === i18n.global.t('governance.editTemplate.allCertifiers')
      ? 'all'
      : 'restricted';
  } else {
    saveObj.selfCertificationRule = 'none';
  }
  if (addOptions.enableReassignmentDelegation) {
    saveObj.enableForward = addOptions.enableForward;
    saveObj.enableReassign = addOptions.enableReassign;
    saveObj.reassignPermissions = {
      ...saveObj.reassignPermissions,
      comment: addOptions.reassignPermissions.comment,
      certify: addOptions.reassignPermissions.makeDecision,
      reassign: addOptions.reassignPermissions.reassign,
      forward: addOptions.reassignPermissions.reassign,
      signoff: addOptions.reassignPermissions.signoff,
      exception: addOptions.reassignPermissions.makeDecision,
      reset: addOptions.reassignPermissions.makeDecision,
      revoke: addOptions.reassignPermissions.makeDecision,
    };
  }
  saveObj.exceptionDuration = addOptions.allowExceptions
    ? getDayDuration(addOptions.exceptionDuration, addOptions.exceptionTimespan)
    : 0;
  saveObj.allowBulkCertify = addOptions.allowBulkCertify;
  saveObj.allowPartialSignoff = addOptions.allowPartialSignoff;
  saveObj.remediationDelay = addOptions.remediationTime === i18n.global.t('governance.timespans.afterADuration')
    ? getDayDuration(addOptions.remediationDuration, addOptions.remediationTimespan)
    : 0;
  saveObj.remediationRule = addOptions.processRemediation === true
    ? 'BasicRevocation'
    : null;

  // Customization
  const customization = forms.FrCustomization;
  const columnConfig = {};
  if (what.enableAccountGrant) columnConfig.accounts = customization.columnConfig.accounts;
  if (what.enableEntitlementGrant) columnConfig.entitlements = customization.columnConfig.entitlements;
  if (what.enableRoleGrant) columnConfig.roles = customization.columnConfig.roles;
  if (what.enableEntitlementCompositionGrant) {
    columnConfig.entitlements = (customization.columnConfig.entitlements || []).filter(
      (col) => !col.startsWith('user.') && !col.startsWith('account.'),
    );
  }
  saveObj.uiConfig = {
    columnConfig,
  };

  return saveObj;
}

export function getFormValuesFromTemplate(template, eventBased) {
  const forms = {
    FrDetailsForm: {},
    FrWhat: {},
    FrWhen: {},
    FrWho: {},
    FrNotifications: {},
    FrAdditionalOptions: {},
    FrCustomization: {},
  };

  // Details
  forms.FrDetailsForm = {
    description: template.description,
    name: eventBased
      ? getDisplayNamefromName(template.name)
      : template.name,
    owner: template.ownerId,
    ownerInfo: template.ownerInfo,
    stagingEnabled: template.stagingEnabled,
  };

  // What
  // users filter
  let userFilter = {};
  let singleUserInfo = {};
  let singleUser = '';
  let userSelection = i18n.global.t('governance.editTemplate.allUsers');

  if (template.certificationType !== uiTypeMap.ENTITLEMENTCOMPOSITION) {
    if (!isEqual(template.targetFilter.user, getAllFilter())) {
      if (checkForSingleFilter(template.targetFilter.user, 'id')) {
        userSelection = i18n.global.t('governance.editTemplate.singleUser');
        const userId = template.targetFilter.user.operand[0].operand?.targetValue;
        singleUser = `managed/user/${userId}`;
        singleUserInfo = {
          givenName: userId,
          sn: '',
          id: userId,
        };
      } else {
        userSelection = i18n.global.t('governance.editTemplate.filterUsers');
        userFilter = template.targetFilter.user;
      }
    }
  }

  // organization filter
  let orgFilter = 'allOrgs';
  let organizationSelection = [];
  let includeChildOrganizations = null;
  if (!isNil(template.targetFilter.memberOfOrg)) {
    organizationSelection = !isEmpty(template.targetFilter.memberOfOrg)
      ? template.targetFilter.memberOfOrg
      : [];
    includeChildOrganizations = !!template.includeChildOrganizations;
    if (organizationSelection.length > 0) {
      orgFilter = 'specificOrgs';
    }
  }

  // applications filter
  let appFilter = {};
  let singleApp = [];
  let appSelection = i18n.global.t('governance.editTemplate.allApplications');
  if (template.targetFilter.application !== undefined && !isEqual(template.targetFilter.application, getAllNonAuthoritativeApplications())) {
    if (checkForEqualityFilter(template.targetFilter.application, 'id')) {
      appSelection = i18n.global.t('governance.editTemplate.specificApplications');
      singleApp = template.targetFilter.application.operand.map((x) => (x.operand.targetValue));
    } else {
      appSelection = i18n.global.t('governance.editTemplate.filterApplications');
      appFilter = template.targetFilter.application;
    }
  }

  // accounts filter
  let accountFilter = {};
  let accountSelection = i18n.global.t('governance.editTemplate.allAccounts');

  if (!isEqual(template.targetFilter.account, getAllFilter())) {
    accountSelection = i18n.global.t('governance.editTemplate.filterAccounts');
    accountFilter = template.targetFilter.account;
  }

  // decision filter
  let decisionFilter = {};
  let enableCertDecisionFilter = false;

  if (!isEqual(template.targetFilter.decision, getAllFilter())) {
    enableCertDecisionFilter = true;
    decisionFilter = template.targetFilter.decision;
  }

  // entitlements filter
  let entitlementFilter = {};
  let entitlementSelection = i18n.global.t('governance.editTemplate.allEntitlements');
  if (template.targetFilter.entitlement !== undefined && !isEqual(template.targetFilter.entitlement, getAllFilter())) {
    entitlementSelection = i18n.global.t('governance.editTemplate.filterEntitlements');
    entitlementFilter = template.targetFilter.entitlement;
  }

  // role filter
  let roleFilter = {};
  let roleSelection = i18n.global.t('governance.editTemplate.allRoles');

  if (!isEqual(template.targetFilter.role, getAllFilter())) {
    roleSelection = i18n.global.t('governance.editTemplate.filterRoles');
    roleFilter = template.targetFilter.role;
  }

  const excludeConditionalAccess = template.excludeConditionalAccess || false;
  const excludeRoleBasedAccess = template.excludeRoleBasedAccess || false;

  forms.FrWhat = {
    accountFilter,
    accountSelection,
    appFilter,
    appSelection,
    decisionFilter,
    enableCertDecisionFilter,
    enableAccountGrant: template.targetFilter.type.includes('accountGrant'),
    enableEntitlementGrant: template.targetFilter.type.includes('entitlementGrant'),
    enableRoleGrant: template.targetFilter.type.includes('roleMembership'),
    enableEntitlementComposition: template.targetFilter.type.includes('entitlement'),
    entitlementFilter,
    entitlementSelection,
    excludeConditionalAccess,
    excludeRoleBasedAccess,
    includeChildOrganizations,
    numAccounts: 0,
    numApplications: 0,
    numEntitlements: 0,
    numUsers: 0,
    organizationSelection,
    orgFilter,
    roleFilter,
    roleSelection,
    singleApp,
    singleUser,
    singleUserInfo,
    userFilter,
    userSelection,
  };

  // When
  let expireOption = 0;
  if (template.expirationAction === 'reassign') expireOption = 1;
  if (template.expirationAction === null) expireOption = 2;

  forms.FrWhen = {
    closeAction: template.expirationAction !== 'reassign' ? template.expirationAction : null,
    closeActionDuration: template.expirationActionDelay,
    closeActionTime: template.expirationActionDelay === 0 ? i18n.global.t('governance.timespans.immediately') : i18n.global.t('governance.timespans.afterADuration'),
    duration: template.stageDuration,
    enableSchedule: (template.scheduleId !== null && template.schedule !== null && template.schedule !== ''),
    expireOption,
    reassignUser: template.expirationReassignee,
    reassignToSelector: template.expirationReassignee?.includes('user') ? 'User' : 'Role',
    reassignUserInfo: template.expirationReassigneeInfo,
    scheduleDuration: 30,
    scheduleTimespan: i18n.global.t('governance.timespans.days'),
    timespan: i18n.global.t('governance.timespans.days'),
  };

  if (template.scheduleId && template.schedule) {
    let startTime = template.schedule.startTime.split('Z')[0];
    startTime = `${startTime}:00.000Z`;
    let endTime = template.schedule.endTime.split('Z')[0];
    endTime = `${endTime}:00.000Z`;
    forms.FrWhen.scheduleConstraint = `${startTime}/${endTime}`;
    forms.FrWhen.scheduleDuration = template.schedule.repeatInterval / 86400000;
  }

  // Who
  let certType;
  let certUser = '';
  let certRole = '';
  let certUserInfo = {};
  let certRoleInfo = {};
  let certifierPath = '';
  let split = [];
  const certifierData = template.stages[0];

  switch (certifierData.certifierType) {
    case 'user':
      certType = 'user';
      certUser = certifierData.certifierId;
      certUserInfo = certifierData.certifierInfo;
      break;
    case 'manager':
      certType = 'manager';
      break;
    case 'authzGroup':
      certType = 'role';
      certRole = certifierData.certifierId;
      certRoleInfo = certifierData.certifierInfo;
      break;
    case 'entitlementOwner':
      certType = 'entitlementOwner';
      break;
    case 'roleOwner':
      certType = 'roleOwner';
      break;
    case 'organization':
      certType = 'organizationAdmin';
      break;
    case 'custom':
      certType = 'custom';
      split = certifierData.certifierPath.split('.');
      certifierPath = split.length > 0 ? split[split.length - 1] : certifierData.certifierPath;
      break;
    default:
      throw new Error(i18n.global.t('governance.editTemplate.errorReadingCertifierType'));
  }

  forms.FrWho = {
    certRole,
    certRoleInfo,
    certType,
    certUser,
    certifierPath,
    certUserInfo,
    defaultCertifier: template.defaultCertifierId,
    defaultCertifierInfo: template.defaultCertifierInfo,
    enableDefaultCertifier: template.defaultCertifierId !== null,
  };

  // Notifications
  forms.FrNotifications = {
    escalation: template.escalationFrequency > 0,
    escalationDuration: template.escalationFrequency,
    escalationEmail: template.escalationNotification,
    escalationOwner: template.escalationOwner,
    escalationOwnerInfo: template.escalationOwnerInfo || {},
    escalationTimespan: i18n.global.t('governance.timespans.days'),
    expirationDays: template.expirationNotificationDay,
    expirationEmail: template.expirationNotification,
    expirationNotification: template.expirationNotification !== null,
    initialNotification: template.assignmentNotification !== null,
    initialEmail: template.assignmentNotification,
    reassignEmail: template.reassignNotification,
    reassignNotification: template.reassignNotification !== null,
    reminders: template.reminderFrequency > 0,
    remindersDuration: template.reminderFrequency,
    remindersEmail: template.reminderNotification,
    remindersTimespan: i18n.global.t('governance.timespans.days'),
  };
  const {
    certify,
    exception,
    reset,
    revoke,
    reassign,
    forward,
  } = template.reassignPermissions;

  // Additional Options
  forms.FrAdditionalOptions = {
    allowBulkCertify: template.allowBulkCertify,
    requireJustification: template.requireJustification || { revoke: false, exceptionAllowed: false },
    allowExceptions: template.exceptionDuration > 0,
    allowPartialSignoff: template.allowPartialSignoff,
    allowSelfCert: template.allowSelfCertification,
    enableForward: template.enableForward,
    enableReassign: template.enableReassign,
    reassignPermissions: {
      comment: template.reassignPermissions.comment,
      makeDecision: certify || exception || reset || revoke,
      reassign: reassign || forward,
      signoff: template.reassignPermissions.signoff,
    },
    enableReassignmentDelegation: template.enableForward || template.enableReassign,
    exceptionDuration: template.exceptionDuration,
    exceptionTimespan: i18n.global.t('governance.timespans.days'),
    processRemediation: template.remediationRule === 'BasicRevocation',
    remediationDuration: template.remediationDelay,
    remediationTime: template.remediationDelay === 0 ? i18n.global.t('governance.timespans.immediately') : i18n.global.t('governance.timespans.afterADuration'),
    remediationTimespan: i18n.global.t('governance.timespans.days'),
    selfCertFilter: template.selfCertificationRule === 'all' ? i18n.global.t('governance.editTemplate.allCertifiers') : i18n.global.t('governance.editTemplate.ownersAdministrators'),
  };

  // Customization
  forms.FrCustomization = {
    columnConfig: {
      accounts: template.uiConfig?.columnConfig?.accounts || [],
      entitlements: template.uiConfig?.columnConfig?.entitlements || [],
      roles: template.uiConfig?.columnConfig?.roles || [],
    },
  };

  return forms;
}

/**
 * Calculates the campaign duration in a human-readable format based on the number of days.
 * The duration is expressed in days, weeks, months, or years, depending on the input.
 * @param {Number} days - The number of days for the campaign duration.
 * @returns {String} A localized string representing the campaign duration in the appropriate unit (days, weeks, months, or years).
 */
export function getCampaignDuration(days) {
  let campaignDuration;
  if (days < 7) {
    campaignDuration = `${days} ${i18n.global.t(`governance.certificationDetails.campaignDurationUnit.day.${days === 1 ? 'singular' : 'plural'}`)}`;
  } else if (days < 28) {
    const weeks = Math.floor(days / 7);
    campaignDuration = `${weeks} ${i18n.global.t(`governance.certificationDetails.campaignDurationUnit.week.${weeks === 1 ? 'singular' : 'plural'}`)}`;
  } else if (days < 365) {
    const months = Math.floor(days / 28);
    campaignDuration = `${months} ${i18n.global.t(`governance.certificationDetails.campaignDurationUnit.month.${months === 1 ? 'singular' : 'plural'}`)}`;
  } else {
    const years = Math.floor(days / 365);
    campaignDuration = `${years} ${i18n.global.t(`governance.certificationDetails.campaignDurationUnit.year.${years === 1 ? 'singular' : 'plural'}`)}`;
  }
  return campaignDuration;
}
