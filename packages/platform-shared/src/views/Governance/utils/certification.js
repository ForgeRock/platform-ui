/**
 * Copyright (c) 2023-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import {
  cloneDeep,
  get,
  has,
  isEmpty,
  isEqual,
  isNil,
} from 'lodash';
import { getGovernanceFilter } from '@forgerock/platform-shared/src/utils/governance/filters';
import BaseTemplate from '@forgerock/platform-shared/src/views/Governance/Certification/Templates/EditTemplate/templateBase.json';
import { types, uiTypeMap, isAgentType } from '@forgerock/platform-shared/src/views/Governance/Certification/Templates/templateTypes';
import { getNameFromDisplayName, getDisplayNamefromName } from '@forgerock/platform-shared/src/views/Governance/utils/events';
import { EXPIRATION_TIMING } from '@forgerock/platform-shared/src/views/Governance/utils/certificationConstants';
import i18n from '@/i18n';

export { EXPIRATION_TIMING };

/**
 * Converts a duration and its interval (localized 'days', 'weeks', ...) into
 * the number of days it spans.
 * @param {Number} duration - The duration in the given interval.
 * @param {String} interval - The localized interval name.
 * @returns {Number} The duration in days.
 */
export function getDayDuration(duration, interval) {
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

// The agent platform select writes an OR of two EQUALS clauses on the application
// record — "templateName" (template-matched agents) and "aiAgentSource" (discovered
// agents) — carrying the same value, so either identifier matches the agent's app.
// 'all' writes nothing. See aic-ui/agent-certification.md for the full composition model.
export function getAgentPlatformFilter(platformId) {
  return {
    operator: 'OR',
    operand: [
      { operator: 'EQUALS', operand: { targetName: 'templateName', targetValue: platformId } },
      { operator: 'EQUALS', operand: { targetName: 'aiAgentSource', targetValue: platformId } },
    ],
  };
}

/**
 * Recognizes the canonical agent platform filter shape and returns the platform id
 * it encodes, or null when the filter is anything else (a hand-authored or
 * backend-authored tree the select can't represent).
 */
export function checkForAgentPlatformFilter(filter) {
  if (filter?.operator !== 'OR' || !Array.isArray(filter.operand) || filter.operand.length !== 2) return null;
  const [templateClause, sourceClause] = filter.operand;
  if (templateClause?.operator !== 'EQUALS' || templateClause.operand?.targetName !== 'templateName') return null;
  if (sourceClause?.operator !== 'EQUALS' || sourceClause.operand?.targetName !== 'aiAgentSource') return null;
  // the select represents one platform — both clauses must agree
  return templateClause.operand.targetValue === sourceClause.operand.targetValue
    ? templateClause.operand.targetValue
    : null;
}

// The agent type select writes an EQUALS clause on the account glossary subtype
// (the same property the get-filter-schema "accountSubtype" key exposes). 'all'
// writes nothing.
export const AGENT_TYPE_FILTER_FIELD = 'glossary.accountSubtype';

export function getAgentTypeFilter(agentType) {
  return getSingleFilter(AGENT_TYPE_FILTER_FIELD, agentType);
}

/**
 * Recognizes the canonical agent type filter shape and returns the type it encodes,
 * or null when the filter is anything else.
 */
export function checkForAgentTypeFilter(filter) {
  if (filter?.operator !== 'AND' || filter.operand?.length !== 1) return null;
  const clause = filter.operand[0];
  if (clause?.operator !== 'EQUALS' || clause.operand?.targetName !== AGENT_TYPE_FILTER_FIELD) return null;
  return clause.operand.targetValue || null;
}

// agentAccess scope composition: its application/account subtrees carry
// granted-access filters from its filter builders, so the platform/agentType
// scope clauses AND into them instead of owning them; extraction peels the
// scope clause back out on load. See aic-ui/agent-certification.md.

/**
 * ANDs the agent platform scope (templateName/aiAgentSource OR) into an agentAccess
 * application filter tree. A null/absent base or an all-baseline returns the scope
 * tree alone; an AND base absorbs the scope into its operand array (no nested
 * wrappers); any other base is wrapped in a fresh AND.
 * @param {Object|null} baseFilter the access-filter application subtree (or null)
 * @param {String} platformId selected platform id
 * @returns {Object} composed application filter
 */
export function composeAgentPlatformFilter(baseFilter, platformId) {
  const scope = getAgentPlatformFilter(platformId);
  if (!baseFilter || baseFilter.operator === 'ALL'
    || isEqual(baseFilter, getAllNonAuthoritativeApplications())) {
    return scope;
  }
  if (baseFilter.operator === 'AND' && Array.isArray(baseFilter.operand)) {
    return { operator: 'AND', operand: [scope, ...baseFilter.operand] };
  }
  return { operator: 'AND', operand: [scope, baseFilter] };
}

/**
 * ANDs the agent type scope into an agentAccess account filter tree. A null/absent
 * base or an all-baseline returns the canonical scope tree (AND of one EQUALS on
 * glossary.accountSubtype — the shape checkForAgentTypeFilter recognizes); a real
 * base composes flat: the bare EQUALS clause is embedded directly in the AND, so
 * no nested wrappers pile up.
 * @param {Object|null} baseFilter the access-filter account subtree (or null)
 * @param {String} agentType selected agent type
 * @returns {Object} composed account filter
 */
export function composeAgentTypeFilter(baseFilter, agentType) {
  if (!baseFilter || baseFilter.operator === 'ALL'
    || isEqual(baseFilter, getAllFilter())) {
    return getAgentTypeFilter(agentType);
  }
  const scopeClause = {
    operator: 'EQUALS',
    operand: { targetName: AGENT_TYPE_FILTER_FIELD, targetValue: agentType },
  };
  if (baseFilter.operator === 'AND' && Array.isArray(baseFilter.operand)) {
    return { operator: 'AND', operand: [scopeClause, ...baseFilter.operand] };
  }
  return { operator: 'AND', operand: [scopeClause, baseFilter] };
}

/**
 * Peels a scope clause back out of a composed agentAccess application filter,
 * returning { platform, base } — platform is the encoded id or null, base is the
 * remaining access filter ('' when nothing remains). A bare scope tree returns
 * the platform with an empty base; an AND wrapping a leading scope clause splits
 * it off; anything else decodes as { platform: null, base: filter }.
 * @param {Object} filter application subtree from a saved template
 * @returns {{ platform: String|null, base: Object|'' }}
 */
export function extractAgentPlatformFilter(filter) {
  if (!filter || filter.operator === 'ALL' || isEqual(filter, getAllNonAuthoritativeApplications())) {
    return { platform: null, base: '' };
  }
  if (checkForAgentPlatformFilter(filter)) {
    return { platform: checkForAgentPlatformFilter(filter), base: '' };
  }
  if (filter.operator === 'AND' && Array.isArray(filter.operand) && filter.operand.length > 1) {
    const [first, ...rest] = filter.operand;
    const platform = first?.operator === 'OR'
      ? checkForAgentPlatformFilter(first)
      : null;
    if (platform) {
      return {
        platform,
        base: rest.length === 1 ? rest[0] : { operator: 'AND', operand: rest },
      };
    }
  }
  return { platform: null, base: filter };
}

/**
 * Peels a scope clause back out of a composed agentAccess account filter,
 * returning { agentType, base } — agentType is the encoded type or null, base is
 * the remaining access filter ('' when nothing remains). Shape logic mirrors
 * extractAgentPlatformFilter.
 * @param {Object} filter account subtree from a saved template
 * @returns {{ agentType: String|null, base: Object|'' }}
 */
export function extractAgentTypeFilter(filter) {
  if (!filter || filter.operator === 'ALL' || isEqual(filter, getAllFilter())) {
    return { agentType: null, base: '' };
  }
  if (checkForAgentTypeFilter(filter)) {
    return { agentType: checkForAgentTypeFilter(filter), base: '' };
  }
  if (filter.operator === 'AND' && Array.isArray(filter.operand) && filter.operand.length > 1) {
    const [first, ...rest] = filter.operand;
    // composed trees carry the bare EQUALS clause (composeAgentTypeFilter embeds
    // it flat); the canonical AND-of-one also passes via checkForAgentTypeFilter
    const agentType = first?.operator === 'EQUALS' && first?.operand?.targetName === AGENT_TYPE_FILTER_FIELD
      ? first.operand.targetValue
      : null;
    if (agentType) {
      return {
        agentType,
        base: rest.length === 1 ? rest[0] : { operator: 'AND', operand: rest },
      };
    }
  }
  return { agentType: null, base: filter };
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

export function getFilterGrantByType(enableAccountGrant, enableEntitlementGrant, enableRoleGrant, enableEntitlementCompositionGrant, enableIdentityProfileGrant, enableRoleCompositionGrant) {
  const filterGrant = [];
  if (enableAccountGrant) filterGrant.push('accountGrant');
  if (enableEntitlementGrant) filterGrant.push('entitlementGrant');
  if (enableRoleGrant) filterGrant.push('roleMembership');
  if (enableEntitlementCompositionGrant) filterGrant.push('entitlement');
  if (enableIdentityProfileGrant) filterGrant.push('user');
  if (enableRoleCompositionGrant) filterGrant.push('role');

  return filterGrant;
}

export function buildSavePayload(type, forms, eventBased) {
  const saveObj = cloneDeep(BaseTemplate);
  saveObj.certificationType = uiTypeMap[type];
  const isAgent = isAgentType(type);

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

  if (what.enableIdentityProfileGrant) {
    saveObj.targetFilter = {
      type: getFilterGrantByType(false, false, false, false, true),
    };
    const isAllUsers = userFilter?.operator === 'ALL' && (userFilter?.operand?.length ?? 0) === 0;
    if (userFilter && !isAllUsers) {
      saveObj.targetFilter.user = userFilter;
    }
    if (what.orgFilter === 'specificOrgs' && what.organizationSelection?.length > 0) {
      saveObj.targetFilter.memberOfOrg = what.organizationSelection;
      saveObj.includeChildOrganizations = !!what.includeChildOrganizations;
    }
    if (what.enableCertDecisionFilter) {
      saveObj.targetFilter.decision = getGovernanceFilter(what.decisionFilter);
    }
  } else {
    saveObj.targetFilter = {
      type: getFilterGrantByType(what.enableAccountGrant, what.enableEntitlementGrant, what.enableRoleGrant, what.enableEntitlementCompositionGrant, false, what.enableRoleCompositionGrant),
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

    if (what.enableRoleGrant || what.enableRoleCompositionGrant) {
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
  }

  saveObj.excludeConditionalAccess = what.excludeConditionalAccess;
  saveObj.excludeRoleBasedAccess = what.excludeRoleBasedAccess;

  if (type === 'ENTITLEMENTCOMPOSITION' || type === 'IDENTITYPROFILE' || type === 'ROLECOMPOSITION' || isAgent) {
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
  // custodian saves through the custom machinery: the glossary actors field is a
  // bare managed/user/<id> ref array, which buildCustomCertifierStringFromKey
  // projects exactly as the dedicated custodian builder does — without the
  // custodian path's authorization constraints
  if (certifierType === 'custodian') {
    certifierType = 'custom';
    certifierPath = 'glossary.idx./account.actors';
  }

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
  saveObj.events = saveObj.events || {};
  if (notif.initialNotification) {
    saveObj.events.assignment = saveObj.events.assignment || {};
    saveObj.events.assignment.notification = notif.initialEmail;
  }
  if (notif.reassignNotification) {
    saveObj.events.reassign = saveObj.events.reassign || {};
    saveObj.events.reassign.notification = notif.reassignEmail;
  }
  if (notif.reminders) {
    saveObj.events.reminder = {
      ...saveObj.events.reminder,
      notification: notif.remindersEmail,
      frequency: getDayDuration(notif.remindersDuration, notif.remindersTimespan),
      includeActor: true,
      ...(notif.remindersIncludeOwner && { includeOwner: true }),
      ...(notif.remindersIncludeCc && notif.remindersCcUserIds?.length > 0
        ? { actors: notif.remindersCcUserIds.map((id) => ({ type: 'user', id })) }
        : {}),
    };
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

  if (addOptions.expireOption === 0) {
    saveObj.expirationAction = addOptions.closeAction;
    saveObj.expirationActionDelay = addOptions.closeActionTime === i18n.global.t('governance.timespans.immediately')
      ? 0
      : addOptions.closeActionDuration;
  } else if (addOptions.expireOption === 1) {
    saveObj.expirationAction = 'reassign';
    saveObj.expirationReassignee = addOptions.reassignUser;
  } else {
    saveObj.expirationAction = null;
  }

  if (notif.expirationNotification) {
    saveObj.events = saveObj.events || {};
    saveObj.events.expirationNotification = saveObj.events.expirationNotification || {};
    const beforeExpires = notif.expirationTiming === EXPIRATION_TIMING.BEFORE;
    saveObj.events.expirationNotification = {
      ...saveObj.events.expirationNotification,
      notification: notif.expirationEmail,
      ...(beforeExpires && { day: notif.expirationDays }),
      includeActor: true,
      ...(notif.expirationIncludeOwner && { includeOwner: true }),
      ...(notif.expirationIncludeCc && notif.expirationCcUserIds?.length > 0
        ? { actors: notif.expirationCcUserIds.map((id) => ({ type: 'user', id })) }
        : {}),
    };
  }

  if (addOptions.escalation) {
    saveObj.events = saveObj.events || {};
    saveObj.events.escalation = {
      action: addOptions.escalationAction,
      frequency: addOptions.escalationFrequency,
      notification: addOptions.escalationEmail,
    };
    const actors = [];
    if (addOptions.escalateToSelector === 'manager') {
      actors.push({ type: 'manager' });
    } else {
      actors.push({ type: addOptions.escalateToSelector, id: addOptions.escalationOwner });
    }
    saveObj.events.escalation.actors = actors;
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
  const customization = forms.FrCustomization || {};
  const columnConfig = {};
  const columnSortConfig = {};
  if (what.enableAccountGrant) {
    columnConfig.accounts = customization.columnConfig?.accounts;
    columnSortConfig.accounts = customization.sortableColumnConfig?.accounts || [];
  }
  if (what.enableEntitlementGrant) {
    columnConfig.entitlements = customization.columnConfig?.entitlements;
    columnSortConfig.entitlements = customization.sortableColumnConfig?.entitlements || [];
  }
  if (what.enableRoleGrant) {
    columnConfig.roles = customization.columnConfig?.roles;
    columnSortConfig.roles = customization.sortableColumnConfig?.roles || [];
  }
  if (what.enableEntitlementCompositionGrant) {
    columnConfig.entitlementComposition = customization.columnConfig?.entitlementComposition;
    columnSortConfig.entitlementComposition = (customization.sortableColumnConfig?.entitlementComposition || [])
      .filter((val) => !val.startsWith('user.') && !val.startsWith('account.'));
  }
  if (what.enableIdentityProfileGrant) {
    columnConfig.identityProfile = customization.columnConfig?.identityProfile;
    columnSortConfig.identityProfile = customization.sortableColumnConfig?.identityProfile || [];
  }
  if (what.enableRoleCompositionGrant) {
    columnConfig.roleComposition = customization.columnConfig?.roleComposition;
    columnSortConfig.roleComposition = customization.sortableColumnConfig?.roleComposition || [];
  }
  if (isAgent) {
    columnConfig.agentProfile = customization.columnConfig?.agentProfile;
    columnConfig.agentAccess = customization.columnConfig?.agentAccess;
    columnSortConfig.agentProfile = customization.sortableColumnConfig?.agentProfile || [];
    columnSortConfig.agentAccess = customization.sortableColumnConfig?.agentAccess || [];
  }
  saveObj.uiConfig = {
    columnConfig,
    columnSortConfig,
  };

  // agentProfile scope selects own the generic targetFilter subtrees (platform =
  // templateName/aiAgentSource OR, agent type = glossary-subtype EQUALS; 'all'
  // writes the all-baseline). A loaded subtree the selects can't represent is
  // replaced on re-save, never merged. agentAccess AND-composes instead — the
  // generic block above has already populated the subtrees from its filter builders.
  if (type === types.AGENTPROFILE) {
    saveObj.targetFilter.application = what.platform && what.platform !== 'all'
      ? getAgentPlatformFilter(what.platform)
      : getAllNonAuthoritativeApplications();
    saveObj.targetFilter.account = what.agentType && what.agentType !== 'all'
      ? getAgentTypeFilter(what.agentType)
      : getAllFilter();
  } else if (isAgent) {
    // agentAccess scope clauses AND into the subtrees (see composeAgentPlatformFilter)
    if (what.platform && what.platform !== 'all') {
      saveObj.targetFilter.application = composeAgentPlatformFilter(
        saveObj.targetFilter.application,
        what.platform,
      );
    }
    if (what.agentType && what.agentType !== 'all') {
      saveObj.targetFilter.account = composeAgentTypeFilter(
        saveObj.targetFilter.account,
        what.agentType,
      );
    }
  }

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
    if (template.targetFilter.user && !isEqual(template.targetFilter.user, getAllFilter())) {
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

  // agent scope selects read back out of the targetFilter subtrees they were
  // folded into: agentProfile owns them (exact-match recognition, anything else
  // falls to 'all'); agentAccess's scope is peeled off first and the remainder
  // decodes below as the user's access filter (decoded trees round-trip).
  let agentPlatformScope = null;
  let agentTypeScope = null;
  let decodedApplication = template.targetFilter.application;
  let decodedAccount = template.targetFilter.account;
  if (template.certificationType === uiTypeMap.AGENTACCESS) {
    const appScope = extractAgentPlatformFilter(template.targetFilter.application);
    const accountScope = extractAgentTypeFilter(template.targetFilter.account);
    agentPlatformScope = appScope.platform;
    agentTypeScope = accountScope.agentType;
    decodedApplication = appScope.base || undefined;
    decodedAccount = accountScope.base || undefined;
  }

  if (decodedApplication !== undefined && !isEqual(decodedApplication, getAllNonAuthoritativeApplications())) {
    if (checkForEqualityFilter(decodedApplication, 'id')) {
      appSelection = i18n.global.t('governance.editTemplate.specificApplications');
      singleApp = decodedApplication.operand.map((x) => (x.operand.targetValue));
    } else {
      appSelection = i18n.global.t('governance.editTemplate.filterApplications');
      appFilter = decodedApplication;
    }
  }

  // accounts filter
  let accountFilter = {};
  let accountSelection = i18n.global.t('governance.editTemplate.allAccounts');

  if (decodedAccount !== undefined && !isEqual(decodedAccount, getAllFilter())) {
    accountSelection = i18n.global.t('governance.editTemplate.filterAccounts');
    accountFilter = decodedAccount;
  }

  // agentProfile scope selects own the subtrees (exact-match recognition, anything
  // else falls to 'all'); agentAccess values were extracted above
  let platform = 'all';
  let agentType = 'all';
  if (template.certificationType === uiTypeMap.AGENTPROFILE) {
    platform = checkForAgentPlatformFilter(template.targetFilter.application) || 'all';
    agentType = checkForAgentTypeFilter(template.targetFilter.account) || 'all';
  } else {
    platform = agentPlatformScope || 'all';
    agentType = agentTypeScope || 'all';
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

  if (template.targetFilter.role !== undefined && !isEqual(template.targetFilter.role, getAllFilter())) {
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
    enableEntitlementCompositionGrant: template.targetFilter.type.includes('entitlement'),
    enableIdentityProfileGrant: template.certificationType === uiTypeMap.IDENTITYPROFILE
      && template.targetFilter.type.includes('user'),
    enableRoleCompositionGrant: template.targetFilter.type.includes('role'),
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
    platform,
    agentType,
  };

  // When
  forms.FrWhen = {
    duration: template.stageDuration,
    enableSchedule: (template.scheduleId !== null && template.schedule !== null && template.schedule !== ''),
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
    case 'custodian':
      certType = 'custodian';
      break;
    case 'custom':
      certType = 'custom';
      split = certifierData.certifierPath.split('.');
      certifierPath = split.length > 0 ? split[split.length - 1] : certifierData.certifierPath;
      // a custodian saved through the custom machinery (glossary actors path)
      // restores as the Custodian option the UI offered
      if (certifierData.certifierPath === 'glossary.idx./account.actors') {
        certType = 'custodian';
        certifierPath = '';
      }
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
  const expirationNotification = template.events?.expirationNotification;
  const expirationNotifDay = expirationNotification?.day;
  const expirationActors = expirationNotification?.actors || [];
  const expirationCcUserIds = expirationActors
    .filter((actor) => typeof actor === 'string' || (actor && actor.id))
    .map((actor) => (typeof actor === 'string' ? actor : actor.id));
  const reminderActors = template.events?.reminder?.actors || [];
  const remindersCcUserIds = reminderActors
    .filter((actor) => typeof actor === 'string' || (actor && actor.id))
    .map((actor) => (typeof actor === 'string' ? actor : actor.id));
  forms.FrNotifications = {
    initialNotification: !isNil(template.events?.assignment?.notification),
    initialEmail: template.events?.assignment?.notification,
    reassignEmail: template.events?.reassign?.notification,
    reassignNotification: !isNil(template.events?.reassign?.notification),
    reminders: template.events?.reminder?.frequency > 0,
    remindersDuration: template.events?.reminder?.frequency,
    remindersEmail: template.events?.reminder?.notification,
    remindersIncludeCc: reminderActors.length > 0,
    remindersIncludeOwner: template.events?.reminder?.includeOwner === true,
    remindersCcUserIds,
    remindersTimespan: i18n.global.t('governance.timespans.days'),
    expirationNotification: !isNil(expirationNotification?.notification),
    expirationEmail: expirationNotification?.notification,
    expirationIncludeCc: expirationActors.length > 0,
    expirationIncludeOwner: expirationNotification?.includeOwner === true,
    expirationCcUserIds,
    expirationDays: expirationNotifDay > 0 ? expirationNotifDay : 1,
    expirationTiming: !isNil(expirationNotifDay)
      ? EXPIRATION_TIMING.BEFORE
      : EXPIRATION_TIMING.WHEN,
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
  let expireOption = 0;
  let escalateToSelector = 'role';
  if (template.expirationAction === 'reassign') expireOption = 1;
  if (template.expirationAction === null) expireOption = 2;

  const actors = get(template, 'events.escalation.actors', []);
  if (actors.length > 0) {
    escalateToSelector = actors[0].type;
  }

  forms.FrAdditionalOptions = {
    allowBulkCertify: template.allowBulkCertify,
    requireJustification: template.requireJustification || { revoke: false, exceptionAllowed: false },
    allowExceptions: template.exceptionDuration > 0,
    allowPartialSignoff: template.allowPartialSignoff,
    allowSelfCert: template.allowSelfCertification,
    closeAction: template.expirationAction !== 'reassign' ? template.expirationAction : null,
    closeActionDuration: template.expirationActionDelay,
    closeActionTime: template.expirationActionDelay === 0 ? i18n.global.t('governance.timespans.immediately') : i18n.global.t('governance.timespans.afterADuration'),
    escalateToSelector,
    escalation: has(template, 'events.escalation'),
    escalationFrequency: template.events?.escalation?.frequency,
    escalationEmail: template.events?.escalation?.notification,
    escalationOwner: template.events?.escalation?.actors?.[0],
    escalationOwnerInfo: template.escalationOwnerInfo?.id || {},
    escalationTimespan: i18n.global.t('governance.timespans.days'),
    enableForward: template.enableForward,
    enableReassign: template.enableReassign,
    expireOption,
    reassignUser: template.expirationReassignee,
    reassignToSelector: template.expirationReassignee?.includes('user') ? 'User' : 'Role',
    reassignUserInfo: template.expirationReassigneeInfo,
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
      entitlementComposition: template.uiConfig?.columnConfig?.entitlementComposition || [],
      identityProfile: template.uiConfig?.columnConfig?.identityProfile || [],
      roleComposition: template.uiConfig?.columnConfig?.roleComposition || [],
      agentProfile: template.uiConfig?.columnConfig?.agentProfile || [],
      agentAccess: template.uiConfig?.columnConfig?.agentAccess || [],
    },
    sortableColumnConfig: {
      accounts: template.uiConfig?.columnSortConfig?.accounts || [],
      entitlements: template.uiConfig?.columnSortConfig?.entitlements || [],
      roles: template.uiConfig?.columnSortConfig?.roles || [],
      entitlementComposition: template.uiConfig?.columnSortConfig?.entitlementComposition || [],
      identityProfile: template.uiConfig?.columnSortConfig?.identityProfile || [],
      roleComposition: template.uiConfig?.columnSortConfig?.roleComposition || [],
      agentProfile: template.uiConfig?.columnSortConfig?.agentProfile || [],
      agentAccess: template.uiConfig?.columnSortConfig?.agentAccess || [],
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
