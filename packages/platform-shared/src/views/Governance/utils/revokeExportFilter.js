/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * IGA-4705 — static targetFilter for the client-side "Download revokes" export.
 *
 * The download calls the existing POST /:campaignId/items/search API with this
 * filter (no filter UI, no new endpoint). It selects, within the campaign,
 * items that were decided as revoke, whose certification is signed-off, and
 * whose remediation has not finished (items never remediated have no
 * remediationStatus field at all, and the NOT IN clause matches them too).
 *
 * A campaign can hold several item types (identity and agentAccess campaigns
 * mix account grants, entitlement grants and role memberships — see
 * TEMPLATE_ALLOWED_TYPES on the backend). Each item type downloads as its own
 * file with its own columns, so every function here is keyed by *item type*,
 * not by campaign certificationType; the certificationType only decides which
 * types a campaign can hold (getRevokesItemTypesForCampaign).
 *
 * Kept as a single module so the UI and tests pin one set of constants; the
 * filter contract must stay in sync with the backend suite
 * iga4705-static-revoke-filter.test.js.
 */

export const FINAL_REMEDIATION_STATUSES = Object.freeze(['complete', 'failed', 'canceled']);

/**
 * Campaign statuses where the export has work to do. The filter selects
 * items whose certification is signed-off, and a campaign reaches
 * signed-off once its items are (lineItem sign-off finalizes the campaign
 * to this status); 'complete' is the legacy display value for the same
 * state. In-progress, staging, creating and challenge campaigns have no
 * signed-off items yet, so the export entry points hide the item there
 * rather than round-tripping a guaranteed-empty request.
 */
export const REVOKES_EXPORTABLE_CAMPAIGN_STATUSES = Object.freeze([
  'signed-off',
  'complete',
]);

/**
 * The item-type groups the revokes export splits a campaign's worklist into.
 * Mirrors the backend's ALL_ITEM_TYPE values (globalConstants.js) with the
 * legacy-case capitalization collapsed into each group — the template config
 * keys and the item.type IN clause use these values.
 *
 * - accountGrants: accountGrant + AccountGrant (legacy) + sharedAccount items
 * - entitlementGrants: entitlementGrant + resourceGrant items (resourceGrant
 *   is a disconnected/managed-resource grant carrying an entitlement and an
 *   application — the same columns as an entitlement grant)
 * - roleMemberships: roleMembership items
 * - entitlements (compositions): entitlement items
 * - roles (compositions): role items
 * - users (identity profiles): user items
 *
 * i18nType keys into governance.certificationDetails.exportRevocationDecisionsTypes
 * for the modal labels and filenames.
 */
export const REVOKES_ITEM_TYPES = Object.freeze({
  accountGrants: Object.freeze({
    itemTypes: Object.freeze(['accountGrant', 'AccountGrant', 'sharedAccount']),
    i18nType: 'accountGrants',
    grantKey: 'accounts',
  }),
  entitlementGrants: Object.freeze({
    itemTypes: Object.freeze(['entitlementGrant', 'resourceGrant']),
    i18nType: 'entitlementGrants',
    grantKey: 'entitlements',
  }),
  roleMemberships: Object.freeze({
    itemTypes: Object.freeze(['roleMembership']),
    i18nType: 'roleMemberships',
    grantKey: 'roles',
  }),
  entitlementCompositions: Object.freeze({
    itemTypes: Object.freeze(['entitlement']),
    i18nType: 'entitlementCompositions',
    // no campaign type maps to both entitlementGrants and this group, so the
    // two groups' shared "Entitlements" label never collides in filenames —
    // if the type→group mapping below ever changes, differentiate one label
    grantKey: 'entitlementComposition',
  }),
  roleCompositions: Object.freeze({
    itemTypes: Object.freeze(['role']),
    i18nType: 'roleCompositions',
    grantKey: 'roleComposition',
  }),
  identityProfiles: Object.freeze({
    itemTypes: Object.freeze(['user']),
    i18nType: 'identityProfiles',
    grantKey: 'identityProfile',
  }),
});

/**
 * Campaign certificationType → the item-type groups the campaign can hold,
 * mirroring the backend's TEMPLATE_ALLOWED_TYPES (globalConstants.js). Drives
 * which per-type exports the probe offers for a campaign. Unknown types fall
 * back to the union of everything so a new type still exports instead of
 * silently disappearing.
 */
const ITEM_TYPES_BY_CAMPAIGN = {
  identity: ['accountGrants', 'entitlementGrants', 'roleMemberships'],
  agentAccess: ['accountGrants', 'entitlementGrants', 'roleMemberships'],
  agentProfile: ['accountGrants'],
  application: ['accountGrants', 'entitlementGrants'],
  entitlement: ['entitlementGrants'],
  roleMembership: ['roleMemberships'],
  roleComposition: ['roleCompositions'],
  entitlementComposition: ['entitlementCompositions'],
  identityProfile: ['identityProfiles'],
};

const ALL_ITEM_TYPE_KEYS = Object.keys(REVOKES_ITEM_TYPES);

/**
 * Campaign certificationType → the grant key its whole-worklist export reads
 * the template's column configuration from (uiConfig.columnConfig[grantKey]) —
 * the same keys baseColumnConfig.js and the Customization tab use. Only used
 * when no item type is resolved (mixed/unknown campaigns): identity campaigns
 * configure their columns under 'accounts', application under 'accounts', etc.
 */
const GRANT_KEY_BY_CERTIFICATION_TYPE = {
  identity: 'accounts',
  agentAccess: 'accounts',
  agentProfile: 'accounts',
  application: 'accounts',
  entitlement: 'entitlements',
  roleMembership: 'roles',
  roleComposition: 'roleComposition',
  entitlementComposition: 'entitlementComposition',
  identityProfile: 'identityProfile',
};

/**
 * The item-type groups a campaign's worklist can contain, in the fixed
 * REVOKES_ITEM_TYPES order (accounts, entitlements, roles, ...). Unknown
 * campaign types fall back to every group so a new type still exports.
 * @param {string} certificationType - the campaign's certificationType.
 * @returns {Array<string>} keys into REVOKES_ITEM_TYPES.
 */
export function getRevokesItemTypesForCampaign(certificationType) {
  return ITEM_TYPES_BY_CAMPAIGN[certificationType] || ALL_ITEM_TYPE_KEYS;
}

/**
 * The single item-type group for campaigns whose worklist holds exactly one
 * group — used to preset the export's type without offering the modal's
 * item-type step. Returns null for mixed or unknown campaigns: the caller
 * then keeps the whole-worklist fallback (no item.type clause, union fields).
 * @param {string} certificationType - the campaign's certificationType.
 * @returns {string|null} a key into REVOKES_ITEM_TYPES, or null.
 */
export function getSingleRevokesTypeForCampaign(certificationType) {
  const groups = ITEM_TYPES_BY_CAMPAIGN[certificationType];
  return (groups && groups.length === 1) ? groups[0] : null;
}

/**
 * The per-file item types for one revokes export run: the modal's explicit
 * choice wins; 'all' (or no choice) fans a known mixed-type campaign into
 * one export per candidate group — each file with that type's own columns —
 * or, when probedGroups is supplied, one export per probed non-empty group
 * (matching exactly what the modal's all-types card offered); single-type
 * campaigns export their one group; unknown campaigns keep the whole-worklist
 * union fallback (null — their worklist may hold item types outside the known
 * groups, which per-type filters would silently drop).
 * @param {string|null} itemType - the modal's item-type choice ('all' = every type).
 * @param {string} [certificationType] - the campaign's certificationType.
 * @param {Array<string>} [probedGroups] - the campaign's non-empty type groups
 *   from the modal-open probes; with them, 'all' resolves to those groups
 *   even for unknown certification types.
 * @returns {Array<string|null>} item-type keys (or a single null) to export, in order.
 */
export function resolveRevokesExportTypes(itemType, certificationType, probedGroups) {
  if (itemType && itemType !== 'all') return [itemType];
  if (Array.isArray(probedGroups) && probedGroups.length > 0) {
    return [...probedGroups];
  }
  const groups = ITEM_TYPES_BY_CAMPAIGN[certificationType];
  if (!groups) return [null];
  if (groups.length === 1) return [groups[0]];
  return [...groups];
}

/** Field list for grant-shaped items (accounts, entitlements, agents, identity campaigns). */
const GRANT_EXPORT_FIELDS = [
  'id',
  'user.userName',
  'user.givenName',
  'user.sn',
  'user.cn',
  'application.name',
  'keys.accountId',
  'account.id',
  'descriptor.idx./account.displayName',
  'descriptor.idx./entitlement.displayName',
  'entitlement.displayName',
  'decision.certification.remediationStatus',
];

/** Field list for roleMembership items (user + role). */
const ROLE_MEMBERSHIP_EXPORT_FIELDS = [
  'id',
  'user.userName',
  'user.givenName',
  'user.sn',
  'user.cn',
  'role.name',
  'decision.certification.remediationStatus',
];

/** Field list for roleComposition items — never a user involved. */
const ROLE_COMPOSITION_EXPORT_FIELDS = [
  'id',
  'role.name',
  'decision.certification.remediationStatus',
];

/** Field list for entitlementComposition items — never a user involved. */
const ENTITLEMENT_COMPOSITION_EXPORT_FIELDS = [
  'id',
  'application.name',
  'descriptor.idx./entitlement.displayName',
  'entitlement.displayName',
  'decision.certification.remediationStatus',
];

/** Field list for identityProfile items (user only, no resource). */
const IDENTITY_PROFILE_EXPORT_FIELDS = [
  'id',
  'user.userName',
  'user.givenName',
  'user.sn',
  'user.cn',
  'decision.certification.remediationStatus',
];

/**
 * Item-type group → export fields. Each group's list is the union of its
 * members' shapes (e.g. resourceGrant items carry entitlement + application
 * paths like entitlementGrant, so one list serves the whole group). Any
 * field absent from an item's shape simply maps to a blank cell.
 */
const EXPORT_FIELDS_BY_TYPE = {
  accountGrants: [
    'id',
    'user.userName',
    'user.givenName',
    'user.sn',
    'user.cn',
    'application.name',
    'keys.accountId',
    'account.id',
    'descriptor.idx./account.displayName',
    'decision.certification.remediationStatus',
  ],
  entitlementGrants: GRANT_EXPORT_FIELDS,
  roleMemberships: ROLE_MEMBERSHIP_EXPORT_FIELDS,
  roleCompositions: ROLE_COMPOSITION_EXPORT_FIELDS,
  entitlementCompositions: ENTITLEMENT_COMPOSITION_EXPORT_FIELDS,
  identityProfiles: IDENTITY_PROFILE_EXPORT_FIELDS,
};

/**
 * Reads a dot-separated item path, e.g. 'glossary.idx./entitlement.owner'.
 * Returns undefined when any segment is missing.
 */
function getNestedPath(item, path) {
  return path.split('.').reduce((value, segment) => (value == null ? undefined : value[segment]), item);
}

/**
 * Builds the `fields` list for one per-type revokes export request.
 * @param {string} itemType - a key into REVOKES_ITEM_TYPES, or null/undefined
 *   for the whole-worklist export (union of every group's fields).
 * @returns {Array<string>} item paths to request.
 */
export function buildRevokesExportFields(itemType) {
  return EXPORT_FIELDS_BY_TYPE[itemType] || [...new Set([
    ...GRANT_EXPORT_FIELDS,
    ...ROLE_MEMBERSHIP_EXPORT_FIELDS,
    ...ENTITLEMENT_COMPOSITION_EXPORT_FIELDS,
    ...IDENTITY_PROFILE_EXPORT_FIELDS,
  ])];
}

/** The four editable columns the owner fills in before re-upload. */
function editableColumns(item) {
  return {
    'Remediation Status': item.decision?.certification?.remediationStatus || '',
    'Completion Date': '',
    'Remediation Comments': '',
    'Evidence Reference': '',
  };
}

/**
 * Per item type: how each configurable column string (the values the
 * template's column configuration tab saves — e.g. 'user.user',
 * 'application.application', 'role.role') reads off a line item, plus the
 * column header it emits in the CSV. Custom glossary columns fall through to
 * the generic path below.
 */
const COLUMN_STRING_READERS = {
  'user.user': {
    header: 'Identity',
    read: (item) => item.user?.userName
      || ([item.user?.givenName, item.user?.sn].filter(Boolean).join(' ') || item.user?.cn)
      || '',
  },
  'application.application': {
    header: 'Application',
    read: (item) => item.application?.name || '',
  },
  'entitlement.entitlement': {
    header: 'Entitlement',
    read: (item) => item.descriptor?.idx?.['/entitlement']?.displayName || item.entitlement?.displayName || '',
  },
  'account.account': {
    // content is the account display name (the same shape the certification
    // table's Account column reads), falling back to the raw account path
    header: 'Account',
    read: (item) => item.descriptor?.idx?.['/account']?.displayName || item.keys?.accountId || item.account?.id || '',
  },
  'role.role': {
    // role items key the worklist by role, so the column is named for what it
    // holds rather than borrowing the entitlement slot's header
    header: 'Role',
    read: (item) => item.role?.name || '',
  },
};

/**
 * Per item type: the fallback column configuration — the same defaults the
 * template's column configuration tab starts from (baseColumnConfig.js),
 * minus the review columns (flags/comments/prediction are reviewer
 * annotations, not part of the remediation artifact) and with the resource
 * column kept for every type so the owner can see what to remediate. The
 * grant-shaped set also covers null (whole-worklist exports for mixed or
 * unknown campaigns), whose union field list is grant-shaped.
 */
const DEFAULT_COLUMN_CONFIG_BY_TYPE = {
  accountGrants: ['user.user', 'application.application', 'account.account'],
  entitlementGrants: ['user.user', 'application.application', 'account.account', 'entitlement.entitlement'],
  roleMemberships: ['user.user', 'role.role'],
  roleCompositions: ['role.role'],
  entitlementCompositions: ['application.application', 'entitlement.entitlement'],
  identityProfiles: ['user.user'],
};
const NULL_TYPE_FALLBACK_COLUMNS = DEFAULT_COLUMN_CONFIG_BY_TYPE.entitlementGrants;

/**
 * Item-type group → the columns the remediation file must always carry,
 * regardless of the template configuration. Account-bearing types name the
 * account being revoked (display name, falling back to the raw path); role
 * types name the role. Without this pin, a template configuration that
 * dropped the column would produce a file the owner cannot act on.
 */
const REQUIRED_COLUMNS_BY_TYPE = {
  accountGrants: ['account.account'],
  entitlementGrants: ['account.account'],
  roleMemberships: ['role.role'],
  roleCompositions: ['role.role'],
};

/**
 * The columns a role-bearing export must never emit: 'entitlement.entitlement'
 * reads the entitlement slot, which is empty for roleMembership/role items —
 * a stale Entitlement header over blank cells.
 */
const EXCLUDED_COLUMNS_BY_TYPE = {
  roleMemberships: ['entitlement.entitlement'],
  roleCompositions: ['entitlement.entitlement'],
};

/**
 * Builds the CSV column mappers for one per-type export, from the campaign's
 * template configuration for that type's grant key.
 *
 * The context columns follow the campaign's template configuration
 * (uiConfig.columnConfig[grantKey], the same source the certifier's task table
 * renders from) — an admin who removed the Application column from the
 * accounts template gets no Application column in the accounts file, with one
 * exception per group: the Account column on account-bearing types and the
 * Role column on role types are always appended (REQUIRED_COLUMNS_BY_TYPE),
 * and a stale Entitlement column on role types is dropped
 * (EXCLUDED_COLUMNS_BY_TYPE) — a remediation file must name what to revoke.
 * Templates without a saved configuration fall back to the per-type defaults
 * above. The five upload-required columns (`Task ID` plus the four editable
 * ones) are always present regardless of configuration; the upload side
 * tolerates the variable context columns, so the round trip holds.
 *
 * Review columns (flags/comments/prediction) are reviewer annotations, not
 * part of the remediation artifact, and are skipped wherever they appear.
 * Custom glossary/filter-property columns translate to their item path the
 * same way convertColumnsToQueryFields does for the request fields.
 *
 * @param {string} itemType - a key into REVOKES_ITEM_TYPES, or null for the
 *   whole-worklist export.
 * @param {Object} [columnConfig] - the campaign's uiConfig.columnConfig.
 * @param {string} [certificationType] - the campaign's certificationType; with
 *   a null itemType it selects the fallback grant key (identity campaigns
 *   configure their columns under 'accounts') and default columns.
 * @returns {Array<Function>} mappers, each (item) => one CSV row object.
 */
export function buildRevokesExportMappers(itemType, columnConfig = {}, certificationType = null) {
  const fallbackType = itemType || getSingleRevokesTypeForCampaign(certificationType);
  const grantKey = REVOKES_ITEM_TYPES[fallbackType]?.grantKey
    || (certificationType ? GRANT_KEY_BY_CERTIFICATION_TYPE[certificationType] : null)
    || itemType;
  const configuredColumns = columnConfig?.[grantKey]?.length
    ? columnConfig[grantKey]
    : (DEFAULT_COLUMN_CONFIG_BY_TYPE[fallbackType] || NULL_TYPE_FALLBACK_COLUMNS);
  // the account/role column cannot be configured away; a stale Entitlement
  // column on role types reads an empty slot and is dropped
  const requiredColumns = REQUIRED_COLUMNS_BY_TYPE[fallbackType] || [];
  const excludedColumns = EXCLUDED_COLUMNS_BY_TYPE[fallbackType] || [];
  const columns = [...new Set([
    ...configuredColumns.filter((columnString) => !excludedColumns.includes(columnString)),
    ...requiredColumns,
  ])];

  const mappers = [];
  // Task ID always leads the row — it is the upload's reconciliation key.
  mappers.push((item) => ({ 'Task ID': item.id ?? '' }));
  columns.forEach((columnString) => {
    const reader = COLUMN_STRING_READERS[columnString];
    if (reader) {
      mappers.push((item) => ({ [reader.header]: reader.read(item) }));
      return;
    }
    const [category, ...keyParts] = columnString.split('.');
    const key = keyParts.join('.');
    // reviewer annotations never belong in a remediation artifact
    if (category === 'review' || key === 'selector') return;
    if (key.startsWith('glossary.')) {
      // custom glossary column: 'user.glossary.department' reads
      // item.glossary.idx['/user'].department — the same shape
      // convertColumnsToQueryFields requests for the download
      const glossaryKey = key.substring('glossary.'.length);
      mappers.push((item) => ({
        [columnString]: item.glossary?.idx?.[`/${category}`]?.[glossaryKey] ?? '',
      }));
      return;
    }
    // filter-property column: 'user.department' reads item.user.department
    mappers.push((item) => ({
      [columnString]: getNestedPath(item, columnString) ?? '',
    }));
  });
  mappers.push((item) => editableColumns(item));
  return mappers;
}

/**
 * Builds the static targetFilter payload for one per-type revokes download:
 * the fixed signed-off/revoke/unremediated clauses ANDed with an item.type
 * clause for the group (the same IN expansion the campaign snapshot uses —
 * see normalizeCertificationTypes backend-side).
 * @param {string} itemType - a key into REVOKES_ITEM_TYPES.
 * @returns {Object} targetFilter for the items/search request body.
 */
export function buildRevokesExportTargetFilter(itemType) {
  const group = REVOKES_ITEM_TYPES[itemType];
  const operands = [
    {
      operator: 'EQUALS',
      operand: { targetName: 'decision.certification.status', targetValue: 'signed-off' },
    },
    {
      operator: 'EQUALS',
      operand: { targetName: 'decision.certification.decision', targetValue: 'revoke' },
    },
    {
      operator: 'NOT',
      operand: [{
        operator: 'IN',
        operand: {
          targetName: 'decision.certification.remediationStatus',
          targetValue: [...FINAL_REMEDIATION_STATUSES],
        },
      }],
    },
  ];
  if (group) {
    operands.push({
      operator: 'IN',
      operand: {
        targetName: 'item.type',
        targetValue: [...group.itemTypes],
      },
    });
  }
  return { operator: 'AND', operand: operands };
}
